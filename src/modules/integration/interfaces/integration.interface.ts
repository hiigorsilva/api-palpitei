import type { GameFase } from '../../games/interfaces/game.interface'

export interface IIntegrationConfig {
  baseUrl: string
  apiKey: string
  leagueId: number
  season: number
}

export interface IApiTeamsResponse {
  response: Array<{
    team: {
      id: number
      name: string
      code: string | null
      logo: string
    }
  }>
}

export interface IApiFixture {
  fixture: {
    id: number
    date: string
    status: {
      short: string
    }
  }
  league: {
    round: string
  }
  teams: {
    home: {
      id: number
      name: string
    }
    away: {
      id: number
      name: string
    }
  }
  goals: {
    home: number | null
    away: number | null
  }
}

export interface IApiFixturesResponse {
  response: IApiFixture[]
}

export interface IApiEnvelope<TResponse> {
  errors?: Record<string, unknown>
  response: TResponse
}

export interface IIntegrationGameDTO {
  apiId: number
  team_a: string
  team_b: string
  fase: GameFase
  data_hora: Date
  gols_a: number | null
  gols_b: number | null
  finish_game: boolean
}

export interface IIntegrationTeamDTO {
  apiId: number
  name: string
  code: string | null
  logo: string | null
}

export interface IIntegrationGameLookup {
  id: string
  apiId: number | null
  finish_game: boolean
  gols_a: number | null
  gols_b: number | null
}

export interface IIntegrationTeamLookup {
  id: string
}
