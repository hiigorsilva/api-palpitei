import type { RouteShorthandOptions } from 'fastify'
import { z } from 'zod'

const userResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  created_at: z.date().transform(date => date.toISOString()),
})

const errorResponseSchema = z.object({
  message: z.string(),
})

const createUserBodySchema = z.object({
  name: z.string().min(3).max(50),
})

export const createUserSchema: RouteShorthandOptions = {
  schema: {
    summary: 'Criar novo usuário',
    tags: ['Usuários'],
    body: createUserBodySchema,
    response: {
      201: userResponseSchema,
      400: errorResponseSchema,
      500: errorResponseSchema,
    },
  },
}

export const listUsersSchema: RouteShorthandOptions = {
  schema: {
    summary: 'Listar todos os usuários',
    tags: ['Usuários'],
    response: {
      200: z.array(userResponseSchema),
      400: errorResponseSchema,
      500: errorResponseSchema,
    },
  },
}

export const getUserByIdSchema: RouteShorthandOptions = {
  schema: {
    summary: 'Buscar usuário por ID',
    tags: ['Usuários'],
    params: z.object({
      id: z.string(),
    }),
    response: {
      200: userResponseSchema,
      404: errorResponseSchema,
      400: errorResponseSchema,
      500: errorResponseSchema,
    },
  },
}
