import type { RouteShorthandOptions } from 'fastify'
import { z } from 'zod'

const nivelBonusSchema = z.object({
  nivel: z.string(),
  minimoPercentual: z.number(),
  bonusPontos: z.number(),
})

const bonusProgressoSchema = z.object({
  userId: z.string(),
  name: z.string(),
  jogos_apostados: z.number(),
  total_jogos: z.number(),
  percentual: z.number(),
  nivel_atual: z.string(),
  bonus_concedido: z.number(),
  proximo_nivel: nivelBonusSchema.nullable(),
})

const errorResponseSchema = z.object({
  message: z.string(),
})

const paramsSchema = z.object({
  userId: z.string(),
})

export const getBonusProgressoSchema: RouteShorthandOptions = {
  schema: {
    summary: 'Progresso do bônus de participação',
    description:
      'Retorna o nível atual, percentual de apostas e bônus concedido',
    tags: ['Bônus'],
    params: paramsSchema,
    response: {
      200: bonusProgressoSchema,
      404: errorResponseSchema,
      500: errorResponseSchema,
    },
  },
}

export const updateBonusProgressoSchema: RouteShorthandOptions = {
  schema: {
    summary: 'Força atualização do progresso de bônus',
    description: 'Recalcula o bônus de participação do usuário',
    tags: ['Bônus'],
    params: paramsSchema,
    response: {
      200: bonusProgressoSchema,
      404: errorResponseSchema,
      500: errorResponseSchema,
    },
  },
}

export const listNiveisBonusSchema: RouteShorthandOptions = {
  schema: {
    summary: 'Lista todos os níveis de bônus',
    description:
      'Retorna os níveis disponíveis (Bronze, Prata, Ouro, Platina, Diamante)',
    tags: ['Bônus'],
    response: {
      200: z.array(nivelBonusSchema),
      500: errorResponseSchema,
    },
  },
}
