import { asc, desc, eq, sql } from 'drizzle-orm'
import { db } from '../../../db/connection'
import { championBets } from '../../../db/schemas/champion-bets'
import { ranking } from '../../../db/schemas/ranking'
import { teams } from '../../../db/schemas/teams'
import { users } from '../../../db/schemas/users'
import type {
  IRankingItem,
  IRankingRepository,
  IUserRankingStats,
} from '../interfaces/ranking.interface'

export class RankingRepository implements IRankingRepository {
  private selectRankingFields() {
    return {
      userId: users.id,
      name: users.name,
      pontos_total: sql<number>`COALESCE(${ranking.pontos_total}, 0)`,
      pontos_apostas: sql<number>`COALESCE(${ranking.pontos_apostas}, 0)`,
      pontos_bonus: sql<number>`COALESCE(${ranking.pontos_bonus}, 0)`,
      pontos_campeao: sql<number>`COALESCE(${ranking.pontos_campeao}, 0)`,
      acertos: sql<number>`COALESCE(${ranking.acertos}, 0)`,
      total_apostas: sql<number>`COALESCE(${ranking.total_apostas}, 0)`,
      taxa_acerto: sql<number>`
        CASE 
          WHEN COALESCE(${ranking.total_apostas}, 0) > 0 
          THEN ROUND((COALESCE(${ranking.acertos}, 0)::DECIMAL / ${ranking.total_apostas}) * 100, 1)
          ELSE 0
        END
      `.as('taxa_acerto'),
    }
  }

  async getRankingPontos(): Promise<IRankingItem[]> {
    const result = await db
      .select(this.selectRankingFields())
      .from(users)
      .leftJoin(ranking, eq(users.id, ranking.userId))
      .orderBy(
        desc(sql`COALESCE(${ranking.pontos_total}, 0)`),
        desc(sql`COALESCE(${ranking.pontos_apostas}, 0)`),
        desc(sql`COALESCE(${ranking.acertos}, 0)`),
        desc(sql`
          CASE 
            WHEN COALESCE(${ranking.total_apostas}, 0) > 0 
            THEN ROUND((COALESCE(${ranking.acertos}, 0)::DECIMAL / ${ranking.total_apostas}) * 100, 1)
            ELSE 0
          END
        `),
        asc(users.name)
      )

    // Adicionar posição manualmente
    return result.map((item, index) => ({
      ...item,
      position: index + 1,
      taxa_acerto: Number(item.taxa_acerto),
    }))
  }

  async getRankingTaxaAcerto(
    minimoApostas: number = 0
  ): Promise<IRankingItem[]> {
    const result = await db
      .select(this.selectRankingFields())
      .from(users)
      .leftJoin(ranking, eq(users.id, ranking.userId))
      .where(sql`COALESCE(${ranking.total_apostas}, 0) >= ${minimoApostas}`)
      .orderBy(desc(sql`taxa_acerto`))

    return result.map((item, index) => ({
      ...item,
      position: index + 1,
      taxa_acerto: Number(item.taxa_acerto),
    }))
  }

  async getUserPosition(
    userId: string
  ): Promise<{ position: number; total_usuarios: number } | null> {
    const allRanking = await this.getRankingPontos()
    const position = allRanking.findIndex(item => item.userId === userId)

    if (position === -1) return null

    return {
      position: position + 1,
      total_usuarios: allRanking.length,
    }
  }

  async getEstatisticasUsuario(
    userId: string
  ): Promise<IUserRankingStats | null> {
    const result = await db
      .select({
        ...this.selectRankingFields(),
        championTeamId: teams.id,
        championTeamName: teams.name,
        championTeamCode: teams.code,
        championTeamFlag: teams.logo,
        championBetAcertou: championBets.acertou,
        championBetPontos: championBets.pontos,
      })
      .from(users)
      .leftJoin(ranking, eq(users.id, ranking.userId))
      .leftJoin(championBets, eq(users.id, championBets.userId))
      .leftJoin(teams, eq(championBets.teamId, teams.id))
      .where(eq(users.id, userId))

    if (result.length === 0) return null

    const positionInfo = await this.getUserPosition(userId)
    const estatisticas = result[0]

    return {
      userId: estatisticas.userId,
      name: estatisticas.name,
      pontos_total: estatisticas.pontos_total,
      pontos_apostas: estatisticas.pontos_apostas,
      pontos_bonus: estatisticas.pontos_bonus,
      pontos_campeao: estatisticas.pontos_campeao,
      acertos: estatisticas.acertos,
      total_apostas: estatisticas.total_apostas,
      position: positionInfo?.position || 0,
      taxa_acerto: Number(estatisticas.taxa_acerto),
      palpite_campeao:
        estatisticas.championTeamId && estatisticas.championTeamName
          ? {
              teamId: estatisticas.championTeamId,
              name: estatisticas.championTeamName,
              code: estatisticas.championTeamCode,
              flag: estatisticas.championTeamFlag,
              acertou: estatisticas.championBetAcertou ?? false,
              pontos: estatisticas.championBetPontos ?? 0,
            }
          : null,
    }
  }
}
