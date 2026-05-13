import { pgEnum } from 'drizzle-orm/pg-core'

export const faseEnum = pgEnum('fase', [
  'GRUPOS',
  '16_AVOS',
  'OITAVAS',
  'QUARTAS',
  'SEMI',
  'TERCEIRO',
  'FINAL',
])

export const nivelEnum = pgEnum('nivel', [
  'INICIANTE',
  'BRONZE',
  'PRATA',
  'OURO',
  'PLATINA',
  'DIAMANTE',
])

export const grupoEnum = pgEnum('grupo', [
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
