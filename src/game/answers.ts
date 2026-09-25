const ARTICLES = /^(der|die|das|ein|eine|the|a|an|to)\s+/

/** Lower-cases, trims and removes leading articles so "das Pferd" matches "Pferd". */
export function normalizeAnswer(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(ARTICLES, '')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
}

export function isCorrectAnswer(given: string, answer: string, alternatives: readonly string[] = []): boolean {
  const normalized = normalizeAnswer(given)
  if (normalized === '') return false
  return [answer, ...alternatives].some((candidate) => normalizeAnswer(candidate) === normalized)
}
