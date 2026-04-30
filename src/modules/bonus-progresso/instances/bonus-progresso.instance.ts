import { BetRepository } from '../../bet/repositories/bet.repository'
import { GameRepository } from '../../games/repositories/game.repository'
import { UserRepository } from '../../users/repositories/user.repository'
import { BonusProgressoController } from '../controllers/bonus-progresso.controller'
import { BonusProgressoRepository } from '../repositories/bonus-progresso.repository'
import { BonusService } from '../services/bonus-progresso.service'

const bonusProgressoRepository = new BonusProgressoRepository()
const betRepository = new BetRepository()
const gameRepository = new GameRepository()
const userRepository = new UserRepository()

const bonusService = new BonusService(
  bonusProgressoRepository,
  betRepository,
  gameRepository,
  userRepository
)

export const bonusProgressoController = new BonusProgressoController(
  bonusService
)
