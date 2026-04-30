import { pgEnum } from "drizzle-orm/pg-core";

export const faseEnum = pgEnum("fase", [
	"GRUPOS",
	"32_AVOS",
	"OITAVAS",
	"QUARTAS",
	"SEMI",
	"TERCEIRO",
	"FINAL",
]);

export const nivelEnum = pgEnum("nivel", [
	"INICIANTE",
	"BRONZE",
	"PRATA",
	"OURO",
	"PLATINA",
	"DIAMANTE",
]);
