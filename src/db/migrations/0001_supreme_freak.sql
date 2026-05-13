CREATE TABLE "champion_bets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"acertou" boolean DEFAULT false NOT NULL,
	"pontos" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "champion_bets_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "ranking" ADD COLUMN "pontos_campeao" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "champion_bets" ADD CONSTRAINT "champion_bets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "champion_bets" ADD CONSTRAINT "champion_bets_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_champion_bets_usuario" ON "champion_bets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_champion_bets_time" ON "champion_bets" USING btree ("team_id");