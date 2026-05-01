import { eq, sql } from 'drizzle-orm'
import { db } from '../../../db/connection'
import { users } from '../../../db/schemas/users'
import type { IUser, IUserRepository } from '../interfaces/user.interface'

export class UserRepository implements IUserRepository {
  async create(name: string): Promise<IUser> {
    const result = await db.insert(users).values({ name }).returning()
    return result[0]
  }

  async findById(id: string): Promise<IUser | null> {
    const result = await db.select().from(users).where(eq(users.id, id))
    return result[0] || null
  }

  async findByName(name: string): Promise<IUser | null> {
    const result = await db
      .select()
      .from(users)
      .where(sql`lower(${users.name}) = lower(${name})`)
    return result[0] || null
  }

  async findAll(): Promise<IUser[]> {
    return await db.select().from(users)
  }
}
