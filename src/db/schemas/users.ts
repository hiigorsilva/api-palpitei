import { integer, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom().notNull(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  carta_dobro_pontos: integer('carta_dobro_pontos').default(7).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
})
