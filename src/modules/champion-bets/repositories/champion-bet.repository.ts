import { eq } from 'drizzle-orm'
import { db } from '../../../db/connection'
import { championBets } from '../../../db/schemas/champion-bets'
import { teams } from '../../../db/schemas/teams'

export interface IChampionBet {
  id: number
  userId: string
  teamId: string
  acertou: boolean
  pontos: number
  created_at: Date
  updated_at: Date
}

export class ChampionBetRepository {
  async findTeamById(
    teamId: string
  ): Promise<{ id: string; name: string } | null> {
    const result = await db
      .select({ id: teams.id, name: teams.name })
      .from(teams)
      .where(eq(teams.id, teamId))

    return result[0] || null
  }

  async upsert(userId: string, teamId: string): Promise<IChampionBet> {
    const result = await db
      .insert(championBets)
      .values({
        userId,
        teamId,
      })
      .onConflictDoUpdate({
        target: championBets.userId,
        set: {
          teamId,
          acertou: false,
          pontos: 0,
          updated_at: new Date(),
        },
      })
      .returning()

    return result[0]
  }

  async markChampion(teamId: string, pontos: number): Promise<number> {
    await db.update(championBets).set({
      acertou: false,
      pontos: 0,
      updated_at: new Date(),
    })

    const result = await db
      .update(championBets)
      .set({
        acertou: true,
        pontos,
        updated_at: new Date(),
      })
      .where(eq(championBets.teamId, teamId))
      .returning({ id: championBets.id })

    return result.length
  }

  async getPontosPorUsuario(userId: string): Promise<number> {
    const result = await db
      .select({ pontos: championBets.pontos })
      .from(championBets)
      .where(eq(championBets.userId, userId))

    return result[0]?.pontos ?? 0
  }
}
