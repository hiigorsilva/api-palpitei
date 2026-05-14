import { isValidId } from '../../../shared/utils/helpers'
import type { GameRepository } from '../../games/repositories/game.repository'
import type { UserRepository } from '../../users/repositories/user.repository'
import type { IBet, IBetFull, Palpite } from '../interfaces/bet.interface'
import type { BetRepository } from '../repositories/bet.repository'

export class BetService {
  constructor(
    private betRepository: BetRepository,
    private gameRepository: GameRepository,
    private userRepository: UserRepository
  ) {}

  private verificarPrazo(dataHoraGame: Date): void {
    const dateNow = new Date()
    const diffMinutes = (dataHoraGame.getTime() - dateNow.getTime()) / 1000 / 60

    if (diffMinutes < 15) {
      throw {
        statusCode: 400,
        message:
          'Não é mais possível apostar. Jogo começa em menos de 15 minutos.',
      }
    }
  }

  async createBet(
    userId: string,
    gameId: string,
    palpite: Palpite,
    usarCartaDobroPontos = false
  ): Promise<IBet> {
    // Verificar se o ID do jogo é válido (uuid)
    if (!isValidId(gameId)) {
      throw { statusCode: 400, message: 'ID do jogo inválido' }
    }

    // Verificar se o ID do usuário é válido (uuid)
    if (!isValidId(userId)) {
      throw { statusCode: 400, message: 'ID do usuário inválido' }
    }

    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw { statusCode: 404, message: 'Usuário não encontrado' }
    }

    const game = await this.gameRepository.getById(gameId)
    if (!game) {
      throw { statusCode: 404, message: 'Jogo não encontrado' }
    }

    this.verificarPrazo(game.data_hora)

    const userHasBet = await this.betRepository.verifyIfUserHasBet(
      userId,
      gameId
    )
    if (userHasBet) {
      throw {
        statusCode: 400,
        message: 'Você já apostou neste jogo. Use PUT para editar.',
      }
    }

    return await this.betRepository.create(
      userId,
      gameId,
      palpite,
      usarCartaDobroPontos
    )
  }

  async editBet(id: number, userId: string, palpite: Palpite): Promise<IBet> {
    // Verificar se o ID do usuário é válido (uuid)
    if (!isValidId(userId)) {
      throw { statusCode: 400, message: 'ID do usuário inválido' }
    }

    const existingBet = await this.betRepository.getById(id)
    if (!existingBet) {
      throw { statusCode: 404, message: 'Aposta não encontrada' }
    }

    if (existingBet.userId !== userId) {
      throw {
        statusCode: 403,
        message: 'Você não pode editar a aposta de outro usuário',
      }
    }

    const game = await this.gameRepository.getById(existingBet.gameId)
    if (!game) {
      throw { statusCode: 404, message: 'Jogo não encontrado' }
    }

    this.verificarPrazo(game.data_hora)

    return await this.betRepository.update(id, palpite)
  }

  async listBetsByUser(userId: string): Promise<IBetFull[]> {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw { statusCode: 404, message: 'Usuário não encontrado' }
    }
    const bets = await this.betRepository.getByUser(userId)
    return bets
  }
}
