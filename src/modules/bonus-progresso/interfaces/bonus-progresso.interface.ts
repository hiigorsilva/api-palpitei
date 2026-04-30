export interface INivelBonusProgresso {
  nivel: string
  minimoPercentual: number
  bonusPontos: number
}

export interface IBonusProgresso {
  userId: string
  name: string
  jogos_apostados: number
  total_jogos: number
  percentual: number
  nivel_atual: string
  bonus_concedido: number
  proximo_nivel: INivelBonusProgresso | null
}

export type NivelBonusEnum =
  | 'INICIANTE'
  | 'BRONZE'
  | 'PRATA'
  | 'OURO'
  | 'PLATINA'
  | 'DIAMANTE'

export interface IUserBonusProgresso {
  id: string
  userId: string
  jogos_apostados: number
  percentual: number
  nivel: NivelBonusEnum
  bonus_concedido: number
  updated_at: Date
  created_at: Date
}

export const NIVEIS_BONUS: INivelBonusProgresso[] = [
  { nivel: 'BRONZE', minimoPercentual: 15, bonusPontos: 5 },
  { nivel: 'PRATA', minimoPercentual: 30, bonusPontos: 10 },
  { nivel: 'OURO', minimoPercentual: 50, bonusPontos: 20 },
  { nivel: 'PLATINA', minimoPercentual: 70, bonusPontos: 35 },
  { nivel: 'DIAMANTE', minimoPercentual: 90, bonusPontos: 50 },
]

export interface IBonusProgressoRepository {
  getOrCreate(userId: string): Promise<IUserBonusProgresso>
  update(
    userId: string,
    data: Partial<IUserBonusProgresso>
  ): Promise<IUserBonusProgresso>
  getByUserId(userId: string): Promise<IUserBonusProgresso | null>
}

export interface IBetRepository {
  contarJogosDistintosApostados(userId: string): Promise<number>
}

export interface IGameRepository {
  contarTotalJogos(): Promise<number>
}
