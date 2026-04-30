import type { FastifyReply } from 'fastify'
import { parseResponse } from '../../../shared/utils/parse-response'

export class HealthController {
  async handle(reply: FastifyReply) {
    try {
      const response = {
        status: 'Ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      }
      return reply.status(200).send(parseResponse({ data: response }))
    } catch (error) {
      if (error instanceof Error) {
        return reply
          .status(400)
          .send(parseResponse({ data: { error: error.message } }))
      }
      return reply
        .status(500)
        .send(parseResponse({ data: { error: 'Internal server error' } }))
    }
  }
}
