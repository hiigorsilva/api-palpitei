import z from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.string().startsWith('postgresql://'),
  API_FOOTBALL_KEY: z.string().default(''),
  API_FOOTBALL_BASE_URL: z
    .string()
    .url()
    .default('https://v3.football.api-sports.io'),
  API_FOOTBALL_LEAGUE_ID: z.coerce.number().default(1),
  API_FOOTBALL_SEASON: z.coerce.number().default(2026),
})

export const env = envSchema.parse(process.env)
