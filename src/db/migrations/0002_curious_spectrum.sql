CREATE TYPE "public"."grupo" AS ENUM('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L');--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "group" "grupo" NOT NULL;