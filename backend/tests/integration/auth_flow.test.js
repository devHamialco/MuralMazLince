// El helper fija DATABASE_URL en mural_maz_lince_test y lanza un error fatal
// si ya apuntara a otra BD. DEBE importarse ANTES de app/db.
const { runTestMigrations } = require('../helpers/testDatabase')
const request = require('supertest')

process.env.JWT_SECRET = 'test_secret'
process.env.PORT = '0'
process.env.NODE_ENV = 'test'

const app = require('../../src/app')

describe('Auth Flow Integration Tests', () => {
  let agent

  // Recrea schema + seed en mural_maz_lince_test (sin try/catch: si la
  // migración falla, el fallo debe ser explícito y no 'relation does not exist').
  beforeAll(() => {
    runTestMigrations()
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
      whatsapp_number: '+525512345678',
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
    const res = await agent.post('/auth/claim-matricula').send({ disputed_matricula: '20240003', claimant_whatsapp: '+525512345678' })
    expect(res.status).toBe(201)
  })
})
