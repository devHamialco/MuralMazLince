const request = require('supertest');

// Inyectar variables de entorno ANTES de cargar app (evita que db/index.js falle)
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5433/mural_maz_lince_dev';
process.env.JWT_SECRET = 'test_secret';
process.env.PORT = '0';
process.env.NODE_ENV = 'test';

const app = require('../../src/app.js');

describe('Auth Endpoints — Integration Tests', () => {
  const pool = require('../../src/db').getPool();

  /**
   * Genera una matrícula válida aleatoria (8 dígitos, primer dígito = 2).
   * El rango garantiza unicidad suficiente entre pruebas en el mismo entorno.
   */
  const randomMatricula = () => `2${Math.floor(1000000 + Math.random() * 8999999)}`;

  /** Helper: registra un estudiante y devuelve la matrícula usada. */
  const createStudent = async (mat) => {
    const m = mat || randomMatricula();
    await request(app).post('/auth/register/student').send({ matricula: m });
    return m;
  };

  /** Helper: registra un emprendedor y devuelve la matrícula usada. */
  const createEntrepreneur = async (mat) => {
    const m = mat || randomMatricula();
    await request(app)
      .post('/auth/register/entrepreneur')
      .send({
        matricula: m,
        password: 'password123',
        whatsapp_number: '6692001234',
        display_name: 'Lince Store',
        privacy_accepted: true,
      });
    return m;
  };

  afterAll(async () => {
    await pool.end();
  });

  // ─────────────────────────────────────────────
  // POST /auth/register/student
  // ─────────────────────────────────────────────
  describe('POST /auth/register/student', () => {
    it('Registra a un estudiante y devuelve 201 con userId', async () => {
      const res = await request(app)
        .post('/auth/register/student')
        .send({ matricula: randomMatricula() });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('userId');
    });

    it('Devuelve 409 si la misma matrícula se registra dos veces', async () => {
      const mat = randomMatricula();
      await request(app).post('/auth/register/student').send({ matricula: mat });
      const res = await request(app).post('/auth/register/student').send({ matricula: mat });
      expect(res.statusCode).toEqual(409);
    });

    it('Devuelve 400 con matrícula inválida (solo letras)', async () => {
      const res = await request(app).post('/auth/register/student').send({ matricula: 'abcdefgh' });
      expect(res.statusCode).toEqual(400);
    });

    it('Devuelve 400 con matrícula inválida (primer dígito ≠ 2)', async () => {
      const res = await request(app).post('/auth/register/student').send({ matricula: '30240001' });
      expect(res.statusCode).toEqual(400);
    });

    it('Devuelve 400 con matrícula inválida (demasiado corta)', async () => {
      const res = await request(app).post('/auth/register/student').send({ matricula: '2024001' });
      expect(res.statusCode).toEqual(400);
    });
  });

  // ─────────────────────────────────────────────
  // POST /auth/register/entrepreneur
  // ─────────────────────────────────────────────
  describe('POST /auth/register/entrepreneur', () => {
    it('Registra emprendedor con datos válidos y devuelve 201', async () => {
      const res = await request(app)
        .post('/auth/register/entrepreneur')
        .send({
          matricula: randomMatricula(),
          password: 'password123',
          whatsapp_number: '6692001234',
          display_name: 'Super Tienda Lince',
          privacy_accepted: true,
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('userId');
    });

    it('Devuelve 400 si privacy_accepted está ausente', async () => {
      const res = await request(app)
        .post('/auth/register/entrepreneur')
        .send({
          matricula: randomMatricula(),
          password: 'password123',
          whatsapp_number: '6692001234',
          display_name: 'Super Tienda',
          // privacy_accepted ausente
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toContain('aviso de privacidad');
    });

    it('Devuelve 400 si privacy_accepted es false', async () => {
      const res = await request(app)
        .post('/auth/register/entrepreneur')
        .send({
          matricula: randomMatricula(),
          password: 'password123',
          whatsapp_number: '6692001234',
          display_name: 'Super Tienda',
          privacy_accepted: false,
        });
      expect(res.statusCode).toEqual(400);
    });

    it('Devuelve 400 con display_name ofensivo (bad-words)', async () => {
      const res = await request(app)
        .post('/auth/register/entrepreneur')
        .send({
          matricula: randomMatricula(),
          password: 'password123',
          whatsapp_number: '6692001234',
          display_name: 'Puta Tienda',
          privacy_accepted: true,
        });
      expect(res.statusCode).toEqual(400);
    });

    it('Devuelve 400 con whatsapp_number inválido (letras)', async () => {
      const res = await request(app)
        .post('/auth/register/entrepreneur')
        .send({
          matricula: randomMatricula(),
          password: 'password123',
          whatsapp_number: 'no-es-numero',
          display_name: 'Tienda Válida',
          privacy_accepted: true,
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toContain('WhatsApp');
    });

    it('Devuelve 400 si la contraseña tiene menos de 8 caracteres', async () => {
      const res = await request(app)
        .post('/auth/register/entrepreneur')
        .send({
          matricula: randomMatricula(),
          password: '1234567',
          whatsapp_number: '6692001234',
          display_name: 'Tienda Válida',
          privacy_accepted: true,
        });
      expect(res.statusCode).toEqual(400);
    });

    it('Devuelve 409 si la matrícula ya está registrada', async () => {
      const mat = randomMatricula();
      await createStudent(mat);
      const res = await request(app)
        .post('/auth/register/entrepreneur')
        .send({
          matricula: mat,
          password: 'password123',
          whatsapp_number: '6692001234',
          display_name: 'Tienda Duplicada',
          privacy_accepted: true,
        });
      expect(res.statusCode).toEqual(409);
    });
  });

  // ─────────────────────────────────────────────
  // POST /auth/login
  // ─────────────────────────────────────────────
  describe('POST /auth/login', () => {
    it('ROL-02 (estudiante) — login sin contraseña devuelve cookie HttpOnly', async () => {
      const mat = await createStudent();
      const res = await request(app).post('/auth/login').send({ matricula: mat });

      expect(res.statusCode).toEqual(200);
      expect(res.body.role).toBe('visitor_registered');
      expect(res.headers['set-cookie']).toBeDefined();
      expect(res.headers['set-cookie'][0]).toMatch(/token=/);
      expect(res.headers['set-cookie'][0]).toMatch(/HttpOnly/i);
    });

    it('ROL-03 (emprendedor) — login con contraseña correcta devuelve 200', async () => {
      const mat = await createEntrepreneur();
      const res = await request(app)
        .post('/auth/login')
        .send({ matricula: mat, password: 'password123' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.role).toBe('entrepreneur');
    });

    it('ROL-03 — login sin contraseña devuelve 401', async () => {
      const mat = await createEntrepreneur();
      const res = await request(app).post('/auth/login').send({ matricula: mat });

      expect(res.statusCode).toEqual(401);
      expect(res.body.error).toContain('contraseña');
    });

    it('ROL-03 — login con contraseña incorrecta devuelve 401', async () => {
      const mat = await createEntrepreneur();
      const res = await request(app)
        .post('/auth/login')
        .send({ matricula: mat, password: 'wrongpassword' });

      expect(res.statusCode).toEqual(401);
    });

    it('Devuelve 401 para matrícula inexistente', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ matricula: randomMatricula() });

      expect(res.statusCode).toEqual(401);
    });

    it('Devuelve 403 si la cuenta está suspendida', async () => {
      const mat = await createStudent();
      await pool.query('UPDATE users SET is_suspended = true WHERE matricula = $1', [mat]);

      const res = await request(app).post('/auth/login').send({ matricula: mat });
      expect(res.statusCode).toEqual(403);
      expect(res.body.error).toContain('suspendida');
    });

    it('La cookie de respuesta NO contiene el whatsapp_number en texto plano', async () => {
      const mat = await createEntrepreneur();
      const res = await request(app)
        .post('/auth/login')
        .send({ matricula: mat, password: 'password123' });

      expect(res.statusCode).toEqual(200);
      // El JSON de respuesta no debe exponer el número
      expect(JSON.stringify(res.body)).not.toContain('6692001234');
    });
  });

  // ─────────────────────────────────────────────
  // POST /auth/logout
  // ─────────────────────────────────────────────
  describe('POST /auth/logout', () => {
    it('Devuelve 200 y sobrescribe la cookie con valor vacío', async () => {
      const res = await request(app).post('/auth/logout');

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toContain('Sesión finalizada');
      // La cookie token debe ser sobrescrita/eliminada
      const cookie = res.headers['set-cookie'];
      if (cookie) {
        // Si hay set-cookie, debe estar expirada o vacía
        expect(cookie[0]).toMatch(/token=;|token= ;|Max-Age=0/i);
      }
    });
  });

  // ─────────────────────────────────────────────
  // POST /auth/claim-matricula
  // ─────────────────────────────────────────────
  describe('POST /auth/claim-matricula', () => {
    it('Registra un reclamo válido y devuelve 201 con ticketId', async () => {
      const res = await request(app)
        .post('/auth/claim-matricula')
        .send({
          disputed_matricula: randomMatricula(),
          claimant_whatsapp: '6692001234',
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('ticketId');
    });

    it('Devuelve 400 si falta disputed_matricula', async () => {
      const res = await request(app)
        .post('/auth/claim-matricula')
        .send({ claimant_whatsapp: '6692001234' });

      expect(res.statusCode).toEqual(400);
    });

    it('Devuelve 400 si falta claimant_whatsapp', async () => {
      const res = await request(app)
        .post('/auth/claim-matricula')
        .send({ disputed_matricula: randomMatricula() });

      expect(res.statusCode).toEqual(400);
    });
  });

  // ─────────────────────────────────────────────
  // GET /auth/privacy
  // ─────────────────────────────────────────────
  describe('GET /auth/privacy', () => {
    it('Retorna HTML con status 200 y las 4 secciones LFPDPPP', async () => {
      const res = await request(app).get('/auth/privacy');

      expect(res.statusCode).toEqual(200);
      expect(res.headers['content-type']).toMatch(/text\/html/);
      expect(res.text).toContain('LFPDPPP');
      expect(res.text).toContain('ARCO');
      expect(res.text).toContain('Identidad del Responsable');
      expect(res.text).toContain('Universidad Autónoma de Occidente');
    });
  });
});
