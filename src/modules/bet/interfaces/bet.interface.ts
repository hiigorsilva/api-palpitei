import { z } from 'zod'
import type { ITeamDetails } from '../../teams/interfaces/team.interface'

export interface IBet {
  id: number
  userId: string
  gameId: string
  palpite: 'A' | 'B' | 'EMPATE'
  acertou: boolean
  usou_carta_dobro_pontos: boolean
  created_at: string
  updated_at: string
}

export interface IBetFull extends IBet {
  username: string
  team_a: string
  team_b: string
  team_a_info: ITeamDetails | null
  team_b_info: ITeamDetails | null
  data_hora: string
  gols_a: number | null
  gols_b: number | null
  finish_game: boolean
}

export const palpiteSchema = z.enum(['A', 'B', 'EMPATE'])
export type Palpite = z.infer<typeof palpiteSchema>

export const CreateBetDTOSchema = z.object({
  palpite: palpiteSchema,
  usar_carta_dobro_pontos: z.boolean().optional().default(false),
})

export const EditBetDTOSchema = z.object({
  palpite: palpiteSchema,
})

export type CreateBetDTO = z.infer<typeof CreateBetDTOSchema>
export type EditBetDTO = z.infer<typeof EditBetDTOSchema>

export interface IEstatisticasUsuario {
  acertos: number
  total_apostas: number
  pontos_apostas: number
}

export interface IBetRepository {
  create(
    userId: string,
    gameId: string,
    palpite: Palpite,
    usarCartaDobroPontos?: boolean
  ): Promise<IBet>
  update(id: number, palpite: Palpite): Promise<IBet>
  getById(id: number): Promise<IBet | null>
  getByUser(userId: string): Promise<IBetFull[]>
  getByGame(gameId: string): Promise<IBet[]>
  getBetByUserGame(userId: string, gameId: string): Promise<IBet | null>
  verifyIfUserHasBet(userId: string, gameId: string): Promise<boolean>
  contarJogosDistintosApostados(userId: string): Promise<number>
  getEstatisticasPorUsuario(
    userId: string
  ): Promise<IEstatisticasUsuario | null>
}

export interface IBetService {
  createBet(
    userId: string,
    gameId: string,
    palpite: Palpite,
    usarCartaDobroPontos?: boolean
  ): Promise<IBet>
  editBet(id: number, userId: string, palpite: Palpite): Promise<IBet>
  listBetsByUser(userId: string): Promise<IBetFull[]>
}
