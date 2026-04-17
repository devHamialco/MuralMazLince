const request = require('supertest');
const { Pool } = require('pg');

// Debemos mockear .env si no existe, O inyectar la URL antes de cargar app
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5433/mural_maz_lince_dev';
process.env.JWT_SECRET = 'test_secret';
process.env.PORT = '0'; // Puerto estocastico
process.env.NODE_ENV = 'test';

// Cargamos Express (Inicia su propia pool DB con DATABASE_URL)
const app = require('../../src/app.js'); // Assuming app.js exports app

describe('Auth Endpoints Integration Tests', () => {
    // Referencia directa al test db para limpiezas si es necesario
    const pool = require('../../src/db').getPool();
    
    // Generar matrícula dinámica para evitar choques en db sucia si es que no se limpia
    const timestampMatricula = () => '2' + Math.floor(1000000 + Math.random() * 9000000).toString().substring(0, 7);

    beforeAll(async () => {
        // En una suite completa invocaríamos DROP SCHEMA / runMigrations desde node aqui.
    });

    afterAll(async () => {
        await pool.end();
    });

    describe('POST /auth/register/student', () => {
        it('Registra a un estudiante y devuelve 201', async () => {
            const mat = timestampMatricula();
            const res = await request(app)
                .post('/auth/register/student')
                .send({ matricula: mat });
            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('userId');
        });

        it('Devuelve 409 si la matrícula se registra dos veces', async () => {
            const mat = timestampMatricula();
            await request(app).post('/auth/register/student').send({ matricula: mat });
            const res = await request(app)
                .post('/auth/register/student')
                .send({ matricula: mat });
            expect(res.statusCode).toEqual(409);
        });
        
        it('Devuelve 400 con matrícula inválida', async () => {
            const res = await request(app).post('/auth/register/student').send({ matricula: 'abc' });
            expect(res.statusCode).toEqual(400);
        });
    });

    describe('POST /auth/register/entrepreneur', () => {
        it('Devuelve 400 si no se aceptan las políticas de privacidad explícitamente', async () => {
            const res = await request(app)
                .post('/auth/register/entrepreneur')
                .send({
                    matricula: timestampMatricula(),
                    password: 'password123',
                    whatsapp_number: '1234567890',
                    display_name: 'Super Tienda'
                    // privacy_accepted is missing
                });
            expect(res.statusCode).toEqual(400);
            expect(res.body.error).toContain('aviso de privacidad');
        });

        it('Falla por palabras groseras (bad-words)', async () => {
            const res = await request(app)
                .post('/auth/register/entrepreneur')
                .send({
                    matricula: timestampMatricula(),
                    password: 'password123',
                    whatsapp_number: '1234567890',
                    display_name: 'Puta Tienda', // bad word
                    privacy_accepted: true
                });
            expect(res.statusCode).toEqual(400);
        });

        it('Registra emprendedor con datos válidos', async () => {
            const mat = timestampMatricula();
            const res = await request(app)
                .post('/auth/register/entrepreneur')
                .send({
                    matricula: mat,
                    password: 'password123',
                    whatsapp_number: '1234567890',
                    display_name: 'Lince Store',
                    privacy_accepted: true
                });
            expect(res.statusCode).toEqual(201);
        });
    });

    describe('POST /auth/login', () => {
        it('Login ROL-02 sin contraseña devuelve HttpOnly token', async () => {
            const mat = timestampMatricula();
            await request(app).post('/auth/register/student').send({ matricula: mat });
            
            const res = await request(app)
                .post('/auth/login')
                .send({ matricula: mat });

            expect(res.statusCode).toEqual(200);
            expect(res.headers['set-cookie']).toBeDefined();
            expect(res.headers['set-cookie'][0]).toMatch(/token=/);
            expect(res.headers['set-cookie'][0]).toMatch(/HttpOnly/);
        });

        it('Falla (401) si ROL-02 intenta login como emprendedor omitiendo la contraseña (cross-role constraint)', async () => {
            const mat = timestampMatricula();
            await request(app)
                .post('/auth/register/entrepreneur')
                .send({
                    matricula: mat,
                    password: 'password123',
                    whatsapp_number: '1234567890',
                    display_name: 'Lince Store',
                    privacy_accepted: true
                });
            
            const res = await request(app)
                .post('/auth/login')
                .send({ matricula: mat }); // Omit password
            
            expect(res.statusCode).toEqual(401);
            expect(res.body.error).toContain('contraseña');
        });
        
        it('Revoca login (403) si is_suspended es true', async () => {
            const mat = timestampMatricula();
            // Creamos usuario
            await request(app).post('/auth/register/student').send({ matricula: mat });
            
            // Suspendemos en base de datos.
            await pool.query('UPDATE users SET is_suspended = true WHERE matricula = $1', [mat]);
            
            const res = await request(app)
                .post('/auth/login')
                .send({ matricula: mat });
            
            expect(res.statusCode).toEqual(403);
            expect(res.body.error).toContain('Cuenta suspendida');
        });
    });

    describe('GET /auth/privacy', () => {
        it('Retorna html del LFPDPPP con status 200', async () => {
            const res = await request(app).get('/auth/privacy');
            expect(res.statusCode).toEqual(200);
            expect(res.text).toContain('LFPDPPP');
            expect(res.text).toContain('ARCO');
            expect(res.text).toContain('Identidad del Responsable');
        });
    });
});
