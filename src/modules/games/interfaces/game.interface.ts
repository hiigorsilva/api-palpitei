import { z } from 'zod'
import type { Palpite } from '../../bet/interfaces/bet.interface'
import type { ITeamDetails } from '../../teams/interfaces/team.interface'

export interface IGame {
  id: string
  team_a: string
  team_b: string
  team_a_info: ITeamDetails | null
  team_b_info: ITeamDetails | null
  fase: string
  data_hora: Date
  gols_a: number | null
  gols_b: number | null
  finish_game: boolean
  has_palpite: boolean
  created_at: Date
  updated_at: Date
}

export interface IGameBetResponse {
  userId: string
  name: string
  palpite: Palpite
  usou_carta_dobro_pontos: boolean
  acertou: boolean
  pontos: number
}

export const GameFaseSchema = z.enum([
  'GRUPOS',
  '16_AVOS',
  'OITAVAS',
  'QUARTAS',
  'SEMI',
  'TERCEIRO',
  'FINAL',
])
export type GameFase = z.infer<typeof GameFaseSchema>

export const GameStatusSchema = z.enum(['FUTURO', 'ENCERRADO'])
export type GameStatus = z.infer<typeof GameStatusSchema>

export interface IGameRepository {
  listAll(userId?: string): Promise<IGame[]>
  getById(id: string, userId?: string): Promise<IGame | null>
  listByFase(fase: GameFase, userId?: string): Promise<IGame[]>
  listByStatus(status: GameStatus, userId?: string): Promise<IGame[]>
  getBetsByGame(gameId: string): Promise<IGameBetResponse[]>
  updateResult(id: string, gols_a: number, gols_b: number): Promise<IGame>
  contarTotalJogos(): Promise<number>
  listPendentes(userId?: string): Promise<IGame[]>
  listHoje(userId?: string): Promise<IGame[]>
}
