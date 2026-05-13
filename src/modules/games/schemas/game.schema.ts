import type { RouteShorthandOptions } from 'fastify'
import { z } from 'zod'

const teamDetailsResponseSchema = z
  .object({
    name: z.string(),
    flag: z.string().nullable(),
    continent: z.string().nullable(),
    flag_icon: z.string().nullable(),
    flag_unicode: z.string().nullable(),
    fifa_code: z.string().nullable(),
    group: z.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']),
    confed: z.string().nullable(),
  })
  .nullable()

const gameResponseSchema = z.object({
  id: z.string(),
  team_a: z.string(),
  team_b: z.string(),
  team_a_info: teamDetailsResponseSchema,
  team_b_info: teamDetailsResponseSchema,
  fase: z.string(),
  data_hora: z.union([z.string().datetime(), z.date()]),
  gols_a: z.number().nullable(),
  gols_b: z.number().nullable(),
  finish_game: z.boolean(),
  has_palpite: z.boolean(),
  created_at: z.union([z.string().datetime(), z.date()]),
  updated_at: z.union([z.string().datetime(), z.date()]),
})

const errorResponseSchema = z.object({
  message: z.string(),
})

const paramsSchema = z.object({
  id: z.string(),
})

const querySchema = z.object({
  fase: z
    .enum(
      ['GRUPOS', '16_AVOS', 'OITAVAS', 'QUARTAS', 'SEMI', 'FINAL', 'TERCEIRO'],
      {
        error:
          'Fase inválida. Informe a fase correta: GRUPOS, 16_AVOS, OITAVAS, QUARTAS, SEMI, FINAL ou TERCEIRO',
      }
    )
    .optional(),
  status: z
    .enum(['FUTURO', 'ENCERRADO'], {
      error:
        'Status inválido. Informe se é um jogo FUTURO ou se já está ENCERRADO',
    })
    .optional(),
})

export const listGamesSchema: RouteShorthandOptions = {
  schema: {
    summary: 'Lista todos os jogos',
    description: 'Lista jogos com opção de filtrar por fase ou status',
    tags: ['Jogos'],
    querystring: querySchema,
    response: {
      200: z.array(gameResponseSchema),
      400: errorResponseSchema,
      404: errorResponseSchema,
      500: errorResponseSchema,
    },
  },
}

export const getGameByIdSchema: RouteShorthandOptions = {
  schema: {
    summary: 'Busca jogo por ID',
    tags: ['Jogos'],
    params: paramsSchema,
    response: {
      200: gameResponseSchema,
      404: errorResponseSchema,
      400: errorResponseSchema,
      500: errorResponseSchema,
    },
  },
}

export const listPendingGamesSchema: RouteShorthandOptions = {
  schema: {
    summary: 'Lista jogos pendentes',
    description: 'Lista jogos sem resultado (finish_game=false)',
    tags: ['Jogos'],
    response: {
      200: z.array(gameResponseSchema),
      500: errorResponseSchema,
    },
  },
}

export const listTodayGamesSchema: RouteShorthandOptions = {
  schema: {
    summary: 'Lista jogos de hoje',
    description: 'Lista jogos do dia atual em UTC',
    tags: ['Jogos'],
    response: {
      200: z.array(gameResponseSchema),
      500: errorResponseSchema,
    },
  },
}
