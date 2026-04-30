import { integer, pgTable, serial, timestamp, uuid } from "drizzle-orm/pg-core";
import { nivelEnum } from "./enum";
import { users } from "./users";

export const bonusParticipacao = pgTable("bonus_participacao", {
	id: serial("id").primaryKey(),
	userId: uuid("user_id")
		.notNull()
		.unique()
		.references(() => users.id, { onDelete: "cascade" }),

	// progresso
	jogos_apostados: integer("jogos_apostados").default(0).notNull(),
	percentual: integer("percentual").default(0),
	nivel: nivelEnum("nivel").default("INICIANTE"),
	bonus_concedido: integer("bonus_concedido").default(0).notNull(),

	updated_at: timestamp("updated_at").defaultNow().notNull(),
	created_at: timestamp("created_at").defaultNow().notNull(),
});
