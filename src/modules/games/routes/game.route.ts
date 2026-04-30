import type { FastifyInstance } from 'fastify'
import { gameController } from '../instances/user.instance'
import { getGameByIdSchema, listGamesSchema } from '../schemas/game.schema'

export async function gameRoute(app: FastifyInstance) {
  app.get('/games', listGamesSchema, (request, reply) =>
    gameController.listAll(request, reply)
  )

  app.get('/games/:id', getGameByIdSchema, (request, reply) =>
    gameController.getById(request, reply)
  )
}
