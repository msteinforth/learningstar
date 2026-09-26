import { findTrack, missions as builtInMissions } from './missions'
import { quizBanks } from './tasks'
import type { AnswerMode, Direction, Language, Mission, QuizQuestion, VocabularyWord } from './types'

/** What the parents fill in when they create or edit a mission. */
export interface MissionDraft {
  id?: string
  title: string
  track: string
  kind: 'vocabulary' | 'quiz' | 'multiplication'
  /** Word pairs or questions, one per line. */
  text: string
  factors: number[]
  direction: Direction
  mode: AnswerMode
  count: number
}

export const TRACK_LANGUAGES: Record<string, Language> = { english: 'en', french: 'fr', spanish: 'es' }

/** Which kinds of missions make sense in a tournament. */
export function kindsFor(track: string): MissionDraft['kind'][] {
  if (track === 'math') return ['multiplication', 'quiz']
  if (TRACK_LANGUAGES[track]) return ['vocabulary', 'quiz']
  return ['quiz']
}

const SEPARATOR = /\s*(?:=|\t|;)\s*/
const splitAlternatives = (value: string) =>
  value
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean)

export interface ParseResult<T> {
  items: T[]
  /** 1-based numbers of lines that could not be read. */
  errorLines: number[]
}

/** "the saddle = der Sattel" per line; alternatives with "/": "der Schweif / der Schwanz". */
export function parseVocabulary(text: string): ParseResult<VocabularyWord> {
  const items: VocabularyWord[] = []
  const errorLines: number[] = []
  text.split('\n').forEach((line, index) => {
    if (!line.trim()) return
    const [left, right, ...rest] = line.split(SEPARATOR)
    const foreign = splitAlternatives(left ?? '')
    const german = splitAlternatives(right ?? '')
    if (rest.length > 0 || foreign.length === 0 || german.length === 0) {
      errorLines.push(index + 1)
      return
    }
    const word: VocabularyWord = { word: foreign[0], de: german[0] }
    if (foreign.length > 1) word.wordAlt = foreign.slice(1)
    if (german.length > 1) word.deAlt = german.slice(1)
    items.push(word)
  })
  return { items, errorLines }
}

/** "Frage = Antwort" per line, optionally with wrong answers: "Frage = Antwort | falsch | falsch". */
export function parseQuestions(text: string): ParseResult<QuizQuestion> {
  const items: QuizQuestion[] = []
  const errorLines: number[] = []
  text.split('\n').forEach((line, index) => {
    if (!line.trim()) return
    const separator = line.indexOf('=')
    if (separator < 0) {
      errorLines.push(index + 1)
      return
    }
    const prompt = line.slice(0, separator).trim()
    const [answerPart, ...wrong] = line
      .slice(separator + 1)
      .split('|')
      .map((part) => part.trim())
    const answers = splitAlternatives(answerPart ?? '')
    const wrongAnswers = wrong.filter(Boolean)
    if (!prompt || answers.length === 0) {
      errorLines.push(index + 1)
      return
    }
    const question: QuizQuestion = { prompt, answer: answers[0] }
    if (answers.length > 1) question.alternatives = answers.slice(1)
    if (wrongAnswers.length > 0) question.options = [answers[0], ...wrongAnswers.filter((option) => option !== answers[0])]
    items.push(question)
  })
  return { items, errorLines }
}

export function formatVocabulary(words: VocabularyWord[]): string {
  return words.map((word) => `${[word.word, ...(word.wordAlt ?? [])].join(' / ')} = ${[word.de, ...(word.deAlt ?? [])].join(' / ')}`).join('\n')
}

export function formatQuestions(questions: QuizQuestion[]): string {
  return questions
    .map((question) => {
      const answer = [question.answer, ...(question.alternatives ?? [])].join(' / ')
      const wrong = (question.options ?? []).filter((option) => option !== question.answer)
      return [`${question.prompt} = ${answer}`, ...wrong].join(' | ')
    })
    .join('\n')
}

export function emptyDraft(track = 'english'): MissionDraft {
  return { title: '', track, kind: kindsFor(track)[0], text: '', factors: [], direction: 'to-de', mode: 'choice', count: 10 }
}

export function draftFromMission(mission: Mission): MissionDraft {
  const base = { ...emptyDraft(mission.track), id: mission.id, title: mission.title }
  switch (mission.type) {
    case 'multiplication':
      return { ...base, kind: 'multiplication', factors: mission.config.factors, mode: mission.config.mode ?? 'input', count: mission.config.count }
    case 'vocabulary':
      return {
        ...base,
        kind: 'vocabulary',
        text: formatVocabulary(mission.config.words ?? []),
        direction: mission.config.direction,
        mode: mission.config.mode,
        count: mission.config.count,
      }
    case 'quiz':
      return { ...base, kind: 'quiz', text: formatQuestions(mission.config.questions ?? []), mode: mission.config.mode, count: mission.config.count }
  }
}

/** Problems that prevent saving the draft, in words for parents. */
export function draftProblems(draft: MissionDraft): string[] {
  const problems: string[] = []
  if (!draft.title.trim()) problems.push('Bitte gib der Mission einen Namen.')
  if (draft.kind === 'multiplication') {
    if (draft.factors.length === 0) problems.push('Bitte wähle mindestens eine 1×1-Reihe.')
    return problems
  }
  const parsed = draft.kind === 'vocabulary' ? parseVocabulary(draft.text) : parseQuestions(draft.text)
  if (parsed.errorLines.length > 0) problems.push(`Zeile ${parsed.errorLines.join(', ')} ist nicht lesbar – es fehlt das „=“.`)
  if (parsed.items.length < 2) problems.push('Bitte trage mindestens zwei Einträge ein.')
  if (draft.mode === 'choice' && draft.kind === 'quiz') {
    const questions = parsed.items as QuizQuestion[]
    const answers = new Set(questions.map((question) => question.answer))
    if (questions.some((question) => !question.options) && answers.size < 2) {
      problems.push('Zum Auswählen braucht es verschiedene Antworten oder falsche Antworten mit „|“.')
    }
  }
  return problems
}

/** Turns a checked draft into a mission for the tournament path. */
export function buildMission(draft: MissionDraft, newId: () => string = () => `custom-${crypto.randomUUID()}`): Mission {
  const id = draft.id ?? newId()
  const base = { id, title: draft.title.trim(), track: draft.track, custom: true }
  const count = Math.max(1, Math.min(20, Math.round(draft.count)))
  switch (draft.kind) {
    case 'multiplication':
      return {
        ...base,
        type: 'multiplication',
        subtitle: `1×1 mit ${[...draft.factors].sort((a, b) => a - b).join(', ')}`,
        config: { factors: [...draft.factors].sort((a, b) => a - b), count, mode: draft.mode },
      }
    case 'vocabulary': {
      const words = parseVocabulary(draft.text).items
      return {
        ...base,
        type: 'vocabulary',
        subtitle: `${words.length} Vokabeln · ${draft.direction === 'to-de' ? 'ins Deutsche' : 'aus dem Deutschen'}`,
        config: { list: id, words, language: TRACK_LANGUAGES[draft.track] ?? 'en', direction: draft.direction, mode: draft.mode, count: Math.min(count, words.length) },
      }
    }
    case 'quiz': {
      const questions = parseQuestions(draft.text).items
      return {
        ...base,
        type: 'quiz',
        subtitle: `${questions.length} Fragen`,
        config: { bank: id, questions, mode: draft.mode, count: Math.min(count, questions.length) },
      }
    }
  }
}

/** Keeps only well-formed missions (content comes from storage or the server). */
export function sanitizeMissions(value: unknown): Mission[] {
  if (!Array.isArray(value)) return []
  return value.filter((mission): mission is Mission => {
    if (!mission || typeof mission !== 'object') return false
    const m = mission as Partial<Mission>
    if (typeof m.id !== 'string' || typeof m.title !== 'string' || !findTrack(m.track ?? '') || !m.config) return false
    if (m.type === 'multiplication') return Array.isArray(m.config.factors) && m.config.factors.length > 0
    if (m.type === 'vocabulary') return Array.isArray(m.config.words) && m.config.words.length > 0
    if (m.type === 'quiz') return Array.isArray(m.config.questions) && m.config.questions.length > 0
    return false
  })
}

/** Readable description of a remembered mistake key, e.g. "1x1:8x7" → "8 × 7". */
export function describeMistake(key: string, customMissions: Mission[] = []): string {
  const [kind, ...rest] = key.split(':')
  if (kind === '1x1') return (rest[0] ?? '').replace('x', ' × ')
  const source = rest[0] ?? ''
  const item = rest.slice(1).join(':')
  if (kind === 'vocab' || kind === 'quiz') {
    const mission = [...builtInMissions, ...customMissions].find((candidate) => {
      if (candidate.type === 'vocabulary') return candidate.config.list === source
      if (candidate.type === 'quiz') return candidate.config.bank === source
      return false
    })
    const track = mission ? findTrack(mission.track) : undefined
    // Picture questions ("img:bike") are shown by their answer word.
    const label = item.startsWith('img:')
      ? (quizBanks[source]?.questions ?? (mission?.type === 'quiz' ? mission.config.questions : undefined) ?? []).find((q) => q.prompt === item)?.answer ?? item.slice(4)
      : item
    return track ? `${label} (${track.subject})` : label
  }
  return key
}
