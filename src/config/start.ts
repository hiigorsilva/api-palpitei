import type { FastifyInstance } from 'fastify'
import { env } from '../shared/utils/env'

export const registerServerStart = async (app: FastifyInstance) => {
  try {
    const apiUrl = env.API_URL.replace(/\/+$/, '')
    await app.listen({ port: env.PORT, host: env.HOST })
    console.info(`✅ Server is running on port ${env.PORT}`)
    console.info(`✅ Server listening at ${apiUrl}`)
    console.info(`✅ API Reference available at ${apiUrl}/api/docs`)
  } catch (_error) {
    // app.log.error("SERVER_START_ERROR", error);
    process.exit(1)
  }
}
