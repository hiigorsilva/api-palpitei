import {
  boolean,
  index,
  integer,
  pgTable,
  serial,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core'
import { teams } from './teams'
import { users } from './users'

export const championBets = pgTable(
  'champion_bets',
  {
    id: serial('id').primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    teamId: uuid('team_id')
      .notNull()
      .references(() => teams.id, { onDelete: 'cascade' }),
    acertou: boolean('acertou').default(false).notNull(),
    pontos: integer('pontos').default(0).notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    uniq_user_champion: unique().on(table.userId),
    idx_usuario: index('idx_champion_bets_usuario').on(table.userId),
    idx_time: index('idx_champion_bets_time').on(table.teamId),
  })
)
