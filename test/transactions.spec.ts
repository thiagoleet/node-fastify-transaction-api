import { execSync } from 'node:child_process'
import {
  expect,
  it,
  beforeAll,
  afterAll,
  describe,
  beforeEach,
  afterEach,
} from 'vitest'
import { app } from '../src/app'
import request from 'supertest'

describe('Transactions Routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:latest')
  })

  afterEach(() => {
    execSync('npm run knex migrate:rollback')
  })

  it('should be able user can create a new transaction', async () => {
    const response = await request(app.server).post('/transactions').send({
      title: 'New Transaction',
      amount: 5000,
      type: 'credit',
    })

    expect(response.status).toBe(201)
  })

  it('should be able to list all transactions', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New Transaction',
        amount: 5000,
        type: 'credit',
      })

    const cookies = createTransactionResponse.get('Set-Cookie') ?? []

    const response = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    expect(response.body.transactions).toEqual([
      expect.objectContaining({
        title: 'New Transaction',
        amount: 5000,
      }),
    ])
  })
})
