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
