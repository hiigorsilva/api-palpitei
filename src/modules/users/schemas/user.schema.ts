import type { RouteShorthandOptions } from 'fastify'
import { z } from 'zod'

const userResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  carta_dobro_pontos: z.number(),
  created_at: z.date().transform(date => date.toISOString()),
})

const nextUserLevelResponseSchema = z.object({
  nivel: z.string(),
  bonusPontos: z.number(),
  minimoPercentual: z.number(),
})

const userWithProgressResponseSchema = userResponseSchema.extend({
  bonus_concedido: z.number(),
  jogos_apostados: z.number(),
  nivel_atual: z.string(),
  percentual: z.number(),
  proximo_nivel: nextUserLevelResponseSchema.nullable(),
  total_jogos: z.number(),
})

const championBetResponseSchema = z.object({
  id: z.number(),
  userId: z.string(),
  teamId: z.string(),
  teamName: z.string(),
  acertou: z.boolean(),
  pontos: z.number(),
  created_at: z.date().transform(date => date.toISOString()),
  updated_at: z.date().transform(date => date.toISOString()),
})

const cartaHistoricoResponseSchema = z.object({
  gameId: z.string(),
  team_a: z.string(),
  team_b: z.string(),
  data_hora: z.string().datetime(),
  palpite: z.enum(['A', 'B', 'EMPATE']),
  usou_carta_dobro_pontos: z.boolean(),
  acertou: z.boolean(),
  pontos: z.number(),
})

const errorResponseSchema = z.object({
  message: z.string(),
})

const createUserBodySchema = z.object({
  name: z
    .string({ error: 'Nome é obrigatório' })
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres')
    .trim(),
})

const chooseChampionBodySchema = z.object({
  teamId: z.string().uuid('ID da seleção inválido'),
})

export const createUserSchema: RouteShorthandOptions = {
  schema: {
    summary: 'Cria novo usuário',
    tags: ['Usuários'],
    body: createUserBodySchema,
    response: {
      201: userResponseSchema,
      400: errorResponseSchema,
      500: errorResponseSchema,
    },
  },
}

export const loginUserSchema: RouteShorthandOptions = {
  schema: {
    summary: 'Entra no bolão pelo nome',
    description:
      'Busca um usuário pelo nome informado. Se não existir, cria automaticamente.',
    tags: ['Autenticação'],
    body: createUserBodySchema,
    response: {
      200: userResponseSchema,
      400: errorResponseSchema,
      500: errorResponseSchema,
    },
  },
}

export const listUsersSchema: RouteShorthandOptions = {
  schema: {
    summary: 'Lista todos os usuários',
    tags: ['Usuários'],
    response: {
      200: z.array(userWithProgressResponseSchema),
      400: errorResponseSchema,
      500: errorResponseSchema,
    },
  },
}

export const getUserByIdSchema: RouteShorthandOptions = {
  schema: {
    summary: 'Busca usuário por ID',
    tags: ['Usuários'],
    params: z.object({
      id: z.string(),
    }),
    response: {
      200: userWithProgressResponseSchema,
      404: errorResponseSchema,
      400: errorResponseSchema,
      500: errorResponseSchema,
    },
  },
}

export const chooseChampionBetSchema: RouteShorthandOptions = {
  schema: {
    summary: 'Escolhe palpite de campeão',
    description:
      'Cria ou altera o palpite antecipado de campeão do usuário até 14/07/2026 às 15h em São Paulo.',
    tags: ['Usuários'],
    params: z.object({
      userId: z.string().uuid('ID do usuário inválido'),
    }),
    body: chooseChampionBodySchema,
    response: {
      200: championBetResponseSchema,
      400: errorResponseSchema,
      404: errorResponseSchema,
      500: errorResponseSchema,
    },
  },
}

export const getCartaHistoricoSchema: RouteShorthandOptions = {
  schema: {
    summary: 'Histórico de uso da carta dobro pontos',
    description:
      'Retorna apenas as apostas em que o usuário utilizou a carta dobro pontos.',
    tags: ['Usuários'],
    params: z.object({
      userId: z.string().uuid('ID do usuário inválido'),
    }),
    response: {
      200: z.array(cartaHistoricoResponseSchema),
      404: errorResponseSchema,
      500: errorResponseSchema,
    },
  },
}
