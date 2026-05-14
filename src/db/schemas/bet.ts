import { sql } from 'drizzle-orm'
import {
  boolean,
  index,
  integer,
  pgTable,
  serial,
  timestamp,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { games } from './games'
import { users } from './users'

export const bet = pgTable(
  'bet',
  {
    id: serial('id').primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    gameId: uuid('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),

    // palpite: 'A', 'B', ou 'empate'
    palpite: varchar('palpite', { length: 10 }).notNull(),

    // resultado (calculado após jogo encerrar)
    acertou: boolean('acertou').default(false),
    pontos: integer('pontos').default(0).notNull(),
    usou_carta_dobro_pontos: boolean('usou_carta_dobro_pontos')
      .default(false)
      .notNull(),

    // controle
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),

    // garantir que usuário só aposta uma vez por jogo
    // unique: (user_id, game_id)
  },
  table => ({
    uniq_user_game: unique().on(table.userId, table.gameId),

    idx_usuario: index('idx_apostas_usuario').on(table.userId),
    idx_jogo: index('idx_apostas_jogo').on(table.gameId),
    idx_acertou: index('idx_apostas_acertou')
      .on(table.acertou)
      .where(sql`acertou = true`),
  })
)
