import type {
  IRankingItem,
  IUserRankingStats,
} from '../interfaces/ranking.interface'
import type { RankingRepository } from '../repositories/ranking.repository'

export class RankingService {
  constructor(private rankingRepository: RankingRepository) {}

  async getRankingPontos(): Promise<IRankingItem[]> {
    return await this.rankingRepository.getRankingPontos()
  }

  async getRankingTaxaAcerto(
    minimoApostas: number = 0
  ): Promise<IRankingItem[]> {
    return await this.rankingRepository.getRankingTaxaAcerto(minimoApostas)
  }

  async getUserPosition(
    userId: string
  ): Promise<{ position: number; total_usuarios: number } | null> {
    return await this.rankingRepository.getUserPosition(userId)
  }

  async getEstatisticasUsuario(
    userId: string
  ): Promise<IUserRankingStats | null> {
    return await this.rankingRepository.getEstatisticasUsuario(userId)
  }
}
