import { BetRepository } from '../../bet/repositories/bet.repository'
import { BonusProgressoRepository } from '../../bonus-progresso/repositories/bonus-progresso.repository'
import { BonusService } from '../../bonus-progresso/services/bonus-progresso.service'
import { ChampionBetRepository } from '../../champion-bets/repositories/champion-bet.repository'
import { GameRepository } from '../../games/repositories/game.repository'
import { UserRepository } from '../../users/repositories/user.repository'
import { AdminController } from '../controllers/admin.controller'
import { AdminRepository } from '../repositories/admin.repository'
import { AdminService } from '../services/admin.service'

const adminRepository = new AdminRepository()
const gameRepository = new GameRepository()
const betRepository = new BetRepository()
const championBetRepository = new ChampionBetRepository()
const bonusRepository = new BonusProgressoRepository()
const usuarioRepository = new UserRepository()

const bonusService = new BonusService(
  bonusRepository,
  betRepository,
  gameRepository,
  usuarioRepository
)

const adminService = new AdminService(
  adminRepository,
  gameRepository,
  betRepository,
  bonusService,
  championBetRepository
)

export const adminController = new AdminController(adminService)
