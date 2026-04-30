import { count, eq, gt } from 'drizzle-orm'
import { db } from '../../../db/connection'
import { games } from '../../../db/schemas/games'
import type {
  GameFase,
  GameStatus,
  IGame,
  IGameRepository,
} from '../interfaces/game.interface'

export class GameRepository implements IGameRepository {
  async listAll(): Promise<IGame[]> {
    return await db.select().from(games).orderBy(games.data_hora)
  }

  async getById(id: string): Promise<IGame | null> {
    const result = await db.select().from(games).where(eq(games.id, id))
    return result[0] || null
  }

  async listByFase(fase: GameFase): Promise<IGame[]> {
    return await db
      .select()
      .from(games)
      .where(eq(games.fase, fase))
      .orderBy(games.data_hora)
  }

  async listByStatus(status: GameStatus): Promise<IGame[]> {
    const agora = new Date()

    if (status === 'FUTURO') {
      return await db
        .select()
        .from(games)
        .where(gt(games.data_hora, agora))
        .orderBy(games.data_hora)
    }

    // status === 'finish_game'
    return await db
      .select()
      .from(games)
      .where(eq(games.finish_game, true))
      .orderBy(games.data_hora)
  }

  async updateResult(
    id: string,
    gols_a: number,
    gols_b: number
  ): Promise<IGame> {
    const result = await db
      .update(games)
      .set({
        gols_a,
        gols_b,
        finish_game: true,
        updated_at: new Date(),
      })
      .where(eq(games.id, id))
      .returning()
    return result[0]
  }

  async contarTotalJogos(): Promise<number> {
    const result = await db.select({ count: count() }).from(games)
    return result[0]?.count ?? 0
  }
}
