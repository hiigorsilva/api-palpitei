import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { GameFaseSchema } from '../../games/interfaces/game.interface'
import {
  CorrigirResultadoDTOSchema,
  LoteResultadoDTOSchema,
  ResultadoDTOSchema,
} from '../interfaces/admin.interface'
import type { AdminService } from '../services/admin.service'

const paramsGameIdSchema = z.object({ gameId: z.string().uuid() })

export class AdminController {
  constructor(private adminService: AdminService) {}

  async popularBaseLocal(_request: FastifyRequest, reply: FastifyReply) {
    const result = await this.adminService.popularBaseLocal()
    return reply.status(200).send(result)
  }

  async atualizarResultado(request: FastifyRequest, reply: FastifyReply) {
    const body = ResultadoDTOSchema.parse(request.body)
    const result = await this.adminService.atualizarResultado(body)
    return reply.status(200).send(result)
  }

  async corrigirResultado(request: FastifyRequest, reply: FastifyReply) {
    const { gameId } = paramsGameIdSchema.parse(request.params)
    const { gols_a, gols_b } = CorrigirResultadoDTOSchema.parse(request.body)
    const result = await this.adminService.corrigirResultado(
      gameId,
      gols_a,
      gols_b
    )
    return reply.status(200).send(result)
  }

  async inserirMultiplosResultados(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const { resultados } = LoteResultadoDTOSchema.parse(request.body)
    const result =
      await this.adminService.inserirMultiplosResultados(resultados)
    return reply.status(200).send(result)
  }

  async listarJogosPendentes(_request: FastifyRequest, reply: FastifyReply) {
    const games = await this.adminService.listarJogosPendentes()
    return reply.status(200).send(games)
  }

  async listarJogosDeHoje(_request: FastifyRequest, reply: FastifyReply) {
    const games = await this.adminService.listarJogosDeHoje()
    return reply.status(200).send(games)
  }

  async listarJogosPorFase(request: FastifyRequest, reply: FastifyReply) {
    const query = z.object({ fase: GameFaseSchema }).parse(request.query)
    const games = await this.adminService.listarJogosPorFase(query.fase)
    return reply.status(200).send(games)
  }

  async recalcularPontuacao(_request: FastifyRequest, reply: FastifyReply) {
    const result = await this.adminService.recalcularPontuacaoGeral()
    return reply.status(200).send(result)
  }

  async getDashboard(_request: FastifyRequest, reply: FastifyReply) {
    const dashboard = await this.adminService.getDashboard()
    return reply.status(200).send(dashboard)
  }
}
