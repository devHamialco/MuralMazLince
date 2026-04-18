const path = require('path')
const request = require('supertest')
const app = require('../../src/app')
const { execSync } = require('child_process')

describe('Auth Flow Integration Tests', () => {
  let agent

  beforeAll(() => {
    // Ejecutar migraciones para el DB de pruebas (si ya están, este comando debería ser seguro)
    try {
      execSync('npm run migrate:test', {
        cwd: path.resolve(__dirname, '../../'),
        stdio: 'inherit',
        shell: true,
      })
    } catch (e) {
      // Ignorar errores si ya está migrado
    }
    agent = request.agent(app)
  }, 120000)

  test('Register student', async () => {
    const res = await agent.post('/auth/register/student').send({ matricula: '20240001' })
    expect([201, 409]).toContain(res.status)
  })

  test('Register student duplicate', async () => {
    const res = await agent.post('/auth/register/student').send({ matricula: '20240001' })
    expect(res.status).toBe(409)
  })

  test('Register entrepreneur', async () => {
    const payload = {
      matricula: '20240002',
      password: 'Password1',
      whatsapp_number: '5512345678',
      display_name: 'EmpTest',
      privacy_accepted: true
    }
    const res = await agent.post('/auth/register/entrepreneur').send(payload)
    expect(res.status).toBe(201)
  })

  test('Login student (visitor) without password', async () => {
    const res = await agent.post('/auth/login').send({ matricula: '20240001' })
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('role')
  })

  test('Claim matricula', async () => {
    const res = await agent.post('/auth/claim-matricula').send({ disputed_matricula: '20240003', claimant_whatsapp: '5512345678' })
    expect(res.status).toBe(201)
  })
})
