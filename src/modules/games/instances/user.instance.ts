import { BetRepository } from '../../bet/repositories/bet.repository'
import { GameController } from '../controllers/game.controller'
import { GameRepository } from '../repositories/game.repository'
import { GameService } from '../services/game.service'

const gameRepository = new GameRepository()
const betRepository = new BetRepository()
const gameService = new GameService(gameRepository, betRepository)
export const gameController = new GameController(gameService)
