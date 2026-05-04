import { z } from 'zod'

export interface IResultadoDTO {
  gameId: string
  gols_a: number
  gols_b: number
}

export interface IRecalcularResponse {
  message: string
  usuarios_atualizados: number
  apostas_processadas: number
}

export interface IDashboardResponse {
  total_usuarios: number
  total_apostas: number
  total_jogos: number
  jogos_encerrados: number
  jogos_pendentes: number
  usuarios_com_apostas: number
  media_apostas_por_usuario: number
}

export const ResultadoDTOSchema = z.object({
  gameId: z.string(),
  gols_a: z.number().min(0),
  gols_b: z.number().min(0),
})

export type ResultadoDTO = z.infer<typeof ResultadoDTOSchema>

export interface ILoteResultadoItem {
  gameId: string
  gols_a: number
  gols_b: number
}

export interface ILoteResultadoItemResult {
  gameId: string
  status: 'ok' | 'erro'
  message: string
}

export interface ILoteResultadoResponse {
  sucesso: number
  erros: number
  detalhes: ILoteResultadoItemResult[]
}

export const LoteResultadoDTOSchema = z.object({
  resultados: z
    .array(
      z.object({
        gameId: z.string().uuid('ID do jogo inválido'),
        gols_a: z.number().int().min(0, 'Os gols não podem ser negativos'),
        gols_b: z.number().int().min(0, 'Os gols não podem ser negativos'),
      })
    )
    .min(1, 'Envie ao menos um resultado')
    .max(20, 'Máximo de 20 resultados por requisição'),
})

export type LoteResultadoDTO = z.infer<typeof LoteResultadoDTOSchema>

export const CorrigirResultadoDTOSchema = z.object({
  gols_a: z.number().int().min(0, 'Os gols não podem ser negativos'),
  gols_b: z.number().int().min(0, 'Os gols não podem ser negativos'),
})

export type CorrigirResultadoDTO = z.infer<typeof CorrigirResultadoDTOSchema>

export interface IPopularBaseResponse {
  teams_inseridos: number
  teams_ignorados: number
  jogos_inseridos: number
  jogos_ignorados: number
}
