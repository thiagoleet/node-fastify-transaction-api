/* eslint-disable @typescript-eslint/no-explicit-any */
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

const creditTransaction = {
  title: 'Credit Transaction',
  amount: 5000,
  type: 'credit',
}

const debitTransaction = {
  title: 'Debit Transaction',
  amount: 2000,
  type: 'debit',
}

async function createTransaction(transaction: any, cookies: string[] = []) {
  const response = await request(app.server)
    .post('/transactions')
    .set('Cookie', cookies)
    .send(transaction)

  return response
}

function getCookie(response: request.Response) {
  return response.get('Set-Cookie') ?? []
}

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
    const response = await createTransaction(creditTransaction)

    expect(response.status).toBe(201)
  })

  it('should be able to list all transactions', async () => {
    const createTransactionResponse = await createTransaction(creditTransaction)
    const cookies = getCookie(createTransactionResponse)

    const response = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    expect(response.body.transactions).toEqual([
      expect.objectContaining({
        title: 'Credit Transaction',
        amount: 5000,
      }),
    ])
  })

  it('should be able to get an specific transaction', async () => {
    const createTransactionResponse = await createTransaction(creditTransaction)
    const cookies = getCookie(createTransactionResponse)

    const { id } = createTransactionResponse.body

    const response = await request(app.server)
      .get(`/transactions/${id}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(response.body.transaction).toEqual(
      expect.objectContaining({
        title: 'Credit Transaction',
        amount: 5000,
      }),
    )
  })

  it('should be able to get the summary', async () => {
    let createTransactionResponse = await createTransaction(creditTransaction)
    const cookies = getCookie(createTransactionResponse)

    createTransactionResponse = await createTransaction(
      debitTransaction,
      cookies,
    )

    const response = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookies)
      .expect(200)

    expect(response.body.summary).toEqual({ ammount: 3000 })
  })
})
