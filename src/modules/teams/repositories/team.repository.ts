import { asc, eq } from 'drizzle-orm'
import { db } from '../../../db/connection'
import { teams } from '../../../db/schemas/teams'
import type {
  Grupo,
  ITeam,
  ITeamRepository,
} from '../interfaces/team.interface'

export class TeamRepository implements ITeamRepository {
  async findAll(): Promise<ITeam[]> {
    return await db
      .select()
      .from(teams)
      .orderBy(asc(teams.group), asc(teams.name))
  }

  async findByGroup(group: Grupo): Promise<ITeam[]> {
    return await db
      .select()
      .from(teams)
      .where(eq(teams.group, group))
      .orderBy(asc(teams.name))
  }
}
