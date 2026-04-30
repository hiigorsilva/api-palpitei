import type { FastifyInstance } from 'fastify'
import { basicAuth } from '../auth/auth'
import { adminController } from '../instances/admin.instance'
import {
  atualizarResultadoSchema,
  getDashboardSchema,
  recalcularPontuacaoSchema,
} from '../schemas/admin.schema'

export async function adminRoute(app: FastifyInstance) {
  app.addHook('preHandler', basicAuth)

  app.post('/admin/resultado', atualizarResultadoSchema, (request, reply) =>
    adminController.atualizarResultado(request, reply)
  )

  app.post('/admin/recalcular', recalcularPontuacaoSchema, (request, reply) =>
    adminController.recalcularPontuacao(request, reply)
  )

  app.get('/admin/dashboard', getDashboardSchema, (request, reply) =>
    adminController.getDashboard(request, reply)
  )
}
