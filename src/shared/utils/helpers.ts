export function formatPercentWithoutSymbol(value: number, precision = 2) {
  const formattedValue = Number(value)
  const percentValue = new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(formattedValue)

  return percentValue.replaceAll('%', '').replaceAll(',', '.')
}
