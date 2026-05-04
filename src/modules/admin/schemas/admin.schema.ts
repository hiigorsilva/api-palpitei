import type { RouteShorthandOptions } from 'fastify'
import { z } from 'zod'

const security = [{ basicAuth: [] }]

const errorResponseSchema = z.object({ message: z.string() })
const messageResponseSchema = z.object({ message: z.string() })

const gameResponseSchema = z.object({
  id: z.string(),
  team_a: z.string(),
  team_b: z.string(),
  fase: z.string(),
  data_hora: z.coerce.date(),
  gols_a: z.number().nullable(),
  gols_b: z.number().nullable(),
  finish_game: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
})

export const popularBaseLocalSchema: RouteShorthandOptions = {
  schema: {
    summary: 'Popula banco com JSON local',
    description:
      'Admin: insere seleções e jogos a partir de data/worldcup-2026 sem duplicar registros existentes.',
    tags: ['Admin'],
    security,
    response: {
      200: z.object({
        teams_inseridos: z.number(),
        teams_ignorados: z.number(),
        jogos_inseridos: z.number(),
        jogos_ignorados: z.number(),
      }),
      400: errorResponseSchema,
      401: errorResponseSchema,
      500: errorResponseSchema,
    },
  },
}

// POST /admin/resultado
export const atualizarResultadoSchema: RouteShorthandOptions = {
  schema: {
    summary: 'Insere resultado de um jogo',
    description:
      'Admin: insere o resultado real de um jogo pendente e recalcula pontuações',
    tags: ['Admin'],
    security,
    body: z.object({
      gameId: z.string(),
      gols_a: z.number().min(0, 'Os gols não podem ser negativos'),
      gols_b: z.number().min(0, 'Os gols não podem ser negativos'),
    }),
    response: {
      200: messageResponseSchema,
      400: errorResponseSchema,
      401: errorResponseSchema,
      404: errorResponseSchema,
      500: errorResponseSchema,
    },
  },
}

// PUT /admin/resultado/:gameId
export const corrigirResultadoSchema: RouteShorthandOptions = {
  schema: {
    summary: 'Corrige resultado de um jogo já encerrado',
    description:
      'Admin: sobrescreve o placar de um jogo encerrado, reprocessa todas as apostas e recalcula pontuações',
    tags: ['Admin'],
    security,
    params: z.object({ gameId: z.string().uuid() }),
    body: z.object({
      gols_a: z.number().int().min(0),
      gols_b: z.number().int().min(0),
    }),
    response: {
      200: messageResponseSchema,
      400: errorResponseSchema,
      401: errorResponseSchema,
      404: errorResponseSchema,
      500: errorResponseSchema,
    },
  },
}

// POST /admin/resultados/lote
export const inserirLoteResultadosSchema: RouteShorthandOptions = {
  schema: {
    summary: 'Insere múltiplos resultados de uma vez',
    description:
      'Admin: processa uma lista de resultados em sequência. Retorna resumo com sucesso/erro por jogo.',
    tags: ['Admin'],
    security,
    body: z.object({
      resultados: z
        .array(
          z.object({
            gameId: z.string().uuid(),
            gols_a: z.number().int().min(0),
            gols_b: z.number().int().min(0),
          })
        )
        .min(1)
        .max(20),
    }),
    response: {
      200: z.object({
        sucesso: z.number(),
        erros: z.number(),
        detalhes: z.array(
          z.object({
            gameId: z.string(),
            status: z.enum(['ok', 'erro']),
            message: z.string(),
          })
        ),
      }),
      400: errorResponseSchema,
      401: errorResponseSchema,
      500: errorResponseSchema,
    },
  },
}

// GET /admin/jogos/pendentes
export const listarJogosPendentesSchema: RouteShorthandOptions = {
  schema: {
    summary: 'Lista jogos sem resultado',
    description:
      'Admin: retorna todos os jogos com finish_game=false, ordenados por data',
    tags: ['Admin'],
    security,
    response: {
      200: z.array(gameResponseSchema),
      401: errorResponseSchema,
      500: errorResponseSchema,
    },
  },
}

// GET /admin/jogos/hoje
export const listarJogosDeHojeSchema: RouteShorthandOptions = {
  schema: {
    summary: 'Lista jogos de hoje (UTC)',
    description:
      'Admin: retorna jogos cuja data_hora está dentro do dia atual em UTC',
    tags: ['Admin'],
    security,
    response: {
      200: z.array(gameResponseSchema),
      401: errorResponseSchema,
      500: errorResponseSchema,
    },
  },
}

// GET /admin/jogos/fase
export const listarJogosPorFaseSchema: RouteShorthandOptions = {
  schema: {
    summary: 'Lista jogos filtrados por fase',
    description:
      'Admin: filtra jogos pelo enum de fase (GRUPOS, 32_AVOS, OITAVAS, QUARTAS, SEMI, TERCEIRO, FINAL)',
    tags: ['Admin'],
    security,
    querystring: z.object({
      fase: z.enum([
        'GRUPOS',
        '32_AVOS',
        'OITAVAS',
        'QUARTAS',
        'SEMI',
        'TERCEIRO',
        'FINAL',
      ]),
    }),
    response: {
      200: z.array(gameResponseSchema),
      400: errorResponseSchema,
      401: errorResponseSchema,
      500: errorResponseSchema,
    },
  },
}

// POST /admin/recalcular
export const recalcularPontuacaoSchema: RouteShorthandOptions = {
  schema: {
    summary: 'Recalcula toda pontuação do sistema',
    description:
      'Admin: Força recálculo de todas as pontuações (útil para corrigir inconsistências)',
    tags: ['Admin'],
    security,
    response: {
      200: z.object({
        message: z.string(),
        usuarios_atualizados: z.number(),
        apostas_processadas: z.number(),
      }),
      401: errorResponseSchema,
      500: errorResponseSchema,
    },
  },
}

// GET /admin/dashboard
export const getDashboardSchema: RouteShorthandOptions = {
  schema: {
    summary: 'Dashboard administrativo',
    description: 'Admin: estatísticas gerais do sistema',
    tags: ['Admin'],
    security,
    response: {
      200: z.object({
        total_usuarios: z.number(),
        total_apostas: z.number(),
        total_jogos: z.number(),
        jogos_encerrados: z.number(),
        jogos_pendentes: z.number(),
        usuarios_com_apostas: z.number(),
        media_apostas_por_usuario: z.number(),
      }),
      401: errorResponseSchema,
      500: errorResponseSchema,
    },
  },
}
