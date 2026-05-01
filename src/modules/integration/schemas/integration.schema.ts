import type { RouteShorthandOptions } from 'fastify'

const syncResponseSchema = {
  type: 'object',
  properties: {
    message: { type: 'string' },
    times_sincronizados: { type: 'number' },
    jogos_sincronizados: { type: 'number' },
  },
}

const updateResponseSchema = {
  type: 'object',
  properties: {
    message: { type: 'string' },
    jogos_atualizados: { type: 'number' },
  },
}

const errorResponseSchema = {
  type: 'object',
  properties: {
    message: { type: 'string' },
  },
}

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
