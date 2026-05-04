import type { Grupo, ITeam } from '../interfaces/team.interface'
import type { TeamRepository } from '../repositories/team.repository'

export class TeamService {
  constructor(private teamRepository: TeamRepository) {}

  async listTeams(grupo?: Grupo): Promise<ITeam[]> {
    if (grupo) {
      return await this.teamRepository.findByGroup(grupo)
    }

    return await this.teamRepository.findAll()
  }
}
