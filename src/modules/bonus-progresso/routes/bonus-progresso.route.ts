import type { FastifyInstance } from 'fastify'
import { bonusProgressoController } from '../instances/bonus-progresso.instance'
import {
  getBonusProgressoSchema,
  listNiveisBonusSchema,
  updateBonusProgressoSchema,
} from '../schemas/bonus-progresso.schema'

export async function bonusProgressRoute(app: FastifyInstance) {
  app.get('/bonus/users/:userId', getBonusProgressoSchema, (request, reply) =>
    bonusProgressoController.getBonusProgresso(request, reply)
  )

  app.post(
    '/bonus/users/:userId/update',
    updateBonusProgressoSchema,
    (request, reply) => bonusProgressoController.updateBonusUser(request, reply)
  )

  app.get('/bonus/niveis', listNiveisBonusSchema, (request, reply) =>
    bonusProgressoController.listNiveis(request, reply)
  )
}
