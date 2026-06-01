import { and, count, eq, gt, gte, lte, sql } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import { db } from '../../../db/connection'
import { bet } from '../../../db/schemas/bet'
import { championBets } from '../../../db/schemas/champion-bets'
import { games } from '../../../db/schemas/games'
import { teams } from '../../../db/schemas/teams'
import { users } from '../../../db/schemas/users'
import type { ITeamDetails } from '../../teams/interfaces/team.interface'
import type {
  GameFase,
  GameStatus,
  IGame,
  IGameRepository,
} from '../interfaces/game.interface'

const EMPTY_USER_ID = '00000000-0000-0000-0000-000000000000'

export class GameRepository implements IGameRepository {
  private readonly teamA = alias(teams, 'team_a')
  private readonly teamB = alias(teams, 'team_b')
  private readonly championBetA = alias(championBets, 'team_a_champion_bet')
  private readonly championBetB = alias(championBets, 'team_b_champion_bet')

  private teamDetails(data: {
    id: string | null
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
    isPalpiteCampeao: boolean
  }): ITeamDetails | null {
    if (!data.id || !data.name || !data.group) return null

    return {
      id: data.id,
      name: data.name,
      flag: data.flag,
      continent: data.continent,
      flag_icon: data.flagIcon,
      flag_unicode: data.flagUnicode,
      fifa_code: data.fifaCode,
      group: data.group,
      confed: data.confed,
      isPalpiteCampeao: data.isPalpiteCampeao,
    }
  }

  private selectWithTeams(userId?: string) {
    const effectiveUserId = userId ?? EMPTY_USER_ID

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
            and ${bet.userId} = ${effectiveUserId}
        )`,
        usou_carta_dobro_pontos: sql<boolean>`exists (
          select 1 from ${bet}
          where ${bet.gameId} = ${games.id}
            and ${bet.userId} = ${effectiveUserId}
            and ${bet.usou_carta_dobro_pontos} = true
        )`,
        created_at: games.created_at,
        updated_at: games.updated_at,
        team_a_id: this.teamA.id,
        team_a_name: this.teamA.name,
        team_a_flag: this.teamA.logo,
        team_a_continent: this.teamA.continent,
        team_a_flag_icon: this.teamA.flagIcon,
        team_a_flag_unicode: this.teamA.flagUnicode,
        team_a_fifa_code: this.teamA.code,
        team_a_group: this.teamA.group,
        team_a_confed: this.teamA.confed,
        team_a_is_palpite_campeao: sql<boolean>`${this.championBetA.id} is not null`,
        team_b_id: this.teamB.id,
        team_b_name: this.teamB.name,
        team_b_flag: this.teamB.logo,
        team_b_continent: this.teamB.continent,
        team_b_flag_icon: this.teamB.flagIcon,
        team_b_flag_unicode: this.teamB.flagUnicode,
        team_b_fifa_code: this.teamB.code,
        team_b_group: this.teamB.group,
        team_b_confed: this.teamB.confed,
        team_b_is_palpite_campeao: sql<boolean>`${this.championBetB.id} is not null`,
      })
      .from(games)
      .leftJoin(this.teamA, eq(games.team_a, this.teamA.name))
      .leftJoin(this.teamB, eq(games.team_b, this.teamB.name))
      .leftJoin(
        this.championBetA,
        and(
          eq(this.championBetA.userId, userId ?? EMPTY_USER_ID),
          eq(this.championBetA.teamId, this.teamA.id)
        )
      )
      .leftJoin(
        this.championBetB,
        and(
          eq(this.championBetB.userId, userId ?? EMPTY_USER_ID),
          eq(this.championBetB.teamId, this.teamB.id)
        )
      )
  }

  private toIGame(
    data: Awaited<ReturnType<typeof this.selectWithTeams>>[number]
  ): IGame {
    return {
      id: data.id,
      team_a: data.team_a,
      team_b: data.team_b,
      team_a_info: this.teamDetails({
        id: data.team_a_id,
        name: data.team_a_name,
        flag: data.team_a_flag,
        continent: data.team_a_continent,
        flagIcon: data.team_a_flag_icon,
        flagUnicode: data.team_a_flag_unicode,
        fifaCode: data.team_a_fifa_code,
        group: data.team_a_group,
        confed: data.team_a_confed,
        isPalpiteCampeao: data.team_a_is_palpite_campeao,
      }),
      team_b_info: this.teamDetails({
        id: data.team_b_id,
        name: data.team_b_name,
        flag: data.team_b_flag,
        continent: data.team_b_continent,
        flagIcon: data.team_b_flag_icon,
        flagUnicode: data.team_b_flag_unicode,
        fifaCode: data.team_b_fifa_code,
        group: data.team_b_group,
        confed: data.team_b_confed,
        isPalpiteCampeao: data.team_b_is_palpite_campeao,
      }),
      fase: data.fase,
      data_hora: data.data_hora,
      gols_a: data.gols_a,
      gols_b: data.gols_b,
      finish_game: data.finish_game,
      has_palpite: data.has_palpite,
      usou_carta_dobro_pontos: data.usou_carta_dobro_pontos,
      created_at: data.created_at,
      updated_at: data.updated_at,
    }
  }

  async listAll(userId?: string): Promise<IGame[]> {
    const result = await this.selectWithTeams(userId).orderBy(games.data_hora)
    return result.map(game => this.toIGame(game))
  }

  async getById(id: string, userId?: string): Promise<IGame | null> {
    const result = await this.selectWithTeams(userId).where(eq(games.id, id))
    return result[0] ? this.toIGame(result[0]) : null
  }

  async listByFase(fase: GameFase, userId?: string): Promise<IGame[]> {
    const result = await this.selectWithTeams(userId)
      .where(eq(games.fase, fase))
      .orderBy(games.data_hora)

    return result.map(game => this.toIGame(game))
  }

  async listByStatus(status: GameStatus, userId?: string): Promise<IGame[]> {
    const agora = new Date()

    if (status === 'FUTURO') {
      const result = await this.selectWithTeams(userId)
        .where(gt(games.data_hora, agora))
        .orderBy(games.data_hora)

      return result.map(game => this.toIGame(game))
    }

    // status === 'finish_game'
    const result = await this.selectWithTeams(userId)
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

  async getBetsByGame(gameId: string) {
    const result = await db
      .select({
        userId: bet.userId,
        name: users.name,
        palpite: bet.palpite,
        usou_carta_dobro_pontos: bet.usou_carta_dobro_pontos,
        acertou: bet.acertou,
        pontos: bet.pontos,
      })
      .from(bet)
      .innerJoin(users, eq(bet.userId, users.id))
      .where(eq(bet.gameId, gameId))
      .orderBy(bet.created_at)

    return result.map(item => ({
      userId: item.userId,
      name: item.name,
      palpite: item.palpite as 'A' | 'B' | 'EMPATE',
      usou_carta_dobro_pontos: item.usou_carta_dobro_pontos,
      acertou: item.acertou ?? false,
      pontos: item.pontos,
    }))
  }

  async listPendentes(userId?: string): Promise<IGame[]> {
    const result = await this.selectWithTeams(userId)
      .where(eq(games.finish_game, false))
      .orderBy(games.data_hora)

    return result.map(game => this.toIGame(game))
  }

  async listHoje(userId?: string): Promise<IGame[]> {
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
    const result = await this.selectWithTeams(userId)
      .where(and(gte(games.data_hora, inicio), lte(games.data_hora, fim)))
      .orderBy(games.data_hora)

    return result.map(game => this.toIGame(game))
  }
}
