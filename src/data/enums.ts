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
 * Rodadas de grupo ("Matchday X") são detectadas pela presença do campo `group`.
 */
export const roundToFaseMap: Record<string, string> = {
  'Round of 32': '32_AVOS',
  'Round of 16': 'OITAVAS',
  'Quarter-final': 'QUARTAS',
  'Semi-final': 'SEMI',
  'Match for third place': 'TERCEIRO',
  Final: 'FINAL',
}
