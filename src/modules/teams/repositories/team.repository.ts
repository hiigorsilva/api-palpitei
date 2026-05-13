import { asc, eq } from 'drizzle-orm'
import { db } from '../../../db/connection'
import { teams } from '../../../db/schemas/teams'
import type {
  Grupo,
  ITeam,
  ITeamRepository,
} from '../interfaces/team.interface'

export class TeamRepository implements ITeamRepository {
  private toITeam(data: typeof teams.$inferSelect): ITeam {
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
      created_at: data.created_at,
      updated_at: data.updated_at,
    }
  }

  async findAll(): Promise<ITeam[]> {
    const result = await db
      .select()
      .from(teams)
      .orderBy(asc(teams.group), asc(teams.name))

    return result.map(team => this.toITeam(team))
  }

  async findByGroup(group: Grupo): Promise<ITeam[]> {
    const result = await db
      .select()
      .from(teams)
      .where(eq(teams.group, group))
      .orderBy(asc(teams.name))

    return result.map(team => this.toITeam(team))
  }
}
