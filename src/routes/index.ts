import type { FastifyInstance } from 'fastify'
import { gameRoute } from '../modules/games/routes/game.route'
import { healthRoute } from '../modules/healths/routes/health.route'
import { userRoute } from '../modules/users/routes/user.route'

export const registerRoutes = (app: FastifyInstance) => {
  app.register(healthRoute, { prefix: '/api' })
  app.register(userRoute, { prefix: '/api' })

  app.register(gameRoute, { prefix: '/api' })
}
