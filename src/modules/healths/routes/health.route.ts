import type { FastifyInstance } from 'fastify'
import { healthController } from '../instances/health.instance'
import { healthSchema } from '../schemas/health.schema'

export const healthRoute = async (app: FastifyInstance) => {
  app.get(
    '/health',
    healthSchema,
    async (_, reply) => await healthController.handle(reply)
  )
}
