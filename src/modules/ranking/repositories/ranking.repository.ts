import { desc, eq, sql } from 'drizzle-orm'
import { db } from '../../../db/connection'
import { ranking } from '../../../db/schemas/ranking'
import { users } from '../../../db/schemas/users'
import type {
  IRankingItem,
  IRankingRepository,
} from '../interfaces/ranking.interface'

export class RankingRepository implements IRankingRepository {
  async getRankingPontos(): Promise<IRankingItem[]> {
    const result = await db
      .select({
        userId: users.id,
        name: users.name,
        pontos_total: ranking.pontos_total,
        pontos_apostas: ranking.pontos_apostas,
        pontos_bonus: ranking.pontos_bonus,
        acertos: ranking.acertos,
        total_apostas: ranking.total_apostas,
        taxa_acerto: sql<number>`
          CASE 
            WHEN ${ranking.total_apostas} > 0 
            THEN ROUND((${ranking.acertos}::DECIMAL / ${ranking.total_apostas}) * 100, 1)
            ELSE 0
          END
        `.as('taxa_acerto'),
      })
      .from(users)
      .innerJoin(ranking, eq(users.id, ranking.userId))
      .orderBy(desc(ranking.pontos_total))

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
      .select({
        userId: users.id,
        name: users.name,
        pontos_total: ranking.pontos_total,
        pontos_apostas: ranking.pontos_apostas,
        pontos_bonus: ranking.pontos_bonus,
        acertos: ranking.acertos,
        total_apostas: ranking.total_apostas,
        taxa_acerto: sql<number>`
          CASE 
            WHEN ${ranking.total_apostas} > 0 
            THEN ROUND((${ranking.acertos}::DECIMAL / ${ranking.total_apostas}) * 100, 1)
            ELSE 0
          END
        `.as('taxa_acerto'),
      })
      .from(users)
      .innerJoin(ranking, eq(users.id, ranking.userId))
      .where(sql`${ranking.total_apostas} >= ${minimoApostas}`)
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

  async getEstatisticasUsuario(userId: string): Promise<IRankingItem | null> {
    const result = await db
      .select({
        userId: users.id,
        name: users.name,
        pontos_total: ranking.pontos_total,
        pontos_apostas: ranking.pontos_apostas,
        pontos_bonus: ranking.pontos_bonus,
        acertos: ranking.acertos,
        total_apostas: ranking.total_apostas,
        taxa_acerto: sql<number>`
          CASE 
            WHEN ${ranking.total_apostas} > 0 
            THEN ROUND((${ranking.acertos}::DECIMAL / ${ranking.total_apostas}) * 100, 1)
            ELSE 0
          END
        `.as('taxa_acerto'),
      })
      .from(users)
      .innerJoin(ranking, eq(users.id, ranking.userId))
      .where(eq(users.id, userId))

    if (result.length === 0) return null

    const positionInfo = await this.getUserPosition(userId)

    return {
      ...result[0],
      position: positionInfo?.position || 0,
      taxa_acerto: Number(result[0].taxa_acerto),
    }
  }
}
