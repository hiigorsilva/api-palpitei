import type { FastifyInstance } from 'fastify'
import { rankingController } from '../instances/ranking.instance'
import {
  getEstatisticasUsuarioSchema,
  getPosicaoUsuarioSchema,
  getRankingPontosSchema,
  getRankingTaxaSchema,
} from '../schemas/ranking.schema'

export async function rankingRoute(app: FastifyInstance) {
  app.get('/ranking/pontos', getRankingPontosSchema, (request, reply) =>
    rankingController.getRankingPontos(request, reply)
  )

  app.get('/ranking/taxa', getRankingTaxaSchema, (request, reply) =>
    rankingController.getRankingTaxaAcerto(request, reply)
  )

  app.get(
    '/ranking/users/:userId/position',
    getPosicaoUsuarioSchema,
    (request, reply) => rankingController.getPosicaoUsuario(request, reply)
  )

  app.get(
    '/ranking/users/:userId',
    getEstatisticasUsuarioSchema,
    (request, reply) => rankingController.getEstatisticasUsuario(request, reply)
  )
}
