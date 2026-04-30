import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: uuid("id").primaryKey().defaultRandom().notNull(),
	name: varchar("name", { length: 50 }).notNull().unique(),
	created_at: timestamp("created_at").defaultNow().notNull(),
});
