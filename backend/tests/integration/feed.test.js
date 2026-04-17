const request = require('supertest');

process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5433/mural_maz_lince_dev';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret';
process.env.PORT = '0';
process.env.NODE_ENV = 'test';
process.env.INTENTION_THRESHOLD_MS = '5000';

const app = require('../../src/app');
const db = require('../../src/db');

describe('Feed / Projects / Interactions / Reports — Integration', () => {
  const pool = db.getPool();

  const randomMatricula = () => `2${Math.floor(1000000 + Math.random() * 8999999)}`;

  async function createEntrepreneurAgent() {
    const matricula = randomMatricula();
    await request(app).post('/auth/register/entrepreneur').send({
      matricula,
      password: 'password123',
      whatsapp_number: '6692001234',
      display_name: `Lince ${matricula.slice(-3)}`,
      privacy_accepted: true,
    });

    const loginRes = await request(app).post('/auth/login').send({
      matricula,
      password: 'password123',
    });

    return {
      cookie: loginRes.headers['set-cookie'][0],
      matricula,
    };
  }

  async function createVisitorAgent() {
    const matricula = randomMatricula();
    await request(app).post('/auth/register/student').send({ matricula });
    const loginRes = await request(app).post('/auth/login').send({ matricula });
    return {
      cookie: loginRes.headers['set-cookie'][0],
      matricula,
    };
  }

  async function createProject(cookie, name = 'Proyecto Sprint 9') {
    const response = await request(app)
      .post('/projects')
      .set('Cookie', cookie)
      .send({ name, description: 'Desc', category_id: 1 });
    return response.body.project;
  }

  async function createAnnouncement(cookie, projectId, title = 'Anuncio') {
    const response = await request(app)
      .post('/announcements')
      .set('Cookie', cookie)
      .send({
        project_id: projectId,
        title,
        description: 'Detalle',
        category_id: 1,
        cloudinary_url: 'https://cdn.test/img.png',
        cloudinary_id: 'img_1',
        expires_at: '2099-12-31T23:59:59.000Z',
      });
    return response.body.announcement;
  }

  async function cleanupData() {
    await db.query('DELETE FROM notifications');
    await db.query('DELETE FROM moderation_queue');
    await db.query('DELETE FROM reports');
    await db.query('DELETE FROM ratings');
    await db.query('DELETE FROM likes');
    await db.query('DELETE FROM image_hashes');
    await db.query('DELETE FROM announcements');
    await db.query('DELETE FROM projects');
    await db.query('DELETE FROM entrepreneur_profiles');
    await db.query("DELETE FROM users WHERE role <> 'admin'");
  }

  beforeAll(async () => {
    await cleanupData();
  });

  beforeEach(async () => {
    await cleanupData();
  });

  afterAll(async () => {
    await pool.end();
  });

  it('pagina feed por cursor con orden descendente', async () => {
    const entrepreneur = await createEntrepreneurAgent();
    const projects = [];
    for (let p = 0; p < 5; p += 1) {
      // eslint-disable-next-line no-await-in-loop
      projects.push(await createProject(entrepreneur.cookie, `Proyecto Feed Cursor ${p}`));
    }

    for (let i = 0; i < 23; i += 1) {
      const targetProject = projects[i % projects.length];
      // eslint-disable-next-line no-await-in-loop
      await createAnnouncement(entrepreneur.cookie, targetProject.id, `Anuncio-${i}`);
    }

    const page1 = await request(app).get('/announcements?limit=10');
    expect(page1.statusCode).toBe(200);
    expect(page1.body.announcements.length).toBe(10);
    expect(page1.body.nextCursor).toBeDefined();
    expect(page1.body.hasMore).toBe(true);

    const idsPage1 = page1.body.announcements.map((a) => a.id);
    expect(idsPage1).toEqual([...idsPage1].sort((a, b) => b - a));

    const page2 = await request(app).get(`/announcements?limit=10&cursor=${page1.body.nextCursor}`);
    expect(page2.statusCode).toBe(200);
    expect(page2.body.announcements.length).toBe(5);
  });

  it('limita creación a 5 proyectos activos por emprendedor', async () => {
    const entrepreneur = await createEntrepreneurAgent();

    for (let i = 0; i < 5; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const res = await request(app)
        .post('/projects')
        .set('Cookie', entrepreneur.cookie)
        .send({ name: `Proyecto ${i}`, description: 'd', category_id: 1 });
      expect(res.statusCode).toBe(201);
    }

    const sixth = await request(app)
      .post('/projects')
      .set('Cookie', entrepreneur.cookie)
      .send({ name: 'Proyecto 6', description: 'd', category_id: 1 });
    expect(sixth.statusCode).toBe(409);
  });

  it('marca like accidental al revertir en menos de 5s', async () => {
    const entrepreneur = await createEntrepreneurAgent();
    const visitor = await createVisitorAgent();
    const project = await createProject(entrepreneur.cookie, 'Proyecto Like Acc');
    const announcement = await createAnnouncement(entrepreneur.cookie, project.id, 'Like Acc');

    const likeRes = await request(app)
      .post(`/announcements/${announcement.id}/like`)
      .set('Cookie', visitor.cookie);
    expect(likeRes.statusCode).toBe(200);

    const unlikeRes = await request(app)
      .post(`/announcements/${announcement.id}/like`)
      .set('Cookie', visitor.cookie);
    expect(unlikeRes.statusCode).toBe(200);
    expect(unlikeRes.body.is_accidental).toBe(true);
  });

  it('marca like válido al revertir después de 5s', async () => {
    const entrepreneur = await createEntrepreneurAgent();
    const visitor = await createVisitorAgent();
    const project = await createProject(entrepreneur.cookie, 'Proyecto Like Val');
    const announcement = await createAnnouncement(entrepreneur.cookie, project.id, 'Like Val');

    await request(app)
      .post(`/announcements/${announcement.id}/like`)
      .set('Cookie', visitor.cookie);

    await db.query(
      "UPDATE likes SET created_at = NOW() - INTERVAL '10 seconds' WHERE announcement_id = $1",
      [announcement.id],
    );

    const unlikeRes = await request(app)
      .post(`/announcements/${announcement.id}/like`)
      .set('Cookie', visitor.cookie);
    expect(unlikeRes.statusCode).toBe(200);
    expect(unlikeRes.body.is_accidental).toBe(false);
  }, 12000);

  it('bloquea reporte duplicado del mismo usuario/anuncio', async () => {
    const entrepreneur = await createEntrepreneurAgent();
    const visitor = await createVisitorAgent();
    const project = await createProject(entrepreneur.cookie, 'Proyecto Reporte');
    const announcement = await createAnnouncement(entrepreneur.cookie, project.id, 'Reporte');

    const first = await request(app)
      .post(`/announcements/${announcement.id}/report`)
      .set('Cookie', visitor.cookie)
      .send({ reason: 'spam' });
    expect(first.statusCode).toBe(201);

    const second = await request(app)
      .post(`/announcements/${announcement.id}/report`)
      .set('Cookie', visitor.cookie)
      .send({ reason: 'spam' });
    expect(second.statusCode).toBe(409);
  });

  it('métricas de proyecto excluyen likes accidentales', async () => {
    const entrepreneur = await createEntrepreneurAgent();
    const visitor = await createVisitorAgent();
    const project = await createProject(entrepreneur.cookie, 'Proyecto Métricas');
    const announcement = await createAnnouncement(entrepreneur.cookie, project.id, 'Métricas');

    await request(app)
      .post(`/announcements/${announcement.id}/like`)
      .set('Cookie', visitor.cookie);
    await request(app)
      .post(`/announcements/${announcement.id}/like`)
      .set('Cookie', visitor.cookie);

    const metricsRes = await request(app)
      .get(`/projects/${project.id}`)
      .set('Cookie', entrepreneur.cookie);

    expect(metricsRes.statusCode).toBe(200);
    expect(metricsRes.body.metrics.valid_likes).toBe(0);
  });

  it('nunca expone whatsapp_number en feed ni detalle', async () => {
    const entrepreneur = await createEntrepreneurAgent();
    const visitor = await createVisitorAgent();
    const project = await createProject(entrepreneur.cookie, 'Proyecto WA');
    const announcement = await createAnnouncement(entrepreneur.cookie, project.id, 'Detalle WA');

    const feedRes = await request(app).get('/announcements');
    expect(feedRes.statusCode).toBe(200);
    expect(JSON.stringify(feedRes.body)).not.toContain('whatsapp_number');
    expect(JSON.stringify(feedRes.body)).not.toContain('6692001234');

    const detailPublic = await request(app).get(`/announcements/${announcement.id}`);
    expect(detailPublic.statusCode).toBe(200);
    expect(detailPublic.body.announcement.wa_link).toBe(null);
    expect(JSON.stringify(detailPublic.body)).not.toContain('whatsapp_number');

    const detailAuth = await request(app)
      .get(`/announcements/${announcement.id}`)
      .set('Cookie', visitor.cookie);
    expect(detailAuth.statusCode).toBe(200);
    expect(detailAuth.body.announcement.wa_link).toContain('https://wa.me/');
    expect(JSON.stringify(detailAuth.body)).not.toContain('whatsapp_number');
  });
});
