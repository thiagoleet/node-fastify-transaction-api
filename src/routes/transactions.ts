import { randomUUID } from 'node:crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'

export async function transactionsRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const transactions = await knex('transactions').select('*')

    return {
      total: transactions.length,
      transactions,
    }
  })

  app.get('/:id', async (request) => {
    const getTransactionParamsSchema = z.object({ id: z.string().uuid() })

    const { id } = getTransactionParamsSchema.parse(request.params)

    const transaction = await knex('transactions')
      .select('*')
      .where({ id })
      .first()

    return { transaction }
  })

  app.get('/summary', async () => {
    const summary = await knex('transactions')
      .sum('amount', {
        as: 'ammount',
      })
      .first()

    return { summary }
  })

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
}
