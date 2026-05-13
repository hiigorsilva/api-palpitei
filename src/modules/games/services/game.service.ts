import type { GameFase, GameStatus, IGame } from '../interfaces/game.interface'
import type { GameRepository } from '../repositories/game.repository'

export class GameService {
  constructor(private gameRepository: GameRepository) {}

  async listAll(userId?: string): Promise<IGame[]> {
    return await this.gameRepository.listAll(userId)
  }

  async getById(id: string, userId?: string): Promise<IGame> {
    const game = await this.gameRepository.getById(id, userId)
    if (!game) {
      throw { statusCode: 404, message: 'Jogo não encontrado' }
    }
    return game
  }

  async listByFase(fase: GameFase, userId?: string): Promise<IGame[]> {
    return await this.gameRepository.listByFase(fase, userId)
  }

  async listByStatus(status: GameStatus, userId?: string): Promise<IGame[]> {
    return await this.gameRepository.listByStatus(status, userId)
  }

  async listPendentes(userId?: string): Promise<IGame[]> {
    return await this.gameRepository.listPendentes(userId)
  }

  async listHoje(userId?: string): Promise<IGame[]> {
    return await this.gameRepository.listHoje(userId)
  }
}
