import { isValidId } from '../../../shared/utils/helpers'
import type { ICreateUserDTO, IUser } from '../interfaces/user.interface'
import type { UserRepository } from '../repositories/user.repository'

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async createUser(data: ICreateUserDTO): Promise<IUser> {
    const name = data.name.trim()

    if (!data.name || name.length === 0) {
      throw { statusCode: 400, message: 'Nome é obrigatório' }
    }

    if (name.length < 3) {
      throw {
        statusCode: 400,
        message: 'Nome deve ter pelo menos 3 caracteres',
      }
    }

    const alreadyExists = await this.userRepository.findByName(name)
    if (alreadyExists) {
      throw { statusCode: 400, message: 'Nome já está em uso' }
    }
    try {
      return await this.userRepository.create(name)
    } catch (error: any) {
      if (
        error.code === '23505' ||
        error.message.includes('unique constraint')
      ) {
        throw { statusCode: 400, message: 'Este nome já está em uso' }
      }
      throw error
    }
  }

  async listUsers(): Promise<IUser[]> {
    return await this.userRepository.findAll()
  }

  async getUserById(userId: string): Promise<IUser | null> {
    if (!userId) {
      throw { statusCode: 400, message: 'ID do usuário é obrigatório' }
    }

    if (!isValidId(userId)) {
      throw { statusCode: 400, message: 'ID do usuário inválido' }
    }

    return await this.userRepository.findById(userId)
  }
}
