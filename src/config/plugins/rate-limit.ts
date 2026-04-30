import rateLimit from '@fastify/rate-limit'
import type { FastifyInstance } from 'fastify'

export const registerRateLimit = (app: FastifyInstance) => {
  app.register(rateLimit, {
    global: true,
    max: 100,
    timeWindow: '1 minute',
    keyGenerator: request => request.ip,
  })
}
