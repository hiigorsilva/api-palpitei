import { env } from '../../../shared/utils/env'
import { IntegrationController } from '../controllers/integration.controller'
import { IntegrationRepository } from '../repositories/integration.repositoy'
import { startScheduler } from '../schedules/integration.schedule'
import { IntegrationService } from '../services/integration.service'

const integrationRepository = new IntegrationRepository()

const integrationService = new IntegrationService(integrationRepository, {
  apiKey: env.API_FOOTBALL_KEY,
  baseUrl: env.API_FOOTBALL_BASE_URL,
  leagueId: env.API_FOOTBALL_LEAGUE_ID,
  season: env.API_FOOTBALL_SEASON,
})

export const integrationController = new IntegrationController(
  integrationService
)

// Inicia scheduler apenas quando a chave da API estiver configurada.
if (env.API_FOOTBALL_KEY) {
  startScheduler(integrationService, 30)
}

export { integrationService }
