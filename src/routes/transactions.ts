import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'

export async function transactionsRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body,
    )

    const id = randomUUID()

    await knex('transactions').insert({
      id,
      title,
      amount: type === 'credit' ? amount : -amount,
    })

    return reply.status(201).send({ message: 'Transaction created', id })
  })

  app.get('/', async (request, reply) => {})
}
