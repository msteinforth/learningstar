// German, English, French and Spanish articles (and "to" before English verbs).
const ARTICLES = /^(der|die|das|ein|eine|the|a|an|to|le|la|les|un|une|el|los|las|una)\s+|^l['’]\s*/

/**
 * Makes typed answers comparable: case, spaces, punctuation, leading articles
 * ("das Pferd" = "Pferd", "l'écurie" = "ecurie") and accents are ignored;
 * German umlauts may also be written as ae/oe/ue.
 */
export function normalizeAnswer(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[¿¡?!.,;:]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(ARTICLES, '')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function isCorrectAnswer(given: string, answer: string, alternatives: readonly string[] = []): boolean {
  const normalized = normalizeAnswer(given)
  if (normalized === '') return false
  return [answer, ...alternatives].some((candidate) => normalizeAnswer(candidate) === normalized)
}
