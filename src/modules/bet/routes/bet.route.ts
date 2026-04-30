import type { FastifyInstance } from 'fastify'
import { betController } from '../instances/bet.instance'
import {
  createBetSchema,
  editBetSchema,
  listBetsByUserSchema,
} from '../schemas/bet.schema'

export async function betRoute(app: FastifyInstance) {
  app.post(
    '/users/:userId/games/:gameId/bets',
    createBetSchema,
    (request, reply) => betController.create(request, reply)
  )

  app.put('/bets/:id/users/:userId', editBetSchema, (request, reply) =>
    betController.edit(request, reply)
  )

  app.get('/users/:userId/bets', listBetsByUserSchema, (request, reply) =>
    betController.listByUser(request, reply)
  )
}
