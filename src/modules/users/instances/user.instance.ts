import { BetRepository } from '../../bet/repositories/bet.repository'
import { BonusProgressoRepository } from '../../bonus-progresso/repositories/bonus-progresso.repository'
import { BonusService } from '../../bonus-progresso/services/bonus-progresso.service'
import { ChampionBetRepository } from '../../champion-bets/repositories/champion-bet.repository'
import { GameRepository } from '../../games/repositories/game.repository'
import { UserController } from '../controllers/user.controller'
import { UserRepository } from '../repositories/user.repository'
import { UserService } from '../services/user.service'

const userRepository = new UserRepository()
const championBetRepository = new ChampionBetRepository()
const bonusProgressoRepository = new BonusProgressoRepository()
const betRepository = new BetRepository()
const gameRepository = new GameRepository()
const bonusService = new BonusService(
  bonusProgressoRepository,
  betRepository,
  gameRepository,
  userRepository
)
const userService = new UserService(
  userRepository,
  championBetRepository,
  bonusService,
  betRepository
)
export const userController = new UserController(userService)
