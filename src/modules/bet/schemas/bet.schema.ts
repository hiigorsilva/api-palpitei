import type { RouteShorthandOptions } from 'fastify'
import { z } from 'zod'

const betResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  gameId: z.string(),
  palpite: z.enum(['A', 'B', 'EMPATE']),
  acertou: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

const betFullResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  gameId: z.string(),
  palpite: z.enum(['A', 'B', 'EMPATE']),
  acertou: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  username: z.string(),
  team_a: z.string(),
  team_b: z.string(),
  data_hora: z.string().datetime(),
  gols_a: z.number().nullable(),
  gols_b: z.number().nullable(),
  finish_game: z.boolean(),
})

const errorResponseSchema = z.object({
  message: z.string(),
})

const createBetBodyBodySchema = z.object({
  palpite: z.enum(['A', 'B', 'EMPATE'], {
    error: 'Palpite inválido. Informe os valores corretos: A, B ou EMPATE',
  }),
})

const editBetBodySchema = z.object({
  gameId: z.string(),
  palpite: z.enum(['A', 'B', 'EMPATE'], {
    error: 'Palpite inválido. Informe os valores corretos: A, B ou EMPATE',
  }),
})

const createBetParamsSchema = z.object({
  userId: z.string(),
  gameId: z.string(),
})

const editBetParamsSchema = z.object({
  id: z.string(),
  userId: z.string(),
})

const listBetParamsSchema = z.object({
  userId: z.string(),
})

export const createBetSchema: RouteShorthandOptions = {
  schema: {
    summary: 'Cria nova aposta',
    description:
      'Usuário aposta em um jogo. Válido apenas se jogo ainda não começou.',
    tags: ['Apostas'],
    params: createBetParamsSchema,
    body: createBetBodyBodySchema,
    response: {
      201: betResponseSchema,
      400: errorResponseSchema,
      403: errorResponseSchema,
      404: errorResponseSchema,
      500: errorResponseSchema,
    },
  },
}

export const editBetSchema: RouteShorthandOptions = {
  schema: {
    summary: 'Edita aposta existente',
    description:
      'Altera o palpite de uma aposta. Só permite se jogo ainda não começou.',
    tags: ['Apostas'],
    params: editBetParamsSchema,
    body: editBetBodySchema,
    response: {
      200: betResponseSchema,
      400: errorResponseSchema,
      403: errorResponseSchema,
      404: errorResponseSchema,
      500: errorResponseSchema,
    },
  },
}

export const listBetsByUserSchema: RouteShorthandOptions = {
  schema: {
    summary: 'Lista apostas de um usuário',
    tags: ['Apostas'],
    params: listBetParamsSchema,
    response: {
      200: z.array(betFullResponseSchema),
      404: errorResponseSchema,
      500: errorResponseSchema,
    },
  },
}
