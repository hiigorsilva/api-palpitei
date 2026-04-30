import { GameController } from '../controllers/game.controller'
import { GameRepository } from '../repositories/game.repository'
import { GameService } from '../services/game.service'

const gameRepository = new GameRepository()
const gameService = new GameService(gameRepository)
export const gameController = new GameController(gameService)
