import type { FastifyInstance } from 'fastify'
import { basicAuth } from '../../admin/auth/auth'
import {
  syncAllSchema,
  syncGamesSchema,
  syncTeamsSchema,
  updateResultsSchema,
} from '../schemas/integration.schema'
import { integrationController } from './instance'

export async function integrationRoute(app: FastifyInstance) {
  // Todas as rotas protegidas (apenas admin)
  app.addHook('preHandler', basicAuth)

  app.post('/integration/sync/teams', syncTeamsSchema, (request, reply) =>
    integrationController.sincronizarTimes(request, reply)
  )

  app.post('/integration/sync/games', syncGamesSchema, (request, reply) =>
    integrationController.sincronizarJogos(request, reply)
  )

  app.post('/integration/sync/all', syncAllSchema, (request, reply) =>
    integrationController.sincronizarCompleto(request, reply)
  )

  app.post(
    '/integration/update/results',
    updateResultsSchema,
    (request, reply) =>
      integrationController.atualizarResultados(request, reply)
  )
}
