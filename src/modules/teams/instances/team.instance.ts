import { TeamController } from '../controllers/team.controller'
import { TeamRepository } from '../repositories/team.repository'
import { TeamService } from '../services/team.service'

const teamRepository = new TeamRepository()
const teamService = new TeamService(teamRepository)

export const teamController = new TeamController(teamService)
