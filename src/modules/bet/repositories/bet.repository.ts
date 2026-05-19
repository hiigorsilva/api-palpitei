import { and, count, countDistinct, eq, sql } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import { db } from '../../../db/connection'
import { bet } from '../../../db/schemas/bet'
import { games } from '../../../db/schemas/games'
import { teams } from '../../../db/schemas/teams'
import { users } from '../../../db/schemas/users'
import type { IGameBetResponse } from '../../games/interfaces/game.interface'
import type { Grupo, ITeamDetails } from '../../teams/interfaces/team.interface'
import type { IUserCartaHistoricoResponse } from '../../users/interfaces/user.interface'
import type {
  IBet,
  IBetFull,
  IBetRepository,
  IEstatisticasUsuario,
  Palpite,
} from '../interfaces/bet.interface'
import { palpiteSchema } from '../interfaces/bet.interface'

export class BetRepository implements IBetRepository {
  private readonly teamA = alias(teams, 'bet_team_a')
  private readonly teamB = alias(teams, 'bet_team_b')

  private teamDetails(data: {
    id: string | null
    name: string | null
    flag: string | null
    continent: string | null
    flagIcon: string | null
    flagUnicode: string | null
    fifaCode: string | null
    group: Grupo | null
    confed: string | null
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
      isPalpiteCampeao: false,
    }
  }

  private toIBet(data: {
    id: number
    userId: string
    gameId: string
    palpite: string
    acertou: boolean | null
    pontos: number
    usou_carta_dobro_pontos: boolean
    created_at: Date
    updated_at: Date
  }): IBet {
    return {
      ...data,
      palpite: palpiteSchema.parse(data.palpite),
      acertou: data.acertou ?? false,
      pontos: data.pontos,
      usou_carta_dobro_pontos: data.usou_carta_dobro_pontos,
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
    pontos: number
    usou_carta_dobro_pontos: boolean
    created_at: Date
    updated_at: Date
    username: string
    team_a: string
    team_b: string
    team_a_name: string | null
    team_a_id: string | null
    team_a_flag: string | null
    team_a_continent: string | null
    team_a_flag_icon: string | null
    team_a_flag_unicode: string | null
    team_a_fifa_code: string | null
    team_a_group: Grupo | null
    team_a_confed: string | null
    team_b_name: string | null
    team_b_id: string | null
    team_b_flag: string | null
    team_b_continent: string | null
    team_b_flag_icon: string | null
    team_b_flag_unicode: string | null
    team_b_fifa_code: string | null
    team_b_group: Grupo | null
    team_b_confed: string | null
    data_hora: Date
    gols_a: number | null
    gols_b: number | null
    finish_game: boolean
  }): IBetFull {
    return {
      id: data.id,
      userId: data.userId,
      gameId: data.gameId,
      palpite: palpiteSchema.parse(data.palpite),
      acertou: data.acertou ?? false,
      pontos: data.pontos,
      usou_carta_dobro_pontos: data.usou_carta_dobro_pontos,
      created_at: data.created_at.toISOString(),
      updated_at: data.updated_at.toISOString(),
      username: data.username,
      team_a: data.team_a,
      team_b: data.team_b,
      data_hora: data.data_hora.toISOString(),
      gols_a: data.gols_a,
      gols_b: data.gols_b,
      finish_game: data.finish_game,
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
      }),
    }
  }

  async create(
    userId: string,
    gameId: string,
    palpite: Palpite,
    usarCartaDobroPontos = false
  ): Promise<IBet> {
    return await db.transaction(async tx => {
      if (usarCartaDobroPontos) {
        const updatedUser = await tx
          .update(users)
          .set({
            carta_dobro_pontos: sql`${users.carta_dobro_pontos} - 1`,
          })
          .where(
            and(eq(users.id, userId), sql`${users.carta_dobro_pontos} > 0`)
          )
          .returning({ id: users.id })

        if (!updatedUser[0]) {
          throw {
            statusCode: 400,
            message: 'Você não possui cartas de dobro de pontos disponíveis.',
          }
        }
      }

      const result = await tx
        .insert(bet)
        .values({
          userId,
          gameId,
          palpite,
          usou_carta_dobro_pontos: usarCartaDobroPontos,
        })
        .returning()
      return this.toIBet(result[0])
    })
  }

  async update(
    id: number,
    userId: string,
    palpite: Palpite,
    usarCartaDobroPontos?: boolean
  ): Promise<IBet> {
    return await db.transaction(async tx => {
      const currentBet = await tx
        .select({
          id: bet.id,
          usou_carta_dobro_pontos: bet.usou_carta_dobro_pontos,
        })
        .from(bet)
        .where(eq(bet.id, id))

      const currentUseCard = currentBet[0]?.usou_carta_dobro_pontos ?? false
      const shouldUseCard = usarCartaDobroPontos ?? currentUseCard

      if (!currentUseCard && shouldUseCard) {
        const updatedUser = await tx
          .update(users)
          .set({
            carta_dobro_pontos: sql`${users.carta_dobro_pontos} - 1`,
          })
          .where(
            and(eq(users.id, userId), sql`${users.carta_dobro_pontos} > 0`)
          )
          .returning({ id: users.id })

        if (!updatedUser[0]) {
          throw {
            statusCode: 400,
            message: 'Você não possui cartas de dobro de pontos disponíveis.',
          }
        }
      }

      if (currentUseCard && !shouldUseCard) {
        await tx
          .update(users)
          .set({
            carta_dobro_pontos: sql`${users.carta_dobro_pontos} + 1`,
          })
          .where(eq(users.id, userId))
      }

      const result = await tx
        .update(bet)
        .set({
          palpite,
          usou_carta_dobro_pontos: shouldUseCard,
          updated_at: new Date(),
        })
        .where(eq(bet.id, id))
        .returning()

      return this.toIBet(result[0])
    })
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
        pontos: bet.pontos,
        usou_carta_dobro_pontos: bet.usou_carta_dobro_pontos,
        created_at: bet.created_at,
        updated_at: bet.updated_at,
        username: users.name,
        team_a: games.team_a,
        team_b: games.team_b,
        team_a_id: this.teamA.id,
        team_a_name: this.teamA.name,
        team_a_flag: this.teamA.logo,
        team_a_continent: this.teamA.continent,
        team_a_flag_icon: this.teamA.flagIcon,
        team_a_flag_unicode: this.teamA.flagUnicode,
        team_a_fifa_code: this.teamA.code,
        team_a_group: this.teamA.group,
        team_a_confed: this.teamA.confed,
        team_b_id: this.teamB.id,
        team_b_name: this.teamB.name,
        team_b_flag: this.teamB.logo,
        team_b_continent: this.teamB.continent,
        team_b_flag_icon: this.teamB.flagIcon,
        team_b_flag_unicode: this.teamB.flagUnicode,
        team_b_fifa_code: this.teamB.code,
        team_b_group: this.teamB.group,
        team_b_confed: this.teamB.confed,
        data_hora: games.data_hora,
        gols_a: games.gols_a,
        gols_b: games.gols_b,
        finish_game: games.finish_game,
      })
      .from(bet)
      .innerJoin(users, eq(bet.userId, users.id))
      .innerJoin(games, eq(bet.gameId, games.id))
      .leftJoin(this.teamA, eq(games.team_a, this.teamA.name))
      .leftJoin(this.teamB, eq(games.team_b, this.teamB.name))
      .where(eq(bet.userId, userId))
      .orderBy(games.data_hora)
    return result.map(betData => this.toIBetFull(betData))
  }

  async getByGame(gameId: string): Promise<IBet[]> {
    const result = await db.select().from(bet).where(eq(bet.gameId, gameId))
    return result.map(betData => this.toIBet(betData))
  }

  async getBetsByGame(gameId: string): Promise<IGameBetResponse[]> {
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
      palpite: palpiteSchema.parse(item.palpite),
      usou_carta_dobro_pontos: item.usou_carta_dobro_pontos,
      acertou: item.acertou ?? false,
      pontos: item.pontos,
    }))
  }

  async getCartaHistoricoByUser(
    userId: string
  ): Promise<IUserCartaHistoricoResponse[]> {
    const result = await db
      .select({
        gameId: bet.gameId,
        team_a: games.team_a,
        team_b: games.team_b,
        data_hora: games.data_hora,
        palpite: bet.palpite,
        acertou: bet.acertou,
        pontos: bet.pontos,
      })
      .from(bet)
      .innerJoin(games, eq(bet.gameId, games.id))
      .where(and(eq(bet.userId, userId), eq(bet.usou_carta_dobro_pontos, true)))
      .orderBy(games.data_hora)

    return result.map(item => ({
      gameId: item.gameId,
      team_a: item.team_a,
      team_b: item.team_b,
      data_hora: item.data_hora.toISOString(),
      palpite: palpiteSchema.parse(item.palpite),
      acertou: item.acertou ?? false,
      pontos: item.pontos,
    }))
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
        pontos_apostas: sql<number>`cast(coalesce(sum(${bet.pontos}), 0) as int)`,
      })
      .from(bet)
      .where(eq(bet.userId, userId))
    const row = result[0]
    if (!row || row.total_apostas === 0) return null
    return {
      acertos: row.acertos,
      total_apostas: row.total_apostas,
      pontos_apostas: row.pontos_apostas,
    }
  }
}
