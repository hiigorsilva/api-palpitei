import type { FastifyReply, FastifyRequest } from 'fastify'
import z from 'zod'
import {
  CreateBetDTOSchema,
  EditBetDTOSchema,
} from '../interfaces/bet.interface'
import type { BetService } from '../services/bet.service'

const createParamsSchema = z.object({
  userId: z.string(),
  gameId: z.string(),
})

const editParamsSchema = z.object({
  id: z.string().transform(Number),
  userId: z.string(),
})

const listParamsSchema = z.object({
  userId: z.string(),
})

const palpiteOptions = ['A', 'B', 'EMPATE'] as const

export class BetController {
  constructor(private betService: BetService) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    const params = createParamsSchema.parse(request.params)
    const body = CreateBetDTOSchema.parse(request.body)

    if (!params.userId) {
      return reply.status(400).send({ message: 'ID do usuário é obrigatório' })
    }

    if (!params.gameId) {
      return reply.status(400).send({ message: 'ID do jogo é obrigatório' })
    }

    if (body.palpite && !palpiteOptions.includes(body.palpite)) {
      return reply.status(400).send({ message: 'Palpite inválido' })
    }

    const bet = await this.betService.createBet(
      params.userId,
      params.gameId,
      body.palpite
    )

    return reply.status(201).send(bet)
  }

  async edit(request: FastifyRequest, reply: FastifyReply) {
    const params = editParamsSchema.parse(request.params)
    const body = EditBetDTOSchema.parse(request.body)

    const bet = await this.betService.editBet(
      params.id,
      params.userId,
      body.palpite
    )

    return reply.status(200).send(bet)
  }

  async listByUser(request: FastifyRequest, reply: FastifyReply) {
    const params = listParamsSchema.parse(request.params)
    const bets = await this.betService.listBetsByUser(params.userId)
    return reply.status(200).send(bets)
  }
}
