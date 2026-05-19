import { isValidId } from '../../../shared/utils/helpers'
import type { BetRepository } from '../../bet/repositories/bet.repository'
import type { BonusService } from '../../bonus-progresso/services/bonus-progresso.service'
import type { ChampionBetRepository } from '../../champion-bets/repositories/champion-bet.repository'
import type {
  IChampionBetResponse,
  ICreateUserDTO,
  IUser,
  IUserCartaHistoricoResponse,
  IUserWithProgress,
} from '../interfaces/user.interface'
import type { UserRepository } from '../repositories/user.repository'

const CHAMPION_BET_DEADLINE = new Date('2026-07-14T18:00:00.000Z')

export class UserService {
  constructor(
    private userRepository: UserRepository,
    private championBetRepository: ChampionBetRepository,
    private bonusService: BonusService,
    private betRepository: BetRepository
  ) {}

  private normalizeName(name: string): string {
    return name.trim().replace(/\s+/g, ' ')
  }

  private validateName(name: string): void {
    if (!name || name.length === 0) {
      throw { statusCode: 400, message: 'Nome é obrigatório' }
    }

    if (name.length < 3) {
      throw {
        statusCode: 400,
        message: 'Nome deve ter pelo menos 3 caracteres',
      }
    }
  }

  async createUser(data: ICreateUserDTO): Promise<IUser> {
    const name = this.normalizeName(data.name)

    this.validateName(name)

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

  async loginByName(data: ICreateUserDTO): Promise<IUser> {
    const name = this.normalizeName(data.name)

    this.validateName(name)

    const alreadyExists = await this.userRepository.findByName(name)
    if (alreadyExists) return alreadyExists

    try {
      return await this.userRepository.create(name)
    } catch (error: any) {
      if (
        error.code === '23505' ||
        error.message.includes('unique constraint')
      ) {
        const user = await this.userRepository.findByName(name)
        if (user) return user
      }

      throw error
    }
  }

  private async toUserWithProgress(user: IUser): Promise<IUserWithProgress> {
    const progress = await this.bonusService.getProgressoUser(user.id)

    return {
      ...user,
      bonus_concedido: progress.bonus_concedido,
      jogos_apostados: progress.jogos_apostados,
      nivel_atual: progress.nivel_atual,
      percentual: progress.percentual,
      proximo_nivel: progress.proximo_nivel,
      total_jogos: progress.total_jogos,
    }
  }

  async listUsers(): Promise<IUserWithProgress[]> {
    const users = await this.userRepository.findAll()
    return await Promise.all(users.map(user => this.toUserWithProgress(user)))
  }

  async getUserById(userId: string): Promise<IUserWithProgress | null> {
    if (!userId) {
      throw { statusCode: 400, message: 'ID do usuário é obrigatório' }
    }

    if (!isValidId(userId)) {
      throw { statusCode: 400, message: 'ID do usuário inválido' }
    }

    const user = await this.userRepository.findById(userId)
    return user ? await this.toUserWithProgress(user) : null
  }

  async chooseChampionBet(
    userId: string,
    teamId: string
  ): Promise<IChampionBetResponse> {
    if (!isValidId(userId)) {
      throw { statusCode: 400, message: 'ID do usuário inválido' }
    }

    if (!isValidId(teamId)) {
      throw { statusCode: 400, message: 'ID da seleção inválido' }
    }

    if (new Date() > CHAMPION_BET_DEADLINE) {
      throw {
        statusCode: 400,
        message: 'Não é mais possível apostar no campeão.',
      }
    }

    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw { statusCode: 404, message: 'Usuário não encontrado' }
    }

    const team = await this.championBetRepository.findTeamById(teamId)
    if (!team) {
      throw { statusCode: 404, message: 'Seleção não encontrada' }
    }

    const championBet = await this.championBetRepository.upsert(userId, teamId)

    return {
      ...championBet,
      teamName: team.name,
    }
  }

  async getCartaHistorico(
    userId: string
  ): Promise<IUserCartaHistoricoResponse[]> {
    if (!isValidId(userId)) {
      throw { statusCode: 400, message: 'ID do usuário inválido' }
    }

    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw { statusCode: 404, message: 'Usuário não encontrado' }
    }

    return await this.betRepository.getCartaHistoricoByUser(userId)
  }
}
