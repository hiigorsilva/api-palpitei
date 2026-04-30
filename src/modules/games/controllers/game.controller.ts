import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { faseOptions, statusOptions } from '../../../data/enums'
import { GameFaseSchema, GameStatusSchema } from '../interfaces/game.interface'
import type { GameService } from '../services/game.service'

const paramsSchema = z.object({
  id: z.string(),
})
type GetGameByIdParams = z.infer<typeof paramsSchema>

const querySchema = z.object({
  fase: GameFaseSchema.optional(),
  status: GameStatusSchema.optional(),
})

export class GameController {
  constructor(private gameService: GameService) {}

  async listAll(request: FastifyRequest, reply: FastifyReply) {
    const query = querySchema.parse(request.query)

    if (query.fase && !faseOptions.includes(query.fase)) {
      return reply.status(404).send({ message: 'Fase não encontrada' })
    }
    if (query.fase && faseOptions.includes(query.fase)) {
      const games = await this.gameService.listByFase(query.fase)
      return reply.status(200).send(games)
    }

    if (query.status && !statusOptions.includes(query.status)) {
      return reply.status(404).send({ message: 'Status não encontrado' })
    }
    if (query.status && statusOptions.includes(query.status)) {
      const games = await this.gameService.listByStatus(query.status)
      return reply.status(200).send(games)
    }

    const games = await this.gameService.listAll()
    return reply.status(200).send(games)
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const params = paramsSchema.parse(request.params) as GetGameByIdParams
    if (!params.id) {
      return reply.status(400).send({ message: 'ID é obrigatório' })
    }

    const game = await this.gameService.getById(params.id)
    return reply.status(200).send(game)
  }
}
