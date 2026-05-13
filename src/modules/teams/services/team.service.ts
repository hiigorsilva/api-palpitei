import type { Grupo, ITeam } from '../interfaces/team.interface'
import type { TeamRepository } from '../repositories/team.repository'

export class TeamService {
  constructor(private teamRepository: TeamRepository) {}

  async listTeams(grupo?: Grupo, userId?: string): Promise<ITeam[]> {
    if (grupo) {
      return await this.teamRepository.findByGroup(grupo, userId)
    }

    return await this.teamRepository.findAll(userId)
  }
}
