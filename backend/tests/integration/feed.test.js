const request = require('supertest');

process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5433/mural_maz_lince_dev';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret';
process.env.PORT = '0';
process.env.NODE_ENV = 'test';
process.env.INTENTION_THRESHOLD_MS = '5000';
process.env.CLOUDINARY_MOCK = 'true';
process.env.VISION_MOCK = 'true';
process.env.HASH_DISTANCE_THRESHOLD = '-1';

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
    const tinyPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADUlEQVR42mP8/5+hHgAHggJ/PX3yvQAAAABJRU5ErkJggg==';
    const response = await request(app)
      .post('/announcements')
      .set('Cookie', cookie)
      .send({
        project_id: projectId,
        title,
        description: 'Detalle',
        category_id: 1,
        custom_category: 'general',
        image_base64: tinyPngBase64,
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
    process.env.VISION_MOCK_RESULT = 'safe';
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

  it('moderación por bad-words envía anuncio a pending_review', async () => {
    const entrepreneur = await createEntrepreneurAgent();
    const project = await createProject(entrepreneur.cookie, 'Proyecto Moderación');
    const tinyPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADUlEQVR42mP8/5+hHgAHggJ/PX3yvQAAAABJRU5ErkJggg==';
    const response = await request(app)
      .post('/announcements')
      .set('Cookie', entrepreneur.cookie)
      .send({
        project_id: project.id,
        title: 'Oferta',
        description: 'puta promo',
        category_id: 1,
        custom_category: 'general',
        image_base64: tinyPngBase64,
        expires_at: '2099-12-31T23:59:59.000Z',
      });

    expect(response.statusCode).toBe(202);
    expect(response.body.announcement.status).toBe('pending_review');
  });

  it('timeout de Vision envía anuncio a pending_review con trigger vision', async () => {
    process.env.VISION_MOCK_RESULT = 'timeout';
    const entrepreneur = await createEntrepreneurAgent();
    const project = await createProject(entrepreneur.cookie, 'Proyecto Vision');
    const announcement = await createAnnouncement(entrepreneur.cookie, project.id, 'Vision Timeout');

    expect(announcement.status).toBe('pending_review');
    const queue = await db.query(
      'SELECT trigger_type, trigger_detail FROM moderation_queue WHERE announcement_id = $1',
      [announcement.id],
    );
    expect(queue.rows.some((row) => row.trigger_type === 'vision_api')).toBe(true);
    expect(queue.rows.some((row) => String(row.trigger_detail).includes('vision_api_timeout'))).toBe(true);
  });

  it('admin aprueba anuncio pendiente y lo activa', async () => {
    process.env.VISION_MOCK_RESULT = 'timeout';
    const entrepreneur = await createEntrepreneurAgent();
    const project = await createProject(entrepreneur.cookie, 'Proyecto Admin Approve');
    const announcement = await createAnnouncement(entrepreneur.cookie, project.id, 'Pendiente');
    expect(announcement.status).toBe('pending_review');

    const adminMatricula = randomMatricula();
    await request(app).post('/auth/register/entrepreneur').send({
      matricula: adminMatricula,
      password: 'password123',
      whatsapp_number: '6692001234',
      display_name: 'Admin Lince',
      privacy_accepted: true,
    });
    await db.query("UPDATE users SET role = 'admin' WHERE matricula = $1", [adminMatricula]);
    const adminLogin = await request(app).post('/auth/login').send({
      matricula: adminMatricula,
      password: 'password123',
    });

    const approve = await request(app)
      .patch(`/admin/announcements/${announcement.id}/approve`)
      .set('Cookie', adminLogin.headers['set-cookie'][0]);
    expect(approve.statusCode).toBe(200);

    const current = await db.query('SELECT status FROM announcements WHERE id = $1', [announcement.id]);
    expect(current.rows[0].status).toBe('active');
  });

  it('admin rechaza anuncio pendiente y marca rejected', async () => {
    process.env.VISION_MOCK_RESULT = 'timeout';
    const entrepreneur = await createEntrepreneurAgent();
    const project = await createProject(entrepreneur.cookie, 'Proyecto Admin Reject');
    const announcement = await createAnnouncement(entrepreneur.cookie, project.id, 'Pendiente 2');
    expect(announcement.status).toBe('pending_review');

    const adminMatricula = randomMatricula();
    await request(app).post('/auth/register/entrepreneur').send({
      matricula: adminMatricula,
      password: 'password123',
      whatsapp_number: '6692001234',
      display_name: 'Admin Lince 2',
      privacy_accepted: true,
    });
    await db.query("UPDATE users SET role = 'admin' WHERE matricula = $1", [adminMatricula]);
    const adminLogin = await request(app).post('/auth/login').send({
      matricula: adminMatricula,
      password: 'password123',
    });

    const reject = await request(app)
      .post(`/admin/announcements/${announcement.id}/reject`)
      .set('Cookie', adminLogin.headers['set-cookie'][0])
      .send({ reason: 'Contenido no permitido' });
    expect(reject.statusCode).toBe(200);

    const current = await db.query('SELECT status FROM announcements WHERE id = $1', [announcement.id]);
    expect(current.rows[0].status).toBe('rejected');
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
