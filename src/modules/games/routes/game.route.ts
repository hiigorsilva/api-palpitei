import type { FastifyInstance } from 'fastify'
import { gameController } from '../instances/user.instance'
import {
  getGameByIdSchema,
  listBetsByGameSchema,
  listGamesSchema,
  listPendingGamesSchema,
  listTodayGamesSchema,
} from '../schemas/game.schema'

export async function gameRoute(app: FastifyInstance) {
  app.get('/games', listGamesSchema, (request, reply) =>
    gameController.listAll(request, reply)
  )

  app.get('/games/pendentes', listPendingGamesSchema, (request, reply) =>
    gameController.listPendentes(request, reply)
  )

  app.get('/games/hoje', listTodayGamesSchema, (request, reply) =>
    gameController.listHoje(request, reply)
  )

  app.get('/games/:id', getGameByIdSchema, (request, reply) =>
    gameController.getById(request, reply)
  )

  app.get('/games/:gameId/bets', listBetsByGameSchema, (request, reply) =>
    gameController.listBetsByGame(request, reply)
  )
}
