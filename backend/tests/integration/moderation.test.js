const request = require('supertest');

process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5433/mural_maz_lince_dev';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret';
process.env.PORT = '0';
process.env.NODE_ENV = 'test';
process.env.CLOUDINARY_MOCK = 'true';
process.env.VISION_MOCK = 'true';
process.env.VISION_MOCK_RESULT = 'timeout';
process.env.HASH_DISTANCE_THRESHOLD = '-1';

const app = require('../../src/app');
const db = require('../../src/db');
const { runShadowbanJob, runShadowbanRestoreJob } = require('../../src/jobs/shadowbanJob');

describe('Moderación Sprint 10 — Integration', () => {
  const pool = db.getPool();

  const randomMatricula = () => `2${Math.floor(1000000 + Math.random() * 8999999)}`;
  const tinyPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADUlEQVR42mP8/5+hHgAHggJ/PX3yvQAAAABJRU5ErkJggg==';

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

  async function createUser(role = 'entrepreneur') {
    const matricula = randomMatricula();
    await request(app).post('/auth/register/entrepreneur').send({
      matricula,
      password: 'password123',
      whatsapp_number: '6692001234',
      display_name: `User ${matricula.slice(-3)}`,
      privacy_accepted: true,
    });
    if (role === 'admin') {
      await db.query("UPDATE users SET role = 'admin' WHERE matricula = $1", [matricula]);
    } else if (role === 'visitor_registered') {
      await db.query("UPDATE users SET role = 'visitor_registered' WHERE matricula = $1", [matricula]);
    }
    const login = await request(app).post('/auth/login').send({
      matricula,
      password: role === 'visitor_registered' ? undefined : 'password123',
    });
    return { matricula, cookie: login.headers['set-cookie'][0] };
  }

  async function createAnnouncementFor(entrepreneurCookie) {
    const projectRes = await request(app)
      .post('/projects')
      .set('Cookie', entrepreneurCookie)
      .send({ name: 'Proyecto Shadowban', description: 'D', category_id: 1 });
    const projectId = projectRes.body.project.id;

    const announcementRes = await request(app)
      .post('/announcements')
      .set('Cookie', entrepreneurCookie)
      .send({
        project_id: projectId,
        title: 'Anuncio Moderado',
        description: 'detalle',
        category_id: 1,
        custom_category: 'general',
        image_base64: tinyPngBase64,
        expires_at: '2099-12-31T23:59:59.000Z',
      });
    return announcementRes.body.announcement;
  }

  beforeEach(async () => {
    await cleanupData();
    process.env.VISION_MOCK_RESULT = 'timeout';
  });

  afterAll(async () => {
    await cleanupData();
    await pool.end();
  });

  it('lista cola de moderación para anuncios pendientes por vision', async () => {
    process.env.VISION_MOCK_RESULT = 'timeout';
    const entrepreneur = await createUser('entrepreneur');
    const admin = await createUser('admin');

    const pending = await createAnnouncementFor(entrepreneur.cookie);
    expect(pending.status).toBe('pending_review');

    const queue = await request(app)
      .get('/admin/moderation-queue')
      .set('Cookie', admin.cookie);

    expect(queue.statusCode).toBe(200);
    expect(queue.body.queue.length).toBeGreaterThan(0);
    expect(queue.body.queue.some((row) => row.trigger_type === 'vision_api')).toBe(true);
  });

  it('aplica shadowban a anuncio con 5 reportes tras 12h de inacción', async () => {
    process.env.VISION_MOCK_RESULT = 'safe';
    const entrepreneur = await createUser('entrepreneur');
    const announcement = await createAnnouncementFor(entrepreneur.cookie);
    expect(announcement.status).toBe('active');

    const reporters = [];
    for (let i = 0; i < 5; i += 1) {
      const matricula = randomMatricula();
      await request(app).post('/auth/register/student').send({ matricula });
      const login = await request(app).post('/auth/login').send({ matricula });
      reporters.push(login.headers['set-cookie'][0]);
    }

    for (const cookie of reporters) {
      // eslint-disable-next-line no-await-in-loop
      const reportRes = await request(app)
        .post(`/announcements/${announcement.id}/report`)
        .set('Cookie', cookie)
        .send({ reason: 'spam' });
      expect(reportRes.statusCode).toBe(201);
    }

    await db.query(
      "UPDATE moderation_queue SET urgency_alert_at = NOW() - INTERVAL '13 hours' WHERE announcement_id = $1",
      [announcement.id],
    );

    await runShadowbanJob();
    const current = await db.query('SELECT status FROM announcements WHERE id = $1', [announcement.id]);
    expect(current.rows[0].status).toBe('shadowban');
  });

  it('restaura shadowban automáticamente a las 48h', async () => {
    process.env.VISION_MOCK_RESULT = 'safe';
    const entrepreneur = await createUser('entrepreneur');
    const announcement = await createAnnouncementFor(entrepreneur.cookie);
    await db.query("UPDATE announcements SET status = 'shadowban' WHERE id = $1", [announcement.id]);
    await db.query(
      "INSERT INTO moderation_queue (announcement_id, trigger_type, trigger_detail, shadowban_at) VALUES ($1, 'report_threshold', 'manual', NOW() - INTERVAL '49 hours')",
      [announcement.id],
    );

    await runShadowbanRestoreJob();
    const current = await db.query('SELECT status FROM announcements WHERE id = $1', [announcement.id]);
    expect(current.rows[0].status).toBe('active');
  });

  it('genera PNG de QR en endpoint admin', async () => {
    const admin = await createUser('admin');
    const qr = await request(app)
      .get('/admin/qr')
      .set('Cookie', admin.cookie);

    expect(qr.statusCode).toBe(200);
    expect(qr.headers['content-type']).toMatch(/image\/png/);
  });
});
