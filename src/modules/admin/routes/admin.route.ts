import type { FastifyInstance } from 'fastify'
import { basicAuth } from '../auth/auth'
import { adminController } from '../instances/admin.instance'
import {
  atualizarParticipantesJogoSchema,
  atualizarParticipantesLoteSchema,
  atualizarResultadoSchema,
  corrigirResultadoSchema,
  getDashboardSchema,
  inserirLoteResultadosSchema,
  popularBaseLocalSchema,
  recalcularPontuacaoSchema,
} from '../schemas/admin.schema'

export async function adminRoute(app: FastifyInstance) {
  app.addHook('preHandler', basicAuth)

  app.post('/admin/popular-base', popularBaseLocalSchema, (request, reply) =>
    adminController.popularBaseLocal(request, reply)
  )

  app.put(
    '/admin/jogos/:gameId/participantes',
    atualizarParticipantesJogoSchema,
    (request, reply) =>
      adminController.atualizarParticipantesJogoManual(request, reply)
  )

  app.put(
    '/admin/jogos/participantes/lote',
    atualizarParticipantesLoteSchema,
    (request, reply) =>
      adminController.atualizarParticipantesLoteManual(request, reply)
  )

  // Resultados
  app.post('/admin/resultado', atualizarResultadoSchema, (request, reply) =>
    adminController.atualizarResultado(request, reply)
  )

  app.put(
    '/admin/resultado/:gameId',
    corrigirResultadoSchema,
    (request, reply) => adminController.corrigirResultado(request, reply)
  )

  app.post(
    '/admin/resultados/lote',
    inserirLoteResultadosSchema,
    (request, reply) =>
      adminController.inserirMultiplosResultados(request, reply)
  )

  // Utilitários
  app.post('/admin/recalcular', recalcularPontuacaoSchema, (request, reply) =>
    adminController.recalcularPontuacao(request, reply)
  )

  app.get('/admin/dashboard', getDashboardSchema, (request, reply) =>
    adminController.getDashboard(request, reply)
  )
}
