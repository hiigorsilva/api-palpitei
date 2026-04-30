import { GameRepository } from '../../games/repositories/game.repository'
import { GameService } from '../../games/services/game.service'
import { UserRepository } from '../../users/repositories/user.repository'
import { BetController } from '../controllers/bet.controller'
import { BetRepository } from '../repositories/bet.repository'
import { BetService } from '../services/bet.service'

const betRepository = new BetRepository()
const gameRepository = new GameRepository()
const userRepository = new UserRepository()

const betService = new BetService(betRepository, gameRepository, userRepository)
const gameService = new GameService(gameRepository)

export const betController = new BetController(betService, gameService)
