import { eq } from 'drizzle-orm'
import { db } from '../../../db/connection'
import { bonusParticipacao } from '../../../db/schemas/participation-bonus'
import type {
  IBonusProgressoRepository,
  IUserBonusProgresso,
} from '../interfaces/bonus-progresso.interface'

export class BonusProgressoRepository implements IBonusProgressoRepository {
  async getOrCreate(userId: string): Promise<IUserBonusProgresso> {
    const existente = await this.getByUserId(userId)
    if (existente) return existente

    const result = await db
      .insert(bonusParticipacao)
      .values({
        userId,
        jogos_apostados: 0,
        percentual: 0,
        nivel: 'INICIANTE',
        bonus_concedido: 0,
      })
      .returning()
    return result[0]
  }

  async update(
    userId: string,
    data: Partial<IUserBonusProgresso>
  ): Promise<IUserBonusProgresso> {
    const result = await db
      .update(bonusParticipacao)
      .set({ ...data, updated_at: new Date() })
      .where(eq(bonusParticipacao.userId, userId))
      .returning()
    return result[0]
  }

  async getByUserId(userId: string): Promise<IUserBonusProgresso | null> {
    const result = await db
      .select()
      .from(bonusParticipacao)
      .where(eq(bonusParticipacao.userId, userId))
    return result[0] || null
  }
}
