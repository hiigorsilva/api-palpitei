import { and, count, eq, gt, gte, lte, sql } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import { db } from '../../../db/connection'
import { bet } from '../../../db/schemas/bet'
import { games } from '../../../db/schemas/games'
import { teams } from '../../../db/schemas/teams'
import type { ITeamDetails } from '../../teams/interfaces/team.interface'
import type {
  GameFase,
  GameStatus,
  IGame,
  IGameRepository,
} from '../interfaces/game.interface'

export class GameRepository implements IGameRepository {
  private readonly teamA = alias(teams, 'team_a')
  private readonly teamB = alias(teams, 'team_b')

  private teamDetails(data: {
    name: string | null
    flag: string | null
    continent: string | null
    flagIcon: string | null
    flagUnicode: string | null
    fifaCode: string | null
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
      | null
    confed: string | null
  }): ITeamDetails | null {
    if (!data.name || !data.group) return null

    return {
      name: data.name,
      flag: data.flag,
      continent: data.continent,
      flag_icon: data.flagIcon,
      flag_unicode: data.flagUnicode,
      fifa_code: data.fifaCode,
      group: data.group,
      confed: data.confed,
    }
  }

  private selectWithTeams() {
    return db
      .select({
        id: games.id,
        team_a: games.team_a,
        team_b: games.team_b,
        fase: games.fase,
        data_hora: games.data_hora,
        gols_a: games.gols_a,
        gols_b: games.gols_b,
        finish_game: games.finish_game,
        has_palpite: sql<boolean>`exists (
          select 1 from ${bet}
          where ${bet.gameId} = ${games.id}
        )`,
        created_at: games.created_at,
        updated_at: games.updated_at,
        team_a_name: this.teamA.name,
        team_a_flag: this.teamA.logo,
        team_a_continent: this.teamA.continent,
        team_a_flag_icon: this.teamA.flagIcon,
        team_a_flag_unicode: this.teamA.flagUnicode,
        team_a_fifa_code: this.teamA.code,
        team_a_group: this.teamA.group,
        team_a_confed: this.teamA.confed,
        team_b_name: this.teamB.name,
        team_b_flag: this.teamB.logo,
        team_b_continent: this.teamB.continent,
        team_b_flag_icon: this.teamB.flagIcon,
        team_b_flag_unicode: this.teamB.flagUnicode,
        team_b_fifa_code: this.teamB.code,
        team_b_group: this.teamB.group,
        team_b_confed: this.teamB.confed,
      })
      .from(games)
      .leftJoin(this.teamA, eq(games.team_a, this.teamA.name))
      .leftJoin(this.teamB, eq(games.team_b, this.teamB.name))
  }

  private toIGame(
    data: Awaited<ReturnType<typeof this.selectWithTeams>>[number]
  ): IGame {
    return {
      id: data.id,
      team_a: data.team_a,
      team_b: data.team_b,
      team_a_info: this.teamDetails({
        name: data.team_a_name,
        flag: data.team_a_flag,
        continent: data.team_a_continent,
        flagIcon: data.team_a_flag_icon,
        flagUnicode: data.team_a_flag_unicode,
        fifaCode: data.team_a_fifa_code,
        group: data.team_a_group,
        confed: data.team_a_confed,
      }),
      team_b_info: this.teamDetails({
        name: data.team_b_name,
        flag: data.team_b_flag,
        continent: data.team_b_continent,
        flagIcon: data.team_b_flag_icon,
        flagUnicode: data.team_b_flag_unicode,
        fifaCode: data.team_b_fifa_code,
        group: data.team_b_group,
        confed: data.team_b_confed,
      }),
      fase: data.fase,
      data_hora: data.data_hora,
      gols_a: data.gols_a,
      gols_b: data.gols_b,
      finish_game: data.finish_game,
      has_palpite: data.has_palpite,
      created_at: data.created_at,
      updated_at: data.updated_at,
    }
  }

  async listAll(): Promise<IGame[]> {
    const result = await this.selectWithTeams().orderBy(games.data_hora)
    return result.map(game => this.toIGame(game))
  }

  async getById(id: string): Promise<IGame | null> {
    const result = await this.selectWithTeams().where(eq(games.id, id))
    return result[0] ? this.toIGame(result[0]) : null
  }

  async listByFase(fase: GameFase): Promise<IGame[]> {
    const result = await this.selectWithTeams()
      .where(eq(games.fase, fase))
      .orderBy(games.data_hora)

    return result.map(game => this.toIGame(game))
  }

  async listByStatus(status: GameStatus): Promise<IGame[]> {
    const agora = new Date()

    if (status === 'FUTURO') {
      const result = await this.selectWithTeams()
        .where(gt(games.data_hora, agora))
        .orderBy(games.data_hora)

      return result.map(game => this.toIGame(game))
    }

    // status === 'finish_game'
    const result = await this.selectWithTeams()
      .where(eq(games.finish_game, true))
      .orderBy(games.data_hora)

    return result.map(game => this.toIGame(game))
  }

  async updateResult(
    id: string,
    gols_a: number,
    gols_b: number
  ): Promise<IGame> {
    const result = await db
      .update(games)
      .set({
        gols_a,
        gols_b,
        finish_game: true,
        updated_at: new Date(),
      })
      .where(eq(games.id, id))
      .returning()

    const game = await this.getById(result[0].id)
    if (!game) {
      throw new Error('Jogo atualizado não encontrado')
    }

    return game
  }

  async contarTotalJogos(): Promise<number> {
    const result = await db.select({ count: count() }).from(games)
    return result[0]?.count ?? 0
  }

  async listPendentes(): Promise<IGame[]> {
    const result = await this.selectWithTeams()
      .where(eq(games.finish_game, false))
      .orderBy(games.data_hora)

    return result.map(game => this.toIGame(game))
  }

  async listHoje(): Promise<IGame[]> {
    const hoje = new Date()
    const inicio = new Date(
      Date.UTC(
        hoje.getUTCFullYear(),
        hoje.getUTCMonth(),
        hoje.getUTCDate(),
        0,
        0,
        0,
        0
      )
    )
    const fim = new Date(
      Date.UTC(
        hoje.getUTCFullYear(),
        hoje.getUTCMonth(),
        hoje.getUTCDate(),
        23,
        59,
        59,
        999
      )
    )
    const result = await this.selectWithTeams()
      .where(and(gte(games.data_hora, inicio), lte(games.data_hora, fim)))
      .orderBy(games.data_hora)

    return result.map(game => this.toIGame(game))
  }
}
