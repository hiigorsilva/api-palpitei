import { z } from 'zod'

export interface IGame {
  id: string
  team_a: string
  team_b: string
  fase: string
  data_hora: Date
  gols_a: number | null
  gols_b: number | null
  finish_game: boolean
  created_at: Date
  updated_at: Date
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
  listAll(): Promise<IGame[]>
  getById(id: string): Promise<IGame | null>
  listByFase(fase: GameFase): Promise<IGame[]>
  listByStatus(status: GameStatus): Promise<IGame[]>
  updateResult(id: string, gols_a: number, gols_b: number): Promise<IGame>
  contarTotalJogos(): Promise<number>
  listPendentes(): Promise<IGame[]>
  listHoje(): Promise<IGame[]>
}
