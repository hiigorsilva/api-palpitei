import { UserController } from '../controllers/user.controller'
import { UserRepository } from '../repositories/user.repository'
import { UserService } from '../services/user.service'

const userRepository = new UserRepository()
const userService = new UserService(userRepository)
export const userController = new UserController(userService)
