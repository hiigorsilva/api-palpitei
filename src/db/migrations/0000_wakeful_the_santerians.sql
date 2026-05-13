CREATE TYPE "public"."fase" AS ENUM('GRUPOS', '16_AVOS', 'OITAVAS', 'QUARTAS', 'SEMI', 'TERCEIRO', 'FINAL');--> statement-breakpoint
CREATE TYPE "public"."grupo" AS ENUM('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L');--> statement-breakpoint
CREATE TYPE "public"."nivel" AS ENUM('INICIANTE', 'BRONZE', 'PRATA', 'OURO', 'PLATINA', 'DIAMANTE');--> statement-breakpoint
CREATE TABLE "bet" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"game_id" uuid NOT NULL,
	"palpite" varchar(10) NOT NULL,
	"acertou" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bet_user_id_game_id_unique" UNIQUE("user_id","game_id")
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"api_id" integer,
	"team_a" varchar(100) NOT NULL,
	"team_b" varchar(100) NOT NULL,
	"fase" "fase" NOT NULL,
	"data_hora" timestamp with time zone NOT NULL,
	"gols_a" integer,
	"gols_b" integer,
	"finish_game" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "games_api_id_unique" UNIQUE("api_id")
);
--> statement-breakpoint
CREATE TABLE "bonus_participacao" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"jogos_apostados" integer DEFAULT 0 NOT NULL,
	"percentual" integer DEFAULT 0 NOT NULL,
	"nivel" "nivel" DEFAULT 'INICIANTE' NOT NULL,
	"bonus_concedido" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bonus_participacao_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "ranking" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"pontos_apostas" integer DEFAULT 0 NOT NULL,
	"pontos_bonus" integer DEFAULT 0 NOT NULL,
	"pontos_total" integer DEFAULT 0 NOT NULL,
	"acertos" integer DEFAULT 0 NOT NULL,
	"total_apostas" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ranking_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"api_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"code" varchar(10),
	"logo" varchar(255),
	"continent" varchar(50),
	"flag_icon" varchar(20),
	"flag_unicode" varchar(100),
	"confed" varchar(20),
	"group" "grupo" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "teams_api_id_unique" UNIQUE("api_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "bet" ADD CONSTRAINT "bet_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bet" ADD CONSTRAINT "bet_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bonus_participacao" ADD CONSTRAINT "bonus_participacao_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ranking" ADD CONSTRAINT "ranking_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_apostas_usuario" ON "bet" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_apostas_jogo" ON "bet" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "idx_apostas_acertou" ON "bet" USING btree ("acertou") WHERE acertou = true;