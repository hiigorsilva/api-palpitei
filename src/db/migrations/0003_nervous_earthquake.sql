ALTER TABLE "games" ALTER COLUMN "fase" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."fase";--> statement-breakpoint
CREATE TYPE "public"."fase" AS ENUM('GRUPOS', '16_AVOS', 'OITAVAS', 'QUARTAS', 'SEMI', 'TERCEIRO', 'FINAL');--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "fase" SET DATA TYPE "public"."fase" USING "fase"::"public"."fase";--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "continent" varchar(50);--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "flag_icon" varchar(20);--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "flag_unicode" varchar(100);--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "confed" varchar(20);