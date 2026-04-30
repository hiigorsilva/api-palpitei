import type { BetRepository } from '../../bet/repositories/bet.repository'
import type { GameRepository } from '../../games/repositories/game.repository'
import type { UserRepository } from '../../users/repositories/user.repository'
import {
  type IBonusProgresso,
  type INivelBonusProgresso,
  NIVEIS_BONUS,
  type NivelBonusEnum,
} from '../interfaces/bonus-progresso.interface'
import type { BonusProgressoRepository } from '../repositories/bonus-progresso.repository'

export class BonusService {
  constructor(
    private bonusProgressoRepository: BonusProgressoRepository,
    private betRepository: BetRepository,
    private gameRepository: GameRepository,
    private userRepository: UserRepository
  ) {}

  private calculateNivel(percentual: number): INivelBonusProgresso | null {
    let nivelEncontrado: INivelBonusProgresso | null = null

    for (const nivel of NIVEIS_BONUS) {
      if (percentual >= nivel.minimoPercentual) {
        nivelEncontrado = nivel
      } else {
        break
      }
    }

    return nivelEncontrado
  }

  private calculateNextNivel(
    percentualAtual: number
  ): INivelBonusProgresso | null {
    for (const nivel of NIVEIS_BONUS) {
      if (percentualAtual < nivel.minimoPercentual) {
        return nivel
      }
    }
    return null
  }

  async updateBonusUser(userId: string): Promise<IBonusProgresso> {
    // Verificar se usuário existe
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw { statusCode: 404, message: 'Usuário não encontrado' }
    }

    // Buscar ou criar registro de bônus
    await this.bonusProgressoRepository.getOrCreate(userId)

    // Contar jogos apostados e total de jogos
    const jogosApostados =
      await this.betRepository.contarJogosDistintosApostados(userId)
    const totalJogos = await this.gameRepository.contarTotalJogos()
    const percentual = totalJogos > 0 ? (jogosApostados / totalJogos) * 100 : 0

    // Calcular nível atual
    const nivelAtual = this.calculateNivel(percentual)
    const bonusConcedido = nivelAtual?.bonusPontos || 0

    // Atualizar registro
    const atualizado = await this.bonusProgressoRepository.update(userId, {
      jogos_apostados: jogosApostados,
      percentual: Math.floor(percentual),
      nivel: (nivelAtual?.nivel ?? 'INICIANTE') as NivelBonusEnum,
      bonus_concedido: bonusConcedido,
    })

    return {
      userId: atualizado.userId,
      name: user.name,
      jogos_apostados: atualizado.jogos_apostados,
      total_jogos: totalJogos,
      percentual: atualizado.percentual || 0,
      nivel_atual: atualizado.nivel || 'INICIANTE',
      bonus_concedido: atualizado.bonus_concedido,
      proximo_nivel: this.calculateNextNivel(percentual),
    }
  }

  async getProgressoUser(userId: string): Promise<IBonusProgresso> {
    // Verificar se usuário existe
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw { statusCode: 404, message: 'Usuário não encontrado' }
    }

    // Buscar registro existente
    let bonus = await this.bonusProgressoRepository.getByUserId(userId)
    const totalJogos = await this.gameRepository.contarTotalJogos()

    // Se não existe, recalcular (caso usuário já tenha apostas)
    if (!bonus) {
      return await this.updateBonusUser(userId)
    }

    // Verificar se precisa recalcular (pode ter novas apostas)
    const jogosApostadosAtual =
      await this.betRepository.contarJogosDistintosApostados(userId)

    if (jogosApostadosAtual !== bonus.jogos_apostados) {
      return await this.updateBonusUser(userId)
    }

    return {
      userId: bonus.userId,
      name: user.name,
      jogos_apostados: bonus.jogos_apostados,
      total_jogos: totalJogos,
      percentual: bonus.percentual || 0,
      nivel_atual: bonus.nivel || 'INICIANTE',
      bonus_concedido: bonus.bonus_concedido,
      proximo_nivel: this.calculateNextNivel(bonus.percentual || 0),
    }
  }

  async listNiveis(): Promise<INivelBonusProgresso[]> {
    return NIVEIS_BONUS
  }
}
