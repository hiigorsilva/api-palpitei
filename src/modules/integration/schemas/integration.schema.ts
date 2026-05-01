import type { RouteShorthandOptions } from 'fastify'
import { z } from 'zod'

const syncResponseSchema = z.object({
  message: z.string(),
  times_sincronizados: z.number(),
  jogos_sincronizados: z.number(),
})

const updateResponseSchema = z.object({
  message: z.string(),
  jogos_atualizados: z.number(),
})

const errorResponseSchema = z.object({
  message: z.string(),
})

export const syncTeamsSchema: RouteShorthandOptions = {
  schema: {
    summary: 'Sincronizar times da API',
    tags: ['Integração'],
    response: {
      200: syncResponseSchema,
      401: errorResponseSchema,
      500: errorResponseSchema,
    },
  },
}

export const syncGamesSchema: RouteShorthandOptions = {
  schema: {
    summary: 'Sincronizar jogos da API',
    tags: ['Integração'],
    response: {
      200: syncResponseSchema,
      401: errorResponseSchema,
      500: errorResponseSchema,
    },
  },
}

export const syncAllSchema: RouteShorthandOptions = {
  schema: {
    summary: 'Sincronizar tudo (times + jogos)',
    tags: ['Integração'],
    response: {
      200: syncResponseSchema,
      401: errorResponseSchema,
      500: errorResponseSchema,
    },
  },
}

export const updateResultsSchema: RouteShorthandOptions = {
  schema: {
    summary: 'Atualizar resultados dos jogos recentes',
    description: 'Busca jogos das últimas 24h e atualiza resultados',
    tags: ['Integração'],
    response: {
      200: updateResponseSchema,
      401: errorResponseSchema,
      500: errorResponseSchema,
    },
  },
}
