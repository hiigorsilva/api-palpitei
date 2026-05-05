import fastifySwagger from '@fastify/swagger'
import scalarFastifyApiReference from '@scalar/fastify-api-reference'
import type { FastifyInstance } from 'fastify'
import { jsonSchemaTransform } from 'fastify-type-provider-zod'
import { env } from '../../shared/utils/env'

export const registerSwagger = (app: FastifyInstance) => {
  const apiUrl = env.API_URL.replace(/\/+$/, '')

  app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Palpitei API',
        description: 'API do sistema de bolão para Copa do Mundo',
        version: '1.0.0',
      },
      servers: [
        {
          url: apiUrl,
        },
      ],
      components: {
        securitySchemes: {
          basicAuth: {
            type: 'http',
            scheme: 'basic',
            description:
              'Autenticação Basic Auth - Use usuário: admin / senha: palpitei2026',
          },
        },
      },
    },
    transform: jsonSchemaTransform,
  })

  app.register(scalarFastifyApiReference, {
    routePrefix: '/docs',
    configuration: {
      theme: 'bluePlanet',
    },
  })
}
