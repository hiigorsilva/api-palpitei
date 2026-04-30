import type { ICreateUserDTO, IUser } from '../interfaces/user.interface'
import type { UserRepository } from '../repositories/user.repository'

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async createUser(data: ICreateUserDTO): Promise<IUser> {
    // validação: nome não pode ser vazio
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Nome é obrigatório')
    }

    // validação: nome mínimo 3 caracteres
    if (data.name.trim().length < 3) {
      throw new Error('Nome deve ter pelo menos 3 caracteres')
    }

    // verifica se nome já existe
    const existente = await this.userRepository.findByName(data.name.trim())
    if (existente) throw new Error('Nome já está em uso')
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
