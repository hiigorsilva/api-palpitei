import { eq } from 'drizzle-orm'
import { db } from '../../../db/connection'
import { ranking } from '../../../db/schemas/ranking'
import { isValidId } from '../../../shared/utils/helpers'
import type { BetRepository } from '../../bet/repositories/bet.repository'
import type { BonusService } from '../../bonus-progresso/services/bonus-progresso.service'
import type { GameRepository } from '../../games/repositories/game.repository'
import type { RankingRepository } from '../../ranking/repositories/ranking.repository'
import type {
  IDashboardResponse,
  IRecalcularResponse,
  IResultadoDTO,
} from '../interfaces/admin.interface'
import type { AdminRepository } from '../repositories/admin.repository'

export class AdminService {
  constructor(
    private adminRepository: AdminRepository,
    private gameRepository: GameRepository,
    private betRepository: BetRepository,
    private rankingRepository: RankingRepository,
    private bonusService: BonusService
  ) {}

  private determinarResultado(
    gols_a: number,
    gols_b: number
  ): 'A' | 'B' | 'empate' {
    if (gols_a > gols_b) return 'A'
    if (gols_b > gols_a) return 'B'
    return 'empate'
  }

  private verificarAcerto(
    palpite: string,
    resultado: 'A' | 'B' | 'empate'
  ): boolean {
    return palpite === resultado
  }

  async atualizarResultado(data: IResultadoDTO): Promise<{ message: string }> {
    // Verificar se o ID do jogo é válido (uuid)
    if (!isValidId(data.gameId)) {
      throw { statusCode: 400, message: 'ID do jogo inválido' }
    }

    // Verificar se jogo existe
    const game = await this.gameRepository.getById(data.gameId)
    if (!game) {
      throw { statusCode: 404, message: 'Jogo não encontrado' }
    }

    if (game.finish_game) {
      throw {
        statusCode: 400,
        message:
          'Jogo já está encerrado. Para alterar, use o endpoint de recalcular.',
      }
    }

    // Atualizar resultado do jogo
    await this.adminRepository.atualizarResultadoJogo(
      data.gameId,
      data.gols_a,
      data.gols_b
    )

    // Calcular resultado real
    const resultadoReal = this.determinarResultado(data.gols_a, data.gols_b)

    // Buscar todas as apostas do jogo
    const apostas = await this.adminRepository.buscarApostasPorJogo(data.gameId)

    // Processar cada aposta
    for (const aposta of apostas) {
      const acertou = this.verificarAcerto(aposta.palpite, resultadoReal)
      await this.adminRepository.atualizarAcertoAposta(aposta.id, acertou)
    }

    // Recalcular pontuação de todos os usuários
    await this.recalcularPontuacaoGeral()

    return {
      message: `Resultado do jogo ${game.team_a} x ${game.team_b} atualizado com sucesso`,
    }
  }

  async recalcularPontuacaoGeral(): Promise<IRecalcularResponse> {
    // Buscar todos os usuários
    const todosUsuarios = await this.rankingRepository.getRankingPontos()
    let usuariosAtualizados = 0

    for (const usuario of todosUsuarios) {
      // Buscar estatísticas de apostas do usuário
      const estatisticas = await this.betRepository.getEstatisticasPorUsuario(
        usuario.userId
      )

      if (estatisticas) {
        // Buscar bônus do usuário
        const bonusInfo = await this.bonusService.getProgressoUser(
          usuario.userId
        )

        // Calcular pontos totais
        const pontos_apostas = estatisticas.pontos_apostas
        const pontos_bonus = bonusInfo.bonus_concedido
        const pontos_total = pontos_apostas + pontos_bonus

        // Atualizar tabela de ranking
        // Nota: Como não temos o repositório de ranking com update, farei diretamente

        const existing = await db
          .select()
          .from(ranking)
          .where(eq(ranking.userId, usuario.userId))

        if (existing.length > 0) {
          await db
            .update(ranking)
            .set({
              pontos_apostas,
              pontos_bonus,
              pontos_total,
              acertos: estatisticas.acertos,
              total_apostas: estatisticas.total_apostas,
              updated_at: new Date(),
            })
            .where(eq(ranking.userId, usuario.userId))
        } else {
          await db.insert(ranking).values({
            userId: usuario.userId,
            pontos_apostas,
            pontos_bonus,
            pontos_total,
            acertos: estatisticas.acertos,
            total_apostas: estatisticas.total_apostas,
          })
        }

        usuariosAtualizados++
      }
    }

    return {
      message: 'Pontuação recalculada com sucesso',
      usuarios_atualizados: usuariosAtualizados,
      apostas_processadas: todosUsuarios.reduce(
        (acc, u) => acc + (u.total_apostas || 0),
        0
      ),
    }
  }

  async getDashboard(): Promise<IDashboardResponse> {
    return await this.adminRepository.getDashboard()
  }
}
