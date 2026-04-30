import { z } from 'zod'

export interface IBet {
  id: number
  userId: string
  gameId: string
  palpite: 'A' | 'B' | 'EMPATE'
  acertou: boolean
  created_at: Date
  updated_at: Date
}

export interface IBetFull extends IBet {
  username: string
  team_a: string
  team_b: string
  data_hora: Date
  gols_a: number | null
  gols_b: number | null
  finish_game: boolean
}

export const palpiteSchema = z.enum(['A', 'B', 'EMPATE'])
export type Palpite = z.infer<typeof palpiteSchema>

export const CreateBetDTOSchema = z.object({
  palpite: palpiteSchema,
})

export const EditBetDTOSchema = z.object({
  palpite: palpiteSchema,
})

export type CreateBetDTO = z.infer<typeof CreateBetDTOSchema>
export type EditBetDTO = z.infer<typeof EditBetDTOSchema>

export interface IBetRepository {
  create(userId: string, gameId: string, palpite: Palpite): Promise<IBet>
  update(id: number, palpite: Palpite): Promise<IBet>
  getById(id: number): Promise<IBet | null>
  getByUser(userId: string): Promise<IBetFull[]>
  getByGame(gameId: string): Promise<IBet[]>
  getBetByUserGame(userId: string, gameId: string): Promise<IBet | null>
  verifyIfUserHasBet(userId: string, gameId: string): Promise<boolean>
}

export interface IBetService {
  createBet(userId: string, gameId: string, palpite: Palpite): Promise<IBet>
  updateBet(
    id: number,
    userId: string,
    palpite: Palpite,
    dataHoraJogo: Date
  ): Promise<IBet>
  listBetById(userId: string): Promise<IBetFull[]>
}
