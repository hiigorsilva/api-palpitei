import type { FastifyReply, FastifyRequest } from 'fastify'
import type { IntegrationService } from '../services/integration.service'

export class IntegrationController {
  constructor(private integrationService: IntegrationService) {}

  async sincronizarTimes(_request: FastifyRequest, reply: FastifyReply) {
    const count = await this.integrationService.sincronizarTimes()
    return reply.status(200).send({
      message: 'Times sincronizados com sucesso',
      times_sincronizados: count,
      jogos_sincronizados: 0,
    })
  }

  async sincronizarJogos(_request: FastifyRequest, reply: FastifyReply) {
    const count = await this.integrationService.sincronizarJogos()
    return reply.status(200).send({
      message: 'Jogos sincronizados com sucesso',
      times_sincronizados: 0,
      jogos_sincronizados: count,
    })
  }

  async sincronizarCompleto(_request: FastifyRequest, reply: FastifyReply) {
    const result = await this.integrationService.sincronizarCompleto()
    return reply.status(200).send({
      message: 'Sincronização completa finalizada',
      times_sincronizados: result.times,
      jogos_sincronizados: result.jogos,
    })
  }

  async atualizarResultados(_request: FastifyRequest, reply: FastifyReply) {
    const count = await this.integrationService.buscarResultadosAtualizados()
    return reply.status(200).send({
      message: 'Resultados atualizados com sucesso',
      jogos_atualizados: count,
    })
  }
}
