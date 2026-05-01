import { integer, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const teams = pgTable('teams', {
  id: uuid('id').primaryKey().defaultRandom(),
  apiId: integer('api_id').unique().notNull(), // ID da API externa
  name: varchar('name', { length: 100 }).notNull(),
  code: varchar('code', { length: 10 }),
  logo: varchar('logo', { length: 255 }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})
