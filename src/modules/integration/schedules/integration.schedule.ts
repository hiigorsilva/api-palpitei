import type { IntegrationService } from '../services/integration.service'

let intervalId: NodeJS.Timeout | null = null

export function startScheduler(
  integrationService: IntegrationService,
  intervalMinutes: number = 30
) {
  if (intervalId) {
    clearInterval(intervalId)
  }

  // Executar imediatamente ao iniciar (opcional)
  // integrationService.buscarResultadosAtualizados().catch(console.error);

  // Agendar execução periódica
  intervalId = setInterval(
    async () => {
      console.log(`[Scheduler] Buscando resultados atualizados...`)
      try {
        const count = await integrationService.buscarResultadosAtualizados()
        if (count > 0) {
          console.log(`[Scheduler] ${count} jogos atualizados`)
        }
      } catch (error) {
        console.error('[Scheduler] Erro:', error)
      }
    },
    intervalMinutes * 60 * 1000
  )
}

export function stopScheduler() {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}
