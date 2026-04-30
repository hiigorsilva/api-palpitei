import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import type { RankingService } from '../services/ranking.service'

const paramsSchema = z.object({
  userId: z.string(),
})

const querySchema = z.object({
  min_apostas: z.number(),
})

export class RankingController {
  constructor(private rankingService: RankingService) {}

  async getRankingPontos(_request: FastifyRequest, reply: FastifyReply) {
    const ranking = await this.rankingService.getRankingPontos()
    return reply.status(200).send(ranking)
  }

  async getRankingTaxaAcerto(request: FastifyRequest, reply: FastifyReply) {
    const query = querySchema.parse(request.query)
    const ranking = await this.rankingService.getRankingTaxaAcerto(
      query.min_apostas
    )
    return reply.status(200).send(ranking)
  }

  async getPosicaoUsuario(request: FastifyRequest, reply: FastifyReply) {
    const params = paramsSchema.parse(request.params)
    const position = await this.rankingService.getUserPosition(params.userId)

    if (!position) {
      return reply.status(404).send({ message: 'Usuário não encontrado' })
    }

    return reply.status(200).send(position)
  }

  async getEstatisticasUsuario(request: FastifyRequest, reply: FastifyReply) {
    const params = paramsSchema.parse(request.params)
    const estatisticas = await this.rankingService.getEstatisticasUsuario(
      params.userId
    )

    if (!estatisticas) {
      return reply.status(404).send({ message: 'Usuário não encontrado' })
    }

    return reply.status(200).send(estatisticas)
  }
}
