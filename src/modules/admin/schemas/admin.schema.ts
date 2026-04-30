import type { RouteShorthandOptions } from 'fastify'
import { z } from 'zod'

const resultadoBodySchema = z.object({
  gameId: z.string(),
  gols_a: z.number().min(0),
  gols_b: z.number().min(0),
})

const recalcularResponseSchema = z.object({
  message: z.string(),
  usuarios_atualizados: z.number(),
  apostas_processadas: z.number(),
})

const dashboardResponseSchema = z.object({
  total_usuarios: z.number(),
  total_apostas: z.number(),
  total_jogos: z.number(),
  jogos_encerrados: z.number(),
  jogos_pendentes: z.number(),
  usuarios_com_apostas: z.number(),
  media_apostas_por_usuario: z.number(),
})

const messageResponseSchema = z.object({
  message: z.string(),
})

const errorResponseSchema = z.object({
  message: z.string(),
})

const security = [{ basicAuth: [] }]

export const atualizarResultadoSchema: RouteShorthandOptions = {
  schema: {
    summary: 'Atualiza resultado de um jogo',
    description:
      'Admin: Insere o resultado real de um jogo e recalcula pontuações',
    tags: ['Admin'],
    security,
    body: resultadoBodySchema,
    response: {
      200: messageResponseSchema,
      400: errorResponseSchema,
      401: errorResponseSchema,
      404: errorResponseSchema,
      500: errorResponseSchema,
    },
  },
}

export const recalcularPontuacaoSchema: RouteShorthandOptions = {
  schema: {
    summary: 'Recalcula toda pontuação do sistema',
    description:
      'Admin: Força recálculo de todas as pontuações (útil para corrigir inconsistências)',
    tags: ['Admin'],
    security,
    response: {
      200: recalcularResponseSchema,
      401: errorResponseSchema,
      500: errorResponseSchema,
    },
  },
}

export const getDashboardSchema: RouteShorthandOptions = {
  schema: {
    summary: 'Dashboard administrativo',
    description: 'Admin: Estatísticas gerais do sistema',
    tags: ['Admin'],
    security,
    response: {
      200: dashboardResponseSchema,
      401: errorResponseSchema,
      500: errorResponseSchema,
    },
  },
}
