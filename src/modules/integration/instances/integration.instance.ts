import { env } from '../../../shared/utils/env'
import { IntegrationController } from '../controllers/integration.controller'
import { startScheduler } from '../schedules/integration.schedule'
import { IntegrationService } from '../services/integration.service'

const integrationRepository = new IntegrationRepository()

const integrationService = new IntegrationService(integrationRepository, {
  apiKey: env.API_FOOTBALL_KEY,
  baseUrl: 'https://v3.football.api-sports.io',
  leagueId: 1, // FIFA World Cup
  season: 2026,
})

export const integrationController = new IntegrationController(
  integrationService
)

// Iniciar scheduler a cada 30 minutos (apenas resultados)
startScheduler(integrationService, 30)

export { integrationService }
