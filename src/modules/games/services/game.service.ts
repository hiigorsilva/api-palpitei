import type { GameFase, GameStatus, IGame } from '../interfaces/game.interface'
import type { GameRepository } from '../repositories/game.repository'

export class GameService {
  constructor(private gameRepository: GameRepository) {}

  async listAll(): Promise<IGame[]> {
    return await this.gameRepository.listAll()
  }

  async getById(id: string): Promise<IGame> {
    const game = await this.gameRepository.getById(id)
    if (!game) {
      throw { statusCode: 404, message: 'Jogo não encontrado' }
    }
    return game
  }

  async listByFase(fase: GameFase): Promise<IGame[]> {
    return await this.gameRepository.listByFase(fase)
  }

  async listByStatus(status: GameStatus): Promise<IGame[]> {
    return await this.gameRepository.listByStatus(status)
  }

  async listPendentes(): Promise<IGame[]> {
    return await this.gameRepository.listPendentes()
  }

  async listHoje(): Promise<IGame[]> {
    return await this.gameRepository.listHoje()
  }
}
