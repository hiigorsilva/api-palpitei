import { and, count, countDistinct, eq, sql } from 'drizzle-orm'
import { db } from '../../../db/connection'
import { bet } from '../../../db/schemas/bet'
import { games } from '../../../db/schemas/games'
import { users } from '../../../db/schemas/users'
import type {
  IBet,
  IBetFull,
  IBetRepository,
  IEstatisticasUsuario,
  Palpite,
} from '../interfaces/bet.interface'
import { palpiteSchema } from '../interfaces/bet.interface'

export class BetRepository implements IBetRepository {
  private toIBet(data: {
    id: number
    userId: string
    gameId: string
    palpite: string
    acertou: boolean | null
    created_at: Date
    updated_at: Date
  }): IBet {
    return {
      ...data,
      palpite: palpiteSchema.parse(data.palpite),
      acertou: data.acertou ?? false,
      created_at: data.created_at.toISOString(),
      updated_at: data.updated_at.toISOString(),
    }
  }

  private toIBetFull(data: {
    id: number
    userId: string
    gameId: string
    palpite: string
    acertou: boolean | null
    created_at: Date
    updated_at: Date
    username: string
    team_a: string
    team_b: string
    data_hora: Date
    gols_a: number | null
    gols_b: number | null
    finish_game: boolean
  }): IBetFull {
    return {
      ...data,
      palpite: palpiteSchema.parse(data.palpite),
      acertou: data.acertou ?? false,
      created_at: data.created_at.toISOString(),
      updated_at: data.updated_at.toISOString(),
      data_hora: data.data_hora.toISOString(),
    }
  }

  async create(
    userId: string,
    gameId: string,
    palpite: Palpite
  ): Promise<IBet> {
    const result = await db
      .insert(bet)
      .values({ userId, gameId, palpite })
      .returning()
    return this.toIBet(result[0])
  }

  async update(id: number, palpite: Palpite): Promise<IBet> {
    const result = await db
      .update(bet)
      .set({ palpite, updated_at: new Date() })
      .where(eq(bet.id, id))
      .returning()
    return this.toIBet(result[0])
  }

  async getById(id: number): Promise<IBet | null> {
    const result = await db.select().from(bet).where(eq(bet.id, id))
    return result[0] ? this.toIBet(result[0]) : null
  }

  async getByUser(userId: string): Promise<IBetFull[]> {
    const result = await db
      .select({
        id: bet.id,
        userId: bet.userId,
        gameId: bet.gameId,
        palpite: bet.palpite,
        acertou: bet.acertou,
        created_at: bet.created_at,
        updated_at: bet.updated_at,
        username: users.name,
        team_a: games.team_a,
        team_b: games.team_b,
        data_hora: games.data_hora,
        gols_a: games.gols_a,
        gols_b: games.gols_b,
        finish_game: games.finish_game,
      })
      .from(bet)
      .innerJoin(users, eq(bet.userId, users.id))
      .innerJoin(games, eq(bet.gameId, games.id))
      .where(eq(bet.userId, userId))
      .orderBy(games.data_hora)
    return result.map(betData => this.toIBetFull(betData))
  }

  async getByGame(gameId: string): Promise<IBet[]> {
    const result = await db.select().from(bet).where(eq(bet.gameId, gameId))
    return result.map(betData => this.toIBet(betData))
  }

  async getBetByUserGame(userId: string, gameId: string): Promise<IBet | null> {
    const result = await db
      .select()
      .from(bet)
      .where(and(eq(bet.userId, userId), eq(bet.gameId, gameId)))
    return result[0] ? this.toIBet(result[0]) : null
  }

  async verifyIfUserHasBet(userId: string, gameId: string): Promise<boolean> {
    const betData = await this.getBetByUserGame(userId, gameId)
    return betData !== null
  }

  async contarJogosDistintosApostados(userId: string): Promise<number> {
    const result = await db
      .select({ count: countDistinct(bet.gameId) })
      .from(bet)
      .where(eq(bet.userId, userId))
    return result[0]?.count ?? 0
  }

  async getEstatisticasPorUsuario(
    userId: string
  ): Promise<IEstatisticasUsuario | null> {
    const result = await db
      .select({
        acertos: sql<number>`cast(count(*) filter (where ${bet.acertou} = true) as int)`,
        total_apostas: count(),
      })
      .from(bet)
      .where(eq(bet.userId, userId))
    const row = result[0]
    if (!row || row.total_apostas === 0) return null
    return {
      acertos: row.acertos,
      total_apostas: row.total_apostas,
      pontos_apostas: row.acertos * 3,
    }
  }
}
