import type { RouteShorthandOptions } from 'fastify'
import { z } from 'zod'

const teamDetailsResponseSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    flag: z.string().nullable(),
    continent: z.string().nullable(),
    flag_icon: z.string().nullable(),
    flag_unicode: z.string().nullable(),
    fifa_code: z.string().nullable(),
    group: z.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']),
    confed: z.string().nullable(),
    isPalpiteCampeao: z.boolean(),
  })
  .nullable()

const gameBetResponseSchema = z.object({
  userId: z.string(),
  name: z.string(),
  palpite: z.enum(['A', 'B', 'EMPATE']),
  usou_carta_dobro_pontos: z.boolean(),
  acertou: z.boolean(),
  pontos: z.number(),
})

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
  usou_carta_dobro_pontos: z.boolean(),
  created_at: z.union([z.string().datetime(), z.date()]),
  updated_at: z.union([z.string().datetime(), z.date()]),
})

const errorResponseSchema = z.object({
  message: z.string(),
})

const paramsSchema = z.object({
  id: z.string(),
})

const betsParamsSchema = z.object({
  gameId: z.string(),
})

const requiredUserQuerySchema = z.object({
  userId: z
    .string({ error: 'ID do usuário é obrigatório' })
    .uuid('ID do usuário inválido.'),
})

const optionalUserQuerySchema = z.object({
  userId: z.string().uuid('ID do usuário inválido.').optional(),
})

const listQuerySchema = z.object({
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
  userId: z
    .string({ error: 'ID do usuário é obrigatório' })
    .uuid('ID do usuário inválido.'),
})

export const listGamesSchema: RouteShorthandOptions = {
  schema: {
    summary: 'Lista todos os jogos',
    description:
      'Lista jogos com opção de filtrar por fase ou status. O parâmetro userId é obrigatório para calcular has_palpite por usuário.',
    tags: ['Jogos'],
    querystring: listQuerySchema,
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
    querystring: requiredUserQuerySchema,
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
    querystring: optionalUserQuerySchema,
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
    querystring: requiredUserQuerySchema,
    response: {
      200: z.array(gameResponseSchema),
      500: errorResponseSchema,
    },
  },
}

export const listBetsByGameSchema: RouteShorthandOptions = {
  schema: {
    summary: 'Lista palpites por jogo',
    description: 'Retorna todos os palpites feitos para um jogo específico.',
    tags: ['Jogos'],
    params: betsParamsSchema,
    response: {
      200: z.array(gameBetResponseSchema),
      404: errorResponseSchema,
      500: errorResponseSchema,
    },
  },
}
