import {
  boolean,
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { faseEnum } from './enum'

export const games = pgTable('games', {
  id: uuid('id').primaryKey().defaultRandom().notNull(),
  apiId: integer('api_id').unique(), // 👈 novo campo

  // duas seleções (ordem não importa para regra de negócio)
  team_a: varchar('team_a', { length: 100 }).notNull(),
  team_b: varchar('team_b', { length: 100 }).notNull(),

  // dados do jogo
  fase: faseEnum('fase').notNull(),
  data_hora: timestamp('data_hora', { withTimezone: true }).notNull(),

  // resultado real (null antes do jogo)
  gols_a: integer('gols_a'),
  gols_b: integer('gols_b'),

  // status
  finish_game: boolean('finish_game').default(false).notNull(),

  // controle
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})
