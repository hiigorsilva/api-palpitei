import type { GameFase } from '../../games/interfaces/game.interface'
import type {
  IApiEnvelope,
  IApiFixture,
  IApiFixturesResponse,
  IApiTeamsResponse,
  IIntegrationConfig,
  IIntegrationGameDTO,
  IIntegrationTeamDTO,
} from '../interfaces/integration.interface'
import type { IntegrationRepository } from '../repositories/integration.repositoy'

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

  private async fetchFromAPI<TResponse>(
    endpoint: string,
    params: Record<string, string> = {}
  ): Promise<TResponse> {
    if (!this.apiKey) {
      throw new Error('API_FOOTBALL_KEY não configurada')
    }

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

    const data = (await response.json()) as IApiEnvelope<TResponse>
    if (data.errors && Object.keys(data.errors).length > 0) {
      throw new Error(`API Error: ${JSON.stringify(data.errors)}`)
    }

    return data.response
  }

  private determinarFase(round: string): GameFase {
    const roundLower = round.toLowerCase()
    if (roundLower.includes('group')) return 'GRUPOS'
    if (roundLower.includes('round of 32') || roundLower.includes('1/16')) {
      return '32_AVOS'
    }
    if (roundLower.includes('round of 16') || roundLower.includes('1/8')) {
      return 'OITAVAS'
    }
    if (roundLower.includes('quarter') || roundLower.includes('1/4')) {
      return 'QUARTAS'
    }
    if (roundLower.includes('semi')) return 'SEMI'
    if (roundLower.includes('third') || roundLower.includes('3rd')) {
      return 'TERCEIRO'
    }
    if (roundLower.includes('final')) return 'FINAL'
    return 'GRUPOS'
  }

  private isJogoEncerrado(status: string): boolean {
    const finishedStatus = ['FT', 'AET', 'PEN']
    return finishedStatus.includes(status)
  }

  async sincronizarTimes(): Promise<number> {
    const response = await this.fetchFromAPI<IApiTeamsResponse['response']>(
      '/teams',
      {
        league: this.leagueId.toString(),
        season: this.season.toString(),
      }
    )

    let count = 0
    for (const item of response) {
      const teamData: IIntegrationTeamDTO = {
        apiId: item.team.id,
        name: item.team.name,
        code: item.team.code,
        logo: item.team.logo,
      }

      const existente = await this.integrationRepository.buscarTimePorApiId(
        teamData.apiId
      )

      if (existente) {
        await this.integrationRepository.atualizarTime(teamData.apiId, teamData)
      } else {
        await this.integrationRepository.criarTime(teamData)
      }

      count++
    }

    return count
  }

  async sincronizarJogos(): Promise<number> {
    const response = await this.fetchFromAPI<IApiFixturesResponse['response']>(
      '/fixtures',
      {
        league: this.leagueId.toString(),
        season: this.season.toString(),
      }
    )

    let count = 0
    for (const item of response as IApiFixture[]) {
      const fixture = item.fixture
      const teams = item.teams
      const goals = item.goals
      const round = item.league.round

      const jogoData: IIntegrationGameDTO = {
        apiId: fixture.id,
        team_a: teams.home.name,
        team_b: teams.away.name,
        fase: this.determinarFase(round),
        data_hora: new Date(fixture.date),
        gols_a: goals.home,
        gols_b: goals.away,
        finish_game: this.isJogoEncerrado(fixture.status.short),
      }

      const existentePorApiId =
        await this.integrationRepository.buscarJogoPorApiId(jogoData.apiId)
      const existentePorConfronto =
        await this.integrationRepository.buscarJogoPorConfrontoEData(
          jogoData.team_a,
          jogoData.team_b,
          jogoData.data_hora
        )

      if (!existentePorApiId && !existentePorConfronto) {
        await this.integrationRepository.criarJogo(jogoData)
        count++
      } else if (!existentePorApiId && existentePorConfronto) {
        await this.integrationRepository.vincularApiIdJogo(
          existentePorConfronto.id,
          jogoData.apiId
        )
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

    const response = await this.fetchFromAPI<IApiFixturesResponse['response']>(
      '/fixtures',
      {
        league: this.leagueId.toString(),
        season: this.season.toString(),
        from: dateFrom,
        to: dateTo,
      }
    )

    let count = 0
    for (const item of response as IApiFixture[]) {
      const fixture = item.fixture
      const teams = item.teams
      const goals = item.goals

      // Só processar jogos que terminaram
      if (this.isJogoEncerrado(fixture.status.short)) {
        const dataHora = new Date(fixture.date)
        const existentePorApiId =
          await this.integrationRepository.buscarJogoPorApiId(fixture.id)
        const existentePorConfronto =
          await this.integrationRepository.buscarJogoPorConfrontoEData(
            teams.home.name,
            teams.away.name,
            dataHora
          )
        const existente = existentePorApiId ?? existentePorConfronto

        if (
          existentePorConfronto &&
          !existentePorApiId &&
          !existentePorConfronto.apiId
        ) {
          await this.integrationRepository.vincularApiIdJogo(
            existentePorConfronto.id,
            fixture.id
          )
        }

        if (
          existente &&
          (!existente.finish_game ||
            existente.gols_a !== goals.home ||
            existente.gols_b !== goals.away)
        ) {
          await this.integrationRepository.atualizarJogo(existente.id, {
            gols_a: goals.home,
            gols_b: goals.away,
            finish_game: true,
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
