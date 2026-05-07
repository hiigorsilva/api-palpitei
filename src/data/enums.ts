export const faseOptions = [
  'GRUPOS',
  '32_AVOS',
  'OITAVAS',
  'QUARTAS',
  'SEMI',
  'TERCEIRO',
  'FINAL',
]

export const statusOptions = ['FUTURO', 'ENCERRADO']

/**
 * Mapeamento do campo `round` do JSON local (data/worldcup-2026/matches.json)
 * para o enum `fase` usado no banco de dados.
 * Jogos de grupos são detectados no serviço pela presença do campo `group`.
 */
export const roundToFaseMap: Record<string, string> = {
  'Fase de 32 avos': '32_AVOS',
  'Oitavas de final': 'OITAVAS',
  'Quartas de final': 'QUARTAS',
  Semifinal: 'SEMI',
  'Disputa de terceiro lugar': 'TERCEIRO',
  Final: 'FINAL',
}
