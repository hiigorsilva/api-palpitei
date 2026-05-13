import { count, eq, sql } from 'drizzle-orm'
import { db } from '../../../db/connection'
import { bet } from '../../../db/schemas/bet'
import { games } from '../../../db/schemas/games'
import { teams } from '../../../db/schemas/teams'
import { users } from '../../../db/schemas/users'
import type { IDashboardResponse } from '../interfaces/admin.interface'

export class AdminRepository {
  async listarUsuarios(): Promise<Array<{ id: string }>> {
    return await db.select({ id: users.id }).from(users)
  }

  async buscarTeamPorNome(name: string): Promise<{ id: string } | null> {
    const result = await db
      .select({ id: teams.id })
      .from(teams)
      .where(eq(teams.name, name))
    return result[0] || null
  }

  async inserirTeam(data: {
    apiId: number
    name: string
    code: string | null
    logo: string | null
    continent: string | null
    flagIcon: string | null
    flagUnicode: string | null
    confed: string | null
    group: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L'
  }): Promise<void> {
    await db.insert(teams).values({
      apiId: data.apiId,
      name: data.name,
      code: data.code,
      logo: data.logo,
      continent: data.continent,
      flagIcon: data.flagIcon,
      flagUnicode: data.flagUnicode,
      confed: data.confed,
      group: data.group,
    })
  }

  async atualizarTeamPorNome(
    name: string,
    data: {
      code: string | null
      logo: string | null
      continent: string | null
      flagIcon: string | null
      flagUnicode: string | null
      confed: string | null
      group:
        | 'A'
        | 'B'
        | 'C'
        | 'D'
        | 'E'
        | 'F'
        | 'G'
        | 'H'
        | 'I'
        | 'J'
        | 'K'
        | 'L'
    }
  ): Promise<void> {
    await db
      .update(teams)
      .set({
        code: data.code,
        logo: data.logo,
        continent: data.continent,
        flagIcon: data.flagIcon,
        flagUnicode: data.flagUnicode,
        confed: data.confed,
        group: data.group,
        updated_at: new Date(),
      })
      .where(eq(teams.name, name))
  }

  async buscarJogoPorApiId(apiId: number): Promise<{ id: string } | null> {
    const result = await db
      .select({ id: games.id })
      .from(games)
      .where(eq(games.apiId, apiId))
    return result[0] || null
  }

  async existeSelecaoPorNome(name: string): Promise<boolean> {
    const result = await db
      .select({ id: teams.id })
      .from(teams)
      .where(eq(teams.name, name))
    return result.length > 0
  }

  async atualizarParticipantesJogo(
    gameId: string,
    team_a: string,
    team_b: string
  ): Promise<void> {
    await db
      .update(games)
      .set({
        team_a,
        team_b,
        updated_at: new Date(),
      })
      .where(eq(games.id, gameId))
  }

  async inserirJogo(data: {
    apiId: number
    team_a: string
    team_b: string
    fase:
      | 'GRUPOS'
      | '16_AVOS'
      | 'OITAVAS'
      | 'QUARTAS'
      | 'SEMI'
      | 'TERCEIRO'
      | 'FINAL'
    data_hora: Date
  }): Promise<void> {
    await db.insert(games).values({
      apiId: data.apiId,
      team_a: data.team_a,
      team_b: data.team_b,
      fase: data.fase,
      data_hora: data.data_hora,
      finish_game: false,
    })
  }

  async atualizarJogoPorApiId(data: {
    apiId: number
    team_a: string
    team_b: string
    fase:
      | 'GRUPOS'
      | '16_AVOS'
      | 'OITAVAS'
      | 'QUARTAS'
      | 'SEMI'
      | 'TERCEIRO'
      | 'FINAL'
    data_hora: Date
  }): Promise<void> {
    await db
      .update(games)
      .set({
        team_a: data.team_a,
        team_b: data.team_b,
        fase: data.fase,
        data_hora: data.data_hora,
        updated_at: new Date(),
      })
      .where(eq(games.apiId, data.apiId))
  }

  async atualizarResultadoJogo(
    gameId: string,
    gols_a: number,
    gols_b: number
  ): Promise<void> {
    await db
      .update(games)
      .set({
        gols_a,
        gols_b,
        finish_game: true,
        updated_at: new Date(),
      })
      .where(eq(games.id, gameId))
  }

  async resetarPontuacaoJogo(gameId: string): Promise<void> {
    // Resetar acertou das bet deste jogo
    await db.update(bet).set({ acertou: false }).where(eq(bet.gameId, gameId))
  }

  async buscarApostasPorJogo(gameId: string): Promise<
    Array<{
      id: number
      userId: string
      palpite: string
    }>
  > {
    return await db
      .select({
        id: bet.id,
        userId: bet.userId,
        palpite: bet.palpite,
      })
      .from(bet)
      .where(eq(bet.gameId, gameId))
  }

  async atualizarAcertoAposta(
    aposta_id: number,
    acertou: boolean
  ): Promise<void> {
    await db
      .update(bet)
      .set({ acertou, updated_at: new Date() })
      .where(eq(bet.id, aposta_id))
  }

  async getDashboard(): Promise<IDashboardResponse> {
    const totalUsuarios = await db.select({ count: count() }).from(users)
    const totalApostas = await db.select({ count: count() }).from(bet)
    const totalJogos = await db.select({ count: count() }).from(games)
    const jogosEncerrados = await db
      .select({ count: count() })
      .from(games)
      .where(eq(games.finish_game, true))
    const jogosPendentes = await db
      .select({ count: count() })
      .from(games)
      .where(eq(games.finish_game, false))

    const usuariosComApostas = await db
      .select({ count: count() })
      .from(users)
      .where(sql`EXISTS (SELECT 1 FROM bet WHERE bet.user_id = users.id)`)

    const mediaApostas = await db
      .select({
        media: sql<number>`ROUND(AVG(apostas_count), 2)`,
      })
      .from(
        sql`(SELECT user_id, COUNT(*) as apostas_count FROM bet GROUP BY user_id) as sub`
      )

    return {
      total_usuarios: Number(totalUsuarios[0].count),
      total_apostas: Number(totalApostas[0].count),
      total_jogos: Number(totalJogos[0].count),
      jogos_encerrados: Number(jogosEncerrados[0].count),
      jogos_pendentes: Number(jogosPendentes[0].count),
      usuarios_com_apostas: Number(usuariosComApostas[0].count),
      media_apostas_por_usuario: Number(mediaApostas[0]?.media || 0),
    }
  }
}
