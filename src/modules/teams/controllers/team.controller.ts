import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { GrupoSchema } from '../interfaces/team.interface'
import type { TeamService } from '../services/team.service'

const querySchema = z.object({
  grupo: GrupoSchema.optional(),
})

export class TeamController {
  constructor(private teamService: TeamService) {}

  async list(request: FastifyRequest, reply: FastifyReply) {
    const query = querySchema.parse(request.query)
    const teams = await this.teamService.listTeams(query.grupo)
    return reply.status(200).send(teams)
  }
}
