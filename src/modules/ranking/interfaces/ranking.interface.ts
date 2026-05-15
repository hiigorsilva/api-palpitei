export interface IRankingItem {
  position: number
  userId: string
  name: string
  pontos_total: number
  pontos_apostas: number
  pontos_bonus: number
  pontos_campeao: number
  acertos: number
  total_apostas: number
  taxa_acerto: number
}

export interface IChampionBetRankingInfo {
  teamId: string
  name: string
  code: string | null
  flag: string | null
  acertou: boolean
  pontos: number
}

export interface IUserRankingStats extends IRankingItem {
  palpite_campeao: IChampionBetRankingInfo | null
}

export interface IRankingRepository {
  getRankingPontos(): Promise<IRankingItem[]>
  getRankingTaxaAcerto(minimoApostas?: number): Promise<IRankingItem[]>
  getUserPosition(
    userId: string
  ): Promise<{ position: number; total_usuarios: number } | null>
  getEstatisticasUsuario(userId: string): Promise<IUserRankingStats | null>
}

export interface IBonusRepository {
  getBonusUsuario(userId: string): Promise<{ bonus_concedido: number } | null>
}

export interface IBetRepository {
  getEstatisticasPorUsuario(userId: string): Promise<{
    acertos: number
    total_apostas: number
    pontos_apostas: number
  } | null>
}
