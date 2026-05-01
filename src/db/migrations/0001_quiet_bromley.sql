CREATE TABLE "teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"api_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"code" varchar(10),
	"logo" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "teams_api_id_unique" UNIQUE("api_id")
);
--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "api_id" integer;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_api_id_unique" UNIQUE("api_id");