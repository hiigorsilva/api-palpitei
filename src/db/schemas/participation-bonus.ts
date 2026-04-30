import { integer, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'
import { nivelEnum } from './enum'
import { users } from './users'

export const bonusParticipacao = pgTable('bonus_participacao', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),

  // progresso
  jogos_apostados: integer('jogos_apostados').default(0).notNull(),
  percentual: integer('percentual').default(0).notNull(),
  nivel: nivelEnum('nivel').default('INICIANTE').notNull(),
  bonus_concedido: integer('bonus_concedido').default(0).notNull(),

  updated_at: timestamp('updated_at').defaultNow().notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
})
