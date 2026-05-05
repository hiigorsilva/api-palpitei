import { GameRepository } from '../../games/repositories/game.repository'
import { UserRepository } from '../../users/repositories/user.repository'
import { BetController } from '../controllers/bet.controller'
import { BetRepository } from '../repositories/bet.repository'
import { BetService } from '../services/bet.service'

const betRepository = new BetRepository()
const gameRepository = new GameRepository()
const userRepository = new UserRepository()

const betService = new BetService(betRepository, gameRepository, userRepository)

export const betController = new BetController(betService)
