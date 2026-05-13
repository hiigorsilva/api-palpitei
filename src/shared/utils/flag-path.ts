const flagCodeByFifaCode: Record<string, string> = {
  COD: 'cg',
  ENG: 'gb',
  SCO: 'sc',
}

const flagExtensionByCode: Record<string, string> = {
  cw: 'png',
}

function countryCodeFromEmoji(flagIcon: string): string | null {
  const codePoints = [...flagIcon].map(char => char.codePointAt(0))
  if (codePoints.length !== 2 || codePoints.some(code => !code)) return null

  const letters = codePoints.map(code => {
    if (!code || code < 0x1f1e6 || code > 0x1f1ff) return null
    return String.fromCharCode(code - 0x1f1e6 + 97)
  })

  if (letters.some(letter => !letter)) return null
  return letters.join('')
}

export function buildFlagPath(flagIcon: string, fifaCode: string): string {
  const explicitCode = flagCodeByFifaCode[fifaCode.toUpperCase()]
  const flagCode =
    explicitCode ||
    (flagIcon.length <= 3
      ? flagIcon.toLowerCase()
      : countryCodeFromEmoji(flagIcon))

  if (!flagCode) {
    return '/src/data/country-flags/unknown.webp'
  }

  const extension = flagExtensionByCode[flagCode] || 'webp'
  return `/src/data/country-flags/${flagCode}.${extension}`
}
