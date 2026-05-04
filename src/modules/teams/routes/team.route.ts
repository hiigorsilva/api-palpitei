import type { FastifyInstance } from 'fastify'
import { teamController } from '../instances/team.instance'
import { listTeamsSchema } from '../schemas/team.schema'

export const teamRoute = async (app: FastifyInstance) => {
  app.get('/teams', listTeamsSchema, (request, reply) =>
    teamController.list(request, reply)
  )
}
