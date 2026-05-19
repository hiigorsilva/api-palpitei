import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { faseOptions, statusOptions } from '../../../data/enums'
import { GameFaseSchema, GameStatusSchema } from '../interfaces/game.interface'
import type { GameService } from '../services/game.service'

const paramsSchema = z.object({
  id: z.string(),
})
type GetGameByIdParams = z.infer<typeof paramsSchema>

const requiredUserQuerySchema = z.object({
  userId: z
    .string({ error: 'ID do usuário é obrigatório' })
    .uuid('ID do usuário inválido'),
})

const optionalUserQuerySchema = z.object({
  userId: z.string().uuid().optional(),
})

const listQuerySchema = z.object({
  fase: GameFaseSchema.optional(),
  status: GameStatusSchema.optional(),
  userId: z
    .string({ error: 'ID do usuário é obrigatório' })
    .uuid('ID do usuário inválido'),
})

const betsParamsSchema = z.object({
  gameId: z.string(),
})

export class GameController {
  constructor(private gameService: GameService) {}

  async listAll(request: FastifyRequest, reply: FastifyReply) {
    const query = listQuerySchema.parse(request.query)

    if (query.fase && !faseOptions.includes(query.fase)) {
      return reply.status(404).send({ message: 'Fase não encontrada' })
    }
    if (query.fase && faseOptions.includes(query.fase)) {
      const games = await this.gameService.listByFase(query.fase, query.userId)
      return reply.status(200).send(games)
    }

    if (query.status && !statusOptions.includes(query.status)) {
      return reply.status(404).send({ message: 'Status não encontrado' })
    }
    if (query.status && statusOptions.includes(query.status)) {
      const games = await this.gameService.listByStatus(
        query.status,
        query.userId
      )
      return reply.status(200).send(games)
    }

    const games = await this.gameService.listAll(query.userId)
    return reply.status(200).send(games)
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const params = paramsSchema.parse(request.params) as GetGameByIdParams
    if (!params.id) {
      return reply.status(400).send({ message: 'ID é obrigatório' })
    }

    const query = requiredUserQuerySchema.parse(request.query)
    const game = await this.gameService.getById(params.id, query.userId)
    return reply.status(200).send(game)
  }

  async listPendentes(request: FastifyRequest, reply: FastifyReply) {
    const query = optionalUserQuerySchema.parse(request.query)
    const games = await this.gameService.listPendentes(query.userId)
    return reply.status(200).send(games)
  }

  async listHoje(request: FastifyRequest, reply: FastifyReply) {
    const query = requiredUserQuerySchema.parse(request.query)
    const games = await this.gameService.listHoje(query.userId)
    return reply.status(200).send(games)
  }

  async listBetsByGame(request: FastifyRequest, reply: FastifyReply) {
    const params = betsParamsSchema.parse(request.params)
    const bets = await this.gameService.listBetsByGame(params.gameId)
    return reply.status(200).send(bets)
  }
}
