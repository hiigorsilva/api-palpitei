import type { FastifyInstance } from 'fastify'
import { adminRoute } from '../modules/admin/routes/admin.route'
import { betRoute } from '../modules/bet/routes/bet.route'
import { bonusProgressRoute } from '../modules/bonus-progresso/routes/bonus-progresso.route'
import { gameRoute } from '../modules/games/routes/game.route'
import { healthRoute } from '../modules/healths/routes/health.route'
import { integrationRoute } from '../modules/integration/routes/integration.route'
import { rankingRoute } from '../modules/ranking/routes/ranking.route'
import { userRoute } from '../modules/users/routes/user.route'

export const registerRoutes = (app: FastifyInstance) => {
  app.register(healthRoute, { prefix: '/api' })
  app.register(userRoute, { prefix: '/api' })

  app.register(gameRoute, { prefix: '/api' })
  app.register(betRoute, { prefix: '/api' })
  app.register(rankingRoute, { prefix: '/api' })
  app.register(bonusProgressRoute, { prefix: '/api' })
  app.register(integrationRoute, { prefix: '/api' })

  app.register(adminRoute, { prefix: '/api' })
}
