import { ChampionBetRepository } from '../../champion-bets/repositories/champion-bet.repository'
import { UserController } from '../controllers/user.controller'
import { UserRepository } from '../repositories/user.repository'
import { UserService } from '../services/user.service'

const userRepository = new UserRepository()
const championBetRepository = new ChampionBetRepository()
const userService = new UserService(userRepository, championBetRepository)
export const userController = new UserController(userService)
