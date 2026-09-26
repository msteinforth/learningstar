import quizData from '../data/quiz.json'
import vocabularyData from '../data/vocabulary.json'
import { type Rng, shuffle, weightedPick } from './random'
import type { Language, Mission, MultiplicationConfig, QuizConfig, QuizQuestion, Task, VocabularyConfig, VocabularyWord } from './types'

export type { Language, QuizQuestion, VocabularyWord }

export const LANGUAGE_NAMES: Record<Language, string> = { en: 'Englisch', fr: 'Französisch', es: 'Spanisch' }

export interface VocabularyList {
  title: string
  language: Language
  words: VocabularyWord[]
}

export const vocabularyLists = vocabularyData as Record<string, VocabularyList>

export interface QuizBank {
  title: string
  hint: string
  questions: QuizQuestion[]
}

export const quizBanks = quizData as Record<string, QuizBank>

type Mistakes = Record<string, number>

/** Items answered wrongly before are picked more often. */
const mistakeWeight = (mistakes: Mistakes, key: string) => 1 + 2 * Math.min(mistakes[key] ?? 0, 5)

export function generateTasks(mission: Mission, rng: Rng, mistakes: Mistakes = {}): Task[] {
  switch (mission.type) {
    case 'multiplication':
      return multiplicationTasks(mission.config, rng, mistakes)
    case 'vocabulary':
      return vocabularyTasks(mission.config, rng, mistakes)
    case 'quiz':
      return quizTasks(mission.config, rng, mistakes)
  }
}

// --- 1×1 -------------------------------------------------------------------

/** 0 = easy (1, 2, 5, 10), 1 = medium (3, 4), 2 = hard (6–9). */
function factorDifficulty(factor: number): number {
  if ([1, 2, 5, 10].includes(factor)) return 0
  if ([3, 4].includes(factor)) return 1
  return 2
}

export function multiplicationBasePoints(a: number, b: number): number {
  if ([1, 10].includes(a) || [1, 10].includes(b)) return 1
  const sum = factorDifficulty(a) + factorDifficulty(b)
  if (sum === 0) return 1
  return sum <= 2 ? 2 : 3
}

function multiplicationChoices(row: number, n: number, rng: Rng): string[] {
  const answer = row * n
  const candidates = [row * (n - 1), row * (n + 1), (row - 1) * n, (row + 1) * n, answer + 1, answer - 1, answer + 10, answer - 10]
  const distractors = shuffle([...new Set(candidates)].filter((value) => value > 0 && value !== answer), rng).slice(0, 3)
  return shuffle([answer, ...distractors], rng).map(String)
}

function multiplicationTasks(config: MultiplicationConfig, rng: Rng, mistakes: Mistakes): Task[] {
  const mode = config.mode ?? 'input'
  const pairs = config.factors.flatMap((row) => Array.from({ length: 10 }, (_, i) => ({ row, n: i + 1, key: `1x1:${i + 1}x${row}` })))
  return weightedPick(pairs, config.count, (pair) => mistakeWeight(mistakes, pair.key), rng).map(({ row, n, key }) => {
    const base = multiplicationBasePoints(row, n)
    return {
      key,
      prompt: `${n} × ${row}`,
      hint: 'Rechne aus',
      answer: String(row * n),
      alternatives: [],
      mode,
      inputKind: 'number',
      choices: mode === 'choice' ? multiplicationChoices(row, n, rng) : [],
      // Picking from options is easier than typing, so it earns one point less.
      basePoints: mode === 'choice' ? Math.max(1, base - 1) : base,
    }
  })
}

// --- Vocabulary --------------------------------------------------------------

function vocabularyTasks(config: VocabularyConfig, rng: Rng, mistakes: Mistakes): Task[] {
  const list: VocabularyList | undefined = config.words
    ? { title: '', language: config.language ?? 'en', words: config.words }
    : vocabularyLists[config.list]
  if (!list) throw new Error(`Unbekannte Vokabelliste: ${config.list}`)
  const toGerman = config.direction === 'to-de'
  const keyOf = (word: VocabularyWord) => `vocab:${config.list}:${word.word}`
  const target = (word: VocabularyWord) => (toGerman ? word.de : word.word)

  return weightedPick(list.words, config.count, (word) => mistakeWeight(mistakes, keyOf(word)), rng).map((word) => {
    const answer = target(word)
    const distractors = shuffle(
      list.words.filter((other) => other !== word).map(target),
      rng,
    ).slice(0, 3)
    return {
      key: keyOf(word),
      prompt: toGerman ? word.word : word.de,
      hint: `Was heißt das auf ${toGerman ? 'Deutsch' : LANGUAGE_NAMES[list.language]}?`,
      answer,
      alternatives: (toGerman ? word.deAlt : word.wordAlt) ?? [],
      mode: config.mode,
      inputKind: 'text',
      choices: config.mode === 'choice' ? shuffle([answer, ...distractors], rng) : [],
      basePoints: config.mode === 'choice' ? 1 : 2,
    }
  })
}

// --- Quiz (e.g. German grammar) ------------------------------------------------------

function quizTasks(config: QuizConfig, rng: Rng, mistakes: Mistakes): Task[] {
  const bank: QuizBank | undefined = config.questions
    ? { title: '', hint: config.hint ?? 'Weißt du die Antwort?', questions: config.questions }
    : quizBanks[config.bank]
  if (!bank) throw new Error(`Unbekannter Fragenpool: ${config.bank}`)
  const keyOf = (question: QuizQuestion) => `quiz:${config.bank}:${question.prompt}`
  const allAnswers = [...new Set(bank.questions.map((question) => question.answer))]

  return weightedPick(bank.questions, config.count, (question) => mistakeWeight(mistakes, keyOf(question)), rng).map((question) => {
    const options = question.options ?? [question.answer, ...shuffle(allAnswers.filter((answer) => answer !== question.answer), rng).slice(0, 3)]
    return {
      key: keyOf(question),
      prompt: question.prompt,
      hint: bank.hint,
      answer: question.answer,
      alternatives: question.alternatives ?? [],
      mode: config.mode,
      inputKind: 'text',
      // Grammar options like der/die/das keep their natural order.
      choices: config.mode === 'choice' ? (question.options?.length === 3 ? question.options : shuffle(options, rng)) : [],
      basePoints: config.mode === 'choice' ? 1 : 2,
    }
  })
}
