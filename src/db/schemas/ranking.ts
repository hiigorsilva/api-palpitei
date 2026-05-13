import { integer, pgTable, serial, timestamp, uuid } from 'drizzle-orm/pg-core'
import { users } from './users'

export const ranking = pgTable('ranking', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),

  // estatísticas
  pontos_apostas: integer('pontos_apostas').default(0).notNull(), // 3 pontos por acerto
  pontos_bonus: integer('pontos_bonus').default(0).notNull(), // bônus de participação
  pontos_campeao: integer('pontos_campeao').default(0).notNull(), // bônus por acertar campeão
  pontos_total: integer('pontos_total').default(0).notNull(), // soma dos pontos

  acertos: integer('acertos').default(0).notNull(),
  total_apostas: integer('total_apostas').default(0).notNull(),

  updated_at: timestamp('updated_at').defaultNow().notNull(),
})
