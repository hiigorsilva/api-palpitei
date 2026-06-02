import fastifySwagger from '@fastify/swagger'
import scalarFastifyApiReference from '@scalar/fastify-api-reference'
import type { FastifyInstance } from 'fastify'
import { jsonSchemaTransform } from 'fastify-type-provider-zod'
import { env } from '../../shared/utils/env'

export const registerSwagger = (app: FastifyInstance) => {
  const apiUrl = env.API_URL.replace(/\/+$/, '')
  const localUrl = `http://localhost:${env.PORT}`
  const servers = [
    {
      url: localUrl,
      description: 'Desenvolvimento local',
    },
    ...(apiUrl === localUrl
      ? []
      : [
          {
            url: apiUrl,
            description: 'Ambiente configurado',
          },
        ]),
  ]

  app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Palpitei API',
        description: 'API do sistema de bolão para Copa do Mundo',
        version: '1.0.0',
      },
      servers,
      components: {
        securitySchemes: {
          basicAuth: {
            type: 'http',
            scheme: 'basic',
            description: 'Autenticação Basic Auth para rotas administrativas.',
          },
        },
      },
    },
    transform: input => {
      const transformed = jsonSchemaTransform(input)

      if (/\/admin(?:\/|$)/.test(input.url)) {
        return {
          ...transformed,
          schema: {
            ...(transformed.schema as Record<string, unknown>),
            security: [{ basicAuth: [] }],
          },
        }
      }

      return transformed
    },
  })

  app.register(scalarFastifyApiReference, {
    routePrefix: '/api/docs',
    configuration: {
      theme: 'bluePlanet',
    },
  })
}
