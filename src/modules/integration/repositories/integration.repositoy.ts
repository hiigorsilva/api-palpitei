import { eq, sql } from 'drizzle-orm'
import { db } from '../../../db/connection'

export class IntegrationRepository {
  // ========== TIMES ==========

  async buscarTimePorApiId(apiId: number): Promise<{ id: number } | null> {
    const result = await db
      .select({ id: teams.id })
      .from(teams)
      .where(eq(teams.apiId, apiId))

    return result[0] || null
  }

  async criarTime(data: ITeamDTO): Promise<{ id: number }> {
    const result = await db
      .insert(teams)
      .values({
        apiId: data.apiId,
        name: data.nome,
        code: data.sigla,
        logo: data.logo,
      })
      .returning({ id: teams.id })

    return result[0]
  }

  async atualizarTime(apiId: number, data: Partial<ITeamDTO>): Promise<void> {
    await db
      .update(teams)
      .set({
        name: data.nome,
        code: data.sigla,
        logo: data.logo,
        updated_at: new Date(),
      })
      .where(eq(teams.apiId, apiId))
  }

  // ========== JOGOS ==========

  async buscarJogoPorApiId(apiId: number): Promise<{ id: number } | null> {
    const result = await db
      .select({ id: games.id })
      .from(games)
      .where(eq(games.apiId, apiId))

    return result[0] || null
  }

  async criarJogo(data: IGameDTO): Promise<void> {
    await db.insert(games).values({
      apiId: data.apiId,
      selecao_a: data.selecao_a_id.toString(),
      selecao_b: data.selecao_b_id.toString(),
      fase: data.fase,
      data_hora: data.data_hora,
      gols_a: data.gols_a,
      gols_b: data.gols_b,
      encerrado: data.encerrado,
      created_at: new Date(),
      updated_at: new Date(),
    })
  }

  async atualizarJogo(apiId: number, data: Partial<IGameDTO>): Promise<void> {
    await db
      .update(games)
      .set({
        gols_a: data.gols_a,
        gols_b: data.gols_b,
        encerrado: data.encerrado,
        updated_at: new Date(),
      })
      .where(eq(games.apiId, apiId))
  }

  // ========== UTILITÁRIOS ==========

  async contarTimes(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(teams)
    return Number(result[0].count)
  }

  async contarJogos(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(games)
    return Number(result[0].count)
  }
}
