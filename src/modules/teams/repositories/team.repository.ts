import { asc, eq, sql } from 'drizzle-orm'
import { db } from '../../../db/connection'
import { championBets } from '../../../db/schemas/champion-bets'
import { teams } from '../../../db/schemas/teams'
import type {
  Grupo,
  ITeam,
  ITeamRepository,
} from '../interfaces/team.interface'

export class TeamRepository implements ITeamRepository {
  private championBetSql(userId?: string) {
    if (!userId) return sql<boolean>`false`

    return sql<boolean>`exists (
      select 1 from ${championBets}
      where ${championBets.userId} = ${userId}
        and ${championBets.teamId} = ${teams.id}
    )`
  }

  private selectFields(userId?: string) {
    return {
      id: teams.id,
      apiId: teams.apiId,
      name: teams.name,
      code: teams.code,
      logo: teams.logo,
      continent: teams.continent,
      flagIcon: teams.flagIcon,
      flagUnicode: teams.flagUnicode,
      confed: teams.confed,
      group: teams.group,
      created_at: teams.created_at,
      updated_at: teams.updated_at,
      isPalpiteCampeao: this.championBetSql(userId),
    }
  }

  private toITeam(
    data: typeof teams.$inferSelect & { isPalpiteCampeao: boolean }
  ): ITeam {
    return {
      id: data.id,
      apiId: data.apiId,
      name: data.name,
      code: data.code,
      flag: data.logo,
      continent: data.continent,
      flag_icon: data.flagIcon,
      flag_unicode: data.flagUnicode,
      fifa_code: data.code,
      confed: data.confed,
      group: data.group,
      isPalpiteCampeao: data.isPalpiteCampeao,
      created_at: data.created_at,
      updated_at: data.updated_at,
    }
  }

  async findAll(userId?: string): Promise<ITeam[]> {
    const result = await db
      .select(this.selectFields(userId))
      .from(teams)
      .orderBy(asc(teams.group), asc(teams.name))

    return result.map(team => this.toITeam(team))
  }

  async findByGroup(group: Grupo, userId?: string): Promise<ITeam[]> {
    const result = await db
      .select(this.selectFields(userId))
      .from(teams)
      .where(eq(teams.group, group))
      .orderBy(asc(teams.name))

    return result.map(team => this.toITeam(team))
  }
}
