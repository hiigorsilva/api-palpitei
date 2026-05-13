import { integer, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { grupoEnum } from './enum'

export const teams = pgTable('teams', {
  id: uuid('id').primaryKey().defaultRandom(),
  apiId: integer('api_id').unique().notNull(), // ID da API externa
  name: varchar('name', { length: 100 }).notNull(),
  code: varchar('code', { length: 10 }),
  logo: varchar('logo', { length: 255 }),
  continent: varchar('continent', { length: 50 }),
  flagIcon: varchar('flag_icon', { length: 20 }),
  flagUnicode: varchar('flag_unicode', { length: 100 }),
  confed: varchar('confed', { length: 20 }),
  group: grupoEnum('group').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})
