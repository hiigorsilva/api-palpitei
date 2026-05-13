import type { RouteShorthandOptions } from 'fastify'
import { z } from 'zod'

const rankingItemSchema = z.object({
  position: z.number(),
  userId: z.string(),
  name: z.string(),
  pontos_total: z.number(),
  pontos_apostas: z.number(),
  pontos_bonus: z.number(),
  pontos_campeao: z.number(),
  acertos: z.number(),
  total_apostas: z.number(),
  taxa_acerto: z.number(),
})

const errorResponseSchema = z.object({
  message: z.string(),
})

const paramsSchema = z.object({
  userId: z.string(),
})

const querySchema = z.object({
  min_apostas: z.string().optional(),
})

const posicaoResponseSchema = z.object({
  position: z.number(),
  total_usuarios: z.number(),
})

export const getRankingPontosSchema: RouteShorthandOptions = {
  schema: {
    summary: 'Ranking por pontos totais',
    description:
      'Lista usuários ordenados por pontuação total (apostas + bônus)',
    tags: ['Ranking'],
    response: {
      200: z.array(rankingItemSchema),
      500: errorResponseSchema,
    },
  },
}

export const getRankingTaxaSchema: RouteShorthandOptions = {
  schema: {
    summary: 'Ranking por taxa de acerto',
    description:
      'Lista usuários ordenados por percentual de acerto. Pode filtrar por número mínimo de apostas.',
    tags: ['Ranking'],
    querystring: querySchema,
    response: {
      200: z.array(rankingItemSchema),
      500: errorResponseSchema,
    },
  },
}

export const getPosicaoUsuarioSchema: RouteShorthandOptions = {
  schema: {
    summary: 'Posição do usuário no ranking',
    description: 'Retorna a posição do usuário e total de participantes',
    tags: ['Ranking'],
    params: paramsSchema,
    response: {
      200: posicaoResponseSchema,
      404: errorResponseSchema,
      500: errorResponseSchema,
    },
  },
}

export const getEstatisticasUsuarioSchema: RouteShorthandOptions = {
  schema: {
    summary: 'Estatísticas completas do usuário',
    description: 'Retorna todas as estatísticas de um usuário específico',
    tags: ['Ranking'],
    params: paramsSchema,
    response: {
      200: rankingItemSchema,
      404: errorResponseSchema,
      500: errorResponseSchema,
    },
  },
}
