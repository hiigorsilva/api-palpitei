ALTER TABLE "bet" ADD COLUMN "pontos" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
UPDATE "bet"
SET "pontos" = CASE
  WHEN "acertou" = true THEN
    CASE
      WHEN "palpite" = 'EMPATE' THEN
        CASE WHEN "usou_carta_dobro_pontos" = true THEN 10 ELSE 5 END
      ELSE
        CASE WHEN "usou_carta_dobro_pontos" = true THEN 14 ELSE 7 END
    END
  ELSE 0
END;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_carta_dobro_pontos_non_negative" CHECK ("users"."carta_dobro_pontos" >= 0);
