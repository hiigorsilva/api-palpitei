import type { RouteShorthandOptions } from 'fastify'
import { z } from 'zod'

const teamResponseSchema = z.object({
  id: z.string(),
  apiId: z.number(),
  name: z.string(),
  code: z.string().nullable(),
  flag: z.string().nullable(),
  continent: z.string().nullable(),
  flag_icon: z.string().nullable(),
  flag_unicode: z.string().nullable(),
  fifa_code: z.string().nullable(),
  group: z.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']),
  confed: z.string().nullable(),
  isPalpiteCampeao: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
})

const errorResponseSchema = z.object({
  message: z.string(),
})

const querySchema = z.object({
  grupo: z
    .enum(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'], {
      error: 'Grupo inválido. Informe um grupo entre A e L.',
    })
    .optional(),
  userId: z.string().uuid('ID do usuário inválido.').optional(),
})

export const listTeamsSchema: RouteShorthandOptions = {
  schema: {
    summary: 'Lista seleções da competição',
    description: 'Lista todas as seleções, com opção de filtro por grupo.',
    tags: ['Seleções'],
    querystring: querySchema,
    response: {
      200: z.array(teamResponseSchema),
      400: errorResponseSchema,
      500: errorResponseSchema,
    },
  },
}
