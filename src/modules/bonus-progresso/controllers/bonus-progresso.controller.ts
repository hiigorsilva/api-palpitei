import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import type { BonusService } from '../services/bonus-progresso.service'

const paramsSchema = z.object({
  userId: z.string(),
})

export class BonusProgressoController {
  constructor(private bonusService: BonusService) {}

  async getBonusProgresso(request: FastifyRequest, reply: FastifyReply) {
    const params = paramsSchema.parse(request.params)
    const progresso = await this.bonusService.getProgressoUser(params.userId)
    return reply.status(200).send(progresso)
  }

  async updateBonusUser(request: FastifyRequest, reply: FastifyReply) {
    const params = paramsSchema.parse(request.params)
    const progresso = await this.bonusService.updateBonusUser(params.userId)
    return reply.status(200).send(progresso)
  }

  async listNiveis(_request: FastifyRequest, reply: FastifyReply) {
    const niveis = await this.bonusService.listNiveis()
    return reply.status(200).send(niveis)
  }
}
