import type { Palpite } from '../../bet/interfaces/bet.interface'

export interface IUser {
  id: string
  name: string
  carta_dobro_pontos: number
  created_at: Date
}

export interface ICreateUserDTO extends Pick<IUser, 'name'> {}

export interface INextUserLevel {
  nivel: string
  bonusPontos: number
  minimoPercentual: number
}

export interface IUserWithProgress extends IUser {
  bonus_concedido: number
  jogos_apostados: number
  nivel_atual: string
  percentual: number
  proximo_nivel: INextUserLevel | null
  total_jogos: number
}

export interface IChampionBetResponse {
  id: number
  userId: string
  teamId: string
  teamName: string
  acertou: boolean
  pontos: number
  created_at: Date
  updated_at: Date
}

export interface IUserCartaHistoricoResponse {
  gameId: string
  team_a: string
  team_b: string
  data_hora: string
  palpite: Palpite
  usou_carta_dobro_pontos: boolean
  acertou: boolean
  pontos: number
}

export interface IUserRepository {
  create(name: string): Promise<IUser>
  findById(id: string): Promise<IUser | null>
  findByName(name: string): Promise<IUser | null>
  findAll(): Promise<IUser[]>
}
