import type { FastifyReply, FastifyRequest } from 'fastify'
import { ResultadoDTOSchema } from '../interfaces/admin.interface'
import type { AdminService } from '../services/admin.service'

export class AdminController {
  constructor(private adminService: AdminService) {}

  async atualizarResultado(request: FastifyRequest, reply: FastifyReply) {
    const body = ResultadoDTOSchema.parse(request.body)
    const result = await this.adminService.atualizarResultado(body)
    return reply.status(200).send(result)
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
