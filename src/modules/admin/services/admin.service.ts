import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { eq } from 'drizzle-orm'
import { roundToFaseMap } from '../../../data/enums'
import { db } from '../../../db/connection'
import { ranking } from '../../../db/schemas/ranking'
import { isValidId } from '../../../shared/utils/helpers'
import type { BetRepository } from '../../bet/repositories/bet.repository'
import type { BonusService } from '../../bonus-progresso/services/bonus-progresso.service'
import type { GameFase, IGame } from '../../games/interfaces/game.interface'
import type { GameRepository } from '../../games/repositories/game.repository'
import type { RankingRepository } from '../../ranking/repositories/ranking.repository'
import type {
  IAtualizarParticipantesLoteResponse,
  IDashboardResponse,
  ILoteResultadoItem,
  ILoteResultadoResponse,
  IPopularBaseResponse,
  IRecalcularResponse,
  IResultadoDTO,
} from '../interfaces/admin.interface'
import type { AdminRepository } from '../repositories/admin.repository'

export class AdminService {
  constructor(
    private adminRepository: AdminRepository,
    private gameRepository: GameRepository,
    private betRepository: BetRepository,
    private rankingRepository: RankingRepository,
    private bonusService: BonusService
  ) {}

  private determinarResultado(
    gols_a: number,
    gols_b: number
  ): 'A' | 'B' | 'EMPATE' {
    if (gols_a > gols_b) return 'A'
    if (gols_b > gols_a) return 'B'
    return 'EMPATE'
  }

  private verificarAcerto(
    palpite: string,
    resultado: 'A' | 'B' | 'EMPATE'
  ): boolean {
    return palpite === resultado
  }

  private mapearFase(round: string, group?: string): GameFase {
    if (round.startsWith('Matchday')) {
      if (!group) {
        throw {
          statusCode: 400,
          message: `Jogo de grupos sem group: ${round}`,
        }
      }
      return 'GRUPOS'
    }

    const fase = roundToFaseMap[round]
    if (!fase) {
      throw {
        statusCode: 400,
        message: `Round não suportado para fase: ${round}`,
      }
    }

    return fase as GameFase
  }

  private parseDateTimeFromMatch(date: string, time: string): Date {
    const [year, month, day] = date.split('-').map(Number)
    if (!year || !month || !day) {
      throw { statusCode: 400, message: `Data inválida no JSON: ${date}` }
    }

    const parsed = /^(\d{1,2}):(\d{2})\s+UTC([+-]\d{1,2})$/.exec(time)
    if (!parsed) {
      throw { statusCode: 400, message: `Hora inválida no JSON: ${time}` }
    }

    const horaLocal = Number(parsed[1])
    const minuto = Number(parsed[2])
    const utcOffset = Number(parsed[3])

    return new Date(
      Date.UTC(year, month - 1, day, horaLocal - utcOffset, minuto, 0, 0)
    )
  }

  private async _aplicarResultadoJogo(
    data: IResultadoDTO
  ): Promise<{ team_a: string; team_b: string }> {
    if (!isValidId(data.gameId)) {
      throw { statusCode: 400, message: 'ID do jogo inválido' }
    }

    const game = await this.gameRepository.getById(data.gameId)
    if (!game) {
      throw { statusCode: 404, message: 'Jogo não encontrado' }
    }

    if (game.finish_game) {
      throw {
        statusCode: 400,
        message:
          'Jogo já está encerrado. Para corrigir o resultado, use o endpoint de correção.',
      }
    }

    await this.adminRepository.atualizarResultadoJogo(
      data.gameId,
      data.gols_a,
      data.gols_b
    )

    const resultadoReal = this.determinarResultado(data.gols_a, data.gols_b)
    const apostas = await this.adminRepository.buscarApostasPorJogo(data.gameId)
    for (const aposta of apostas) {
      const acertou = this.verificarAcerto(aposta.palpite, resultadoReal)
      await this.adminRepository.atualizarAcertoAposta(aposta.id, acertou)
    }

    return { team_a: game.team_a, team_b: game.team_b }
  }

  private _validarFaseEliminatoria(fase: GameFase): void {
    if (fase === 'GRUPOS') {
      throw {
        statusCode: 400,
        message:
          'Atualização manual de participantes é permitida apenas no mata-mata.',
      }
    }
  }

  private async _atualizarParticipantesJogo(
    gameId: string,
    team_a: string,
    team_b: string
  ): Promise<void> {
    if (!isValidId(gameId)) {
      throw { statusCode: 400, message: 'ID do jogo inválido' }
    }

    if (team_a === team_b) {
      throw {
        statusCode: 400,
        message: 'As seleções devem ser diferentes',
      }
    }

    const game = await this.gameRepository.getById(gameId)
    if (!game) {
      throw { statusCode: 404, message: 'Jogo não encontrado' }
    }

    if (game.finish_game) {
      throw {
        statusCode: 400,
        message: 'Não é possível alterar participantes de jogo encerrado',
      }
    }

    this._validarFaseEliminatoria(game.fase as GameFase)

    const [teamAExists, teamBExists] = await Promise.all([
      this.adminRepository.existeSelecaoPorNome(team_a),
      this.adminRepository.existeSelecaoPorNome(team_b),
    ])

    if (!teamAExists || !teamBExists) {
      throw {
        statusCode: 404,
        message: 'Uma ou mais seleções não existem na base',
      }
    }

    await this.adminRepository.atualizarParticipantesJogo(
      gameId,
      team_a,
      team_b
    )
  }

  async atualizarResultado(data: IResultadoDTO): Promise<{ message: string }> {
    const game = await this._aplicarResultadoJogo(data)
    await this.recalcularPontuacaoGeral()
    return {
      message: `Resultado do jogo ${game.team_a} x ${game.team_b} atualizado com sucesso`,
    }
  }

  async recalcularPontuacaoGeral(): Promise<IRecalcularResponse> {
    // Buscar todos os usuários
    const todosUsuarios = await this.rankingRepository.getRankingPontos()
    let usuariosAtualizados = 0

    for (const usuario of todosUsuarios) {
      // Buscar estatísticas de apostas do usuário
      const estatisticas = await this.betRepository.getEstatisticasPorUsuario(
        usuario.userId
      )

      if (estatisticas) {
        // Buscar bônus do usuário
        const bonusInfo = await this.bonusService.getProgressoUser(
          usuario.userId
        )

        // Calcular pontos totais
        const pontos_apostas = estatisticas.pontos_apostas
        const pontos_bonus = bonusInfo.bonus_concedido
        const pontos_total = pontos_apostas + pontos_bonus

        // Atualizar tabela de ranking
        // Nota: Como não temos o repositório de ranking com update, farei diretamente

        const existing = await db
          .select()
          .from(ranking)
          .where(eq(ranking.userId, usuario.userId))

        if (existing.length > 0) {
          await db
            .update(ranking)
            .set({
              pontos_apostas,
              pontos_bonus,
              pontos_total,
              acertos: estatisticas.acertos,
              total_apostas: estatisticas.total_apostas,
              updated_at: new Date(),
            })
            .where(eq(ranking.userId, usuario.userId))
        } else {
          await db.insert(ranking).values({
            userId: usuario.userId,
            pontos_apostas,
            pontos_bonus,
            pontos_total,
            acertos: estatisticas.acertos,
            total_apostas: estatisticas.total_apostas,
          })
        }

        usuariosAtualizados++
      }
    }

    return {
      message: 'Pontuação recalculada com sucesso',
      usuarios_atualizados: usuariosAtualizados,
      apostas_processadas: todosUsuarios.reduce(
        (acc, u) => acc + (u.total_apostas || 0),
        0
      ),
    }
  }

  async getDashboard(): Promise<IDashboardResponse> {
    return await this.adminRepository.getDashboard()
  }

  async inserirMultiplosResultados(
    items: ILoteResultadoItem[]
  ): Promise<ILoteResultadoResponse> {
    const detalhes: ILoteResultadoResponse['detalhes'] = []
    let sucesso = 0
    let erros = 0

    for (const item of items) {
      try {
        await this._aplicarResultadoJogo(item)
        sucesso++
        detalhes.push({
          gameId: item.gameId,
          status: 'ok',
          message: 'Resultado atualizado com sucesso',
        })
      } catch (err: unknown) {
        erros++
        const msg =
          err && typeof err === 'object' && 'message' in err
            ? String((err as { message: unknown }).message)
            : 'Erro desconhecido'
        detalhes.push({ gameId: item.gameId, status: 'erro', message: msg })
      }
    }

    if (sucesso > 0) {
      await this.recalcularPontuacaoGeral()
    }

    return { sucesso, erros, detalhes }
  }

  async corrigirResultado(
    gameId: string,
    gols_a: number,
    gols_b: number
  ): Promise<{ message: string }> {
    if (!isValidId(gameId)) {
      throw { statusCode: 400, message: 'ID do jogo inválido' }
    }

    const game = await this.gameRepository.getById(gameId)
    if (!game) {
      throw { statusCode: 404, message: 'Jogo não encontrado' }
    }

    await this.adminRepository.resetarPontuacaoJogo(gameId)
    await this.adminRepository.atualizarResultadoJogo(gameId, gols_a, gols_b)

    const resultadoReal = this.determinarResultado(gols_a, gols_b)
    const apostas = await this.adminRepository.buscarApostasPorJogo(gameId)
    for (const aposta of apostas) {
      const acertou = this.verificarAcerto(aposta.palpite, resultadoReal)
      await this.adminRepository.atualizarAcertoAposta(aposta.id, acertou)
    }

    await this.recalcularPontuacaoGeral()

    return {
      message: `Resultado do jogo ${game.team_a} x ${game.team_b} corrigido com sucesso`,
    }
  }

  async listarJogosPendentes(): Promise<IGame[]> {
    return await this.gameRepository.listPendentes()
  }

  async listarJogosDeHoje(): Promise<IGame[]> {
    return await this.gameRepository.listHoje()
  }

  async listarJogosPorFase(fase: GameFase): Promise<IGame[]> {
    return await this.gameRepository.listByFase(fase)
  }

  async atualizarParticipantesJogoManual(
    gameId: string,
    team_a: string,
    team_b: string
  ): Promise<{ message: string }> {
    await this._atualizarParticipantesJogo(gameId, team_a, team_b)
    return { message: 'Participantes atualizados com sucesso' }
  }

  async atualizarParticipantesLoteManual(
    jogos: Array<{ gameId: string; team_a: string; team_b: string }>
  ): Promise<IAtualizarParticipantesLoteResponse> {
    const detalhes: IAtualizarParticipantesLoteResponse['detalhes'] = []
    let sucesso = 0
    let erros = 0

    for (const jogo of jogos) {
      try {
        await this._atualizarParticipantesJogo(
          jogo.gameId,
          jogo.team_a,
          jogo.team_b
        )
        sucesso++
        detalhes.push({
          gameId: jogo.gameId,
          status: 'ok',
          message: 'Participantes atualizados com sucesso',
        })
      } catch (err: unknown) {
        erros++
        const msg =
          err && typeof err === 'object' && 'message' in err
            ? String((err as { message: unknown }).message)
            : 'Erro desconhecido'
        detalhes.push({
          gameId: jogo.gameId,
          status: 'erro',
          message: msg,
        })
      }
    }

    return { sucesso, erros, detalhes }
  }

  async popularBaseLocal(): Promise<IPopularBaseResponse> {
    const teamsPath = resolve(
      process.cwd(),
      'src/data/worldcup-2026/teams.json'
    )
    const matchesPath = resolve(
      process.cwd(),
      'src/data/worldcup-2026/matches.json'
    )

    const teamsJson = await readFile(teamsPath, 'utf-8')
    const matchesJson = await readFile(matchesPath, 'utf-8')

    const teamsData = JSON.parse(teamsJson) as Array<{
      name: string
      fifa_code?: string
    }>
    const matchesData = JSON.parse(matchesJson) as {
      matches: Array<{
        round: string
        date: string
        time: string
        team1: string
        team2: string
        group?: string
      }>
    }

    let teamsInseridos = 0
    let teamsIgnorados = 0

    for (const [index, team] of teamsData.entries()) {
      const exists = await this.adminRepository.buscarTeamPorNome(team.name)
      if (exists) {
        teamsIgnorados++
        continue
      }

      await this.adminRepository.inserirTeam({
        apiId: index + 1,
        name: team.name,
        code: team.fifa_code ?? null,
        logo: null,
      })
      teamsInseridos++
    }

    let jogosInseridos = 0
    let jogosIgnorados = 0

    for (const [index, match] of matchesData.matches.entries()) {
      const apiId = index + 1
      const exists = await this.adminRepository.buscarJogoPorApiId(apiId)
      if (exists) {
        jogosIgnorados++
        continue
      }

      await this.adminRepository.inserirJogo({
        apiId,
        team_a: match.team1,
        team_b: match.team2,
        fase: this.mapearFase(match.round, match.group),
        data_hora: this.parseDateTimeFromMatch(match.date, match.time),
      })
      jogosInseridos++
    }

    return {
      teams_inseridos: teamsInseridos,
      teams_ignorados: teamsIgnorados,
      jogos_inseridos: jogosInseridos,
      jogos_ignorados: jogosIgnorados,
    }
  }
}
