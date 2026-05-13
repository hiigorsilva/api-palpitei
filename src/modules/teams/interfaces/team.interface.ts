import { z } from 'zod'

export const GrupoSchema = z.enum([
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
])

export type Grupo = z.infer<typeof GrupoSchema>

export interface ITeam {
  id: string
  apiId: number
  name: string
  code: string | null
  flag: string | null
  continent: string | null
  flag_icon: string | null
  flag_unicode: string | null
  fifa_code: string | null
  confed: string | null
  group: Grupo
  isPalpiteCampeao: boolean
  created_at: Date
  updated_at: Date
}

export interface ITeamDetails {
  id: string
  name: string
  flag: string | null
  continent: string | null
  flag_icon: string | null
  flag_unicode: string | null
  fifa_code: string | null
  group: Grupo
  confed: string | null
  isPalpiteCampeao: boolean
}

export interface ITeamRepository {
  findAll(userId?: string): Promise<ITeam[]>
  findByGroup(group: Grupo, userId?: string): Promise<ITeam[]>
}
