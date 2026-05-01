import { and, count, eq } from 'drizzle-orm'
import { db } from '../../../db/connection'
import { games } from '../../../db/schemas/games'
import { teams } from '../../../db/schemas/teams'
import type {
  IIntegrationGameDTO,
  IIntegrationGameLookup,
  IIntegrationTeamDTO,
  IIntegrationTeamLookup,
} from '../interfaces/integration.interface'

export class IntegrationRepository {
  async buscarTimePorApiId(
    apiId: number
  ): Promise<IIntegrationTeamLookup | null> {
    const result = await db
      .select({ id: teams.id })
      .from(teams)
      .where(eq(teams.apiId, apiId))
    return result[0] || null
  }

  async criarTime(data: IIntegrationTeamDTO): Promise<void> {
    await db.insert(teams).values({
      apiId: data.apiId,
      name: data.name,
      code: data.code,
      logo: data.logo,
    })
  }

  async atualizarTime(apiId: number, data: IIntegrationTeamDTO): Promise<void> {
    await db
      .update(teams)
      .set({
        name: data.name,
        code: data.code,
        logo: data.logo,
        updated_at: new Date(),
      })
      .where(eq(teams.apiId, apiId))
  }

  async buscarJogoPorApiId(
    apiId: number
  ): Promise<IIntegrationGameLookup | null> {
    const result = await db
      .select({
        id: games.id,
        apiId: games.apiId,
        finish_game: games.finish_game,
        gols_a: games.gols_a,
        gols_b: games.gols_b,
      })
      .from(games)
      .where(eq(games.apiId, apiId))

    return result[0] || null
  }

  async buscarJogoPorConfrontoEData(
    teamA: string,
    teamB: string,
    dataHora: Date
  ): Promise<IIntegrationGameLookup | null> {
    const result = await db
      .select({
        id: games.id,
        apiId: games.apiId,
        finish_game: games.finish_game,
        gols_a: games.gols_a,
        gols_b: games.gols_b,
      })
      .from(games)
      .where(
        and(
          eq(games.team_a, teamA),
          eq(games.team_b, teamB),
          eq(games.data_hora, dataHora)
        )
      )

    return result[0] || null
  }

  async criarJogo(data: IIntegrationGameDTO): Promise<void> {
    await db.insert(games).values({
      apiId: data.apiId,
      team_a: data.team_a,
      team_b: data.team_b,
      fase: data.fase,
      data_hora: data.data_hora,
      gols_a: data.gols_a,
      gols_b: data.gols_b,
      finish_game: data.finish_game,
      updated_at: new Date(),
    })
  }

  async vincularApiIdJogo(gameId: string, apiId: number): Promise<void> {
    await db
      .update(games)
      .set({
        apiId,
        updated_at: new Date(),
      })
      .where(eq(games.id, gameId))
  }

  async atualizarJogo(
    gameId: string,
    data: Pick<IIntegrationGameDTO, 'gols_a' | 'gols_b' | 'finish_game'>
  ): Promise<void> {
    await db
      .update(games)
      .set({
        gols_a: data.gols_a,
        gols_b: data.gols_b,
        finish_game: data.finish_game,
        updated_at: new Date(),
      })
      .where(eq(games.id, gameId))
  }

  async contarJogos(): Promise<number> {
    const result = await db.select({ count: count() }).from(games)
    return result[0]?.count ?? 0
  }

  async contarTimes(): Promise<number> {
    const result = await db.select({ count: count() }).from(teams)
    return result[0]?.count ?? 0
  }
}
