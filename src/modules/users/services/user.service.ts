import type { ICreateUserDTO, IUser } from '../interfaces/user.interface'
import type { UserRepository } from '../repositories/user.repository'

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async createUser(data: ICreateUserDTO): Promise<IUser> {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Nome é obrigatório')
    }

    if (data.name.trim().length < 3) {
      throw new Error('Nome deve ter pelo menos 3 caracteres')
    }

    const alreadyExists = await this.userRepository.findByName(data.name.trim())
    if (alreadyExists) throw new Error('Nome já está em uso')
    return await this.userRepository.create(data.name.trim())
  }

  async listUsers(): Promise<IUser[]> {
    return await this.userRepository.findAll()
  }

  async getUserById(userId: string): Promise<IUser | null> {
    if (!userId) throw new Error('ID do usuário é obrigatório')
    return await this.userRepository.findById(userId)
  }
}
