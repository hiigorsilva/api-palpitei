import {
  type IApiFixture,
  IGameDTO,
  type IIntegrationConfig,
} from './interface'
import type { IntegrationRepository } from './repository'

export class IntegrationService {
  private apiUrl: string
  private apiKey: string
  private leagueId: number
  private season: number

  constructor(
    private integrationRepository: IntegrationRepository,
    config: IIntegrationConfig
  ) {
    this.apiUrl = config.baseUrl
    this.apiKey = config.apiKey
    this.leagueId = config.leagueId
    this.season = config.season
  }

  private async fetchFromAPI(
    endpoint: string,
    params: Record<string, string> = {}
  ): Promise<any> {
    const url = new URL(`${this.apiUrl}${endpoint}`)
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })

    const response = await fetch(url.toString(), {
      headers: {
        'x-apisports-key': this.apiKey,
      },
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    if (data.errors && Object.keys(data.errors).length > 0) {
      throw new Error(`API Error: ${JSON.stringify(data.errors)}`)
    }

    return data
  }

  private determinarFase(round: string): string {
    const roundLower = round.toLowerCase()
    if (roundLower.includes('group')) return 'grupos'
    if (roundLower.includes('round of 16')) return 'oitavas'
    if (roundLower.includes('quarter')) return 'quartas'
    if (roundLower.includes('semi')) return 'semi'
    if (roundLower.includes('final')) return 'final'
    return 'grupos'
  }

  private isJogoEncerrado(status: string): boolean {
    const finishedStatus = ['FT', 'AET', 'PEN']
    return finishedStatus.includes(status)
  }

  async sincronizarTimes(): Promise<number> {
    const response = await this.fetchFromAPI('/teams', {
      league: this.leagueId.toString(),
      season: this.season.toString(),
    })

    let count = 0
    for (const item of response.response) {
      const apiTeam = item.team
      const existente = await this.integrationRepository.buscarTimePorApiId(
        apiTeam.id
      )

      if (!existente) {
        await this.integrationRepository.criarTime({
          apiId: apiTeam.id,
          nome: apiTeam.name,
          sigla: apiTeam.code || apiTeam.name.substring(0, 3).toUpperCase(),
          logo: apiTeam.logo,
        })
        count++
      }
    }

    return count
  }

  async sincronizarJogos(): Promise<number> {
    const response = await this.fetchFromAPI('/fixtures', {
      league: this.leagueId.toString(),
      season: this.season.toString(),
    })

    let count = 0
    for (const item of response.response as IApiFixture[]) {
      const fixture = item.fixture
      const teams = item.teams
      const goals = item.goals
      const round = item.league.round

      const existente = await this.integrationRepository.buscarJogoPorApiId(
        fixture.id
      )

      if (!existente) {
        await this.integrationRepository.criarJogo({
          apiId: fixture.id,
          selecao_a_id: teams.home.id,
          selecao_b_id: teams.away.id,
          fase: this.determinarFase(round),
          data_hora: new Date(fixture.date),
          gols_a: goals.home,
          gols_b: goals.away,
          encerrado: this.isJogoEncerrado(fixture.status.short),
          api_status: fixture.status.short,
        })
        count++
      }
    }

    return count
  }

  async buscarResultadosAtualizados(): Promise<number> {
    // Buscar jogos das últimas 24 horas (para não perder nenhum)
    const hoje = new Date()
    const ontem = new Date()
    ontem.setDate(ontem.getDate() - 1)

    const dateFrom = ontem.toISOString().split('T')[0]
    const dateTo = hoje.toISOString().split('T')[0]

    const response = await this.fetchFromAPI('/fixtures', {
      league: this.leagueId.toString(),
      season: this.season.toString(),
      from: dateFrom,
      to: dateTo,
    })

    let count = 0
    for (const item of response.response as IApiFixture[]) {
      const fixture = item.fixture
      const goals = item.goals

      // Só processar jogos que terminaram
      if (this.isJogoEncerrado(fixture.status.short)) {
        const existente = await this.integrationRepository.buscarJogoPorApiId(
          fixture.id
        )

        if (existente) {
          await this.integrationRepository.atualizarJogo(fixture.id, {
            gols_a: goals.home,
            gols_b: goals.away,
            encerrado: true,
          })
          count++
        }
      }
    }

    return count
  }

  async sincronizarCompleto(): Promise<{ times: number; jogos: number }> {
    const times = await this.sincronizarTimes()
    const jogos = await this.sincronizarJogos()
    return { times, jogos }
  }
}
