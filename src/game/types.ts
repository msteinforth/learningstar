export type MissionType = 'multiplication' | 'vocabulary' | 'quiz'
export type AnswerMode = 'choice' | 'input'
/** Translate the foreign word into German, or the German word into the foreign language. */
export type Direction = 'to-de' | 'from-de'

export interface MultiplicationConfig {
  /** Rows of the times table to practise, e.g. [7] for the 7-times table. */
  factors: number[]
  count: number
  mode?: AnswerMode
}

export type Language = 'en' | 'fr' | 'es'

export interface VocabularyWord {
  /** The word in the foreign language. */
  word: string
  de: string
  wordAlt?: string[]
  deAlt?: string[]
}

export interface QuizQuestion {
  prompt: string
  answer: string
  /** Answer options for "choice" mode; other answers from the bank are used when missing. */
  options?: string[]
  alternatives?: string[]
}

export interface VocabularyConfig {
  /** Key into the vocabulary lists in src/data/vocabulary.json (or the mission id for own lists). */
  list: string
  direction: Direction
  mode: AnswerMode
  count: number
  /** Own word list, e.g. from the parents' area; used instead of `list`. */
  words?: VocabularyWord[]
  language?: Language
}

export interface QuizConfig {
  /** Key into the question banks in src/data/quiz.json (or the mission id for own questions). */
  bank: string
  mode: AnswerMode
  count: number
  /** Own questions, e.g. from the parents' area; used instead of `bank`. */
  questions?: QuizQuestion[]
  hint?: string
}

interface MissionBase {
  id: string
  title: string
  subtitle: string
  /** Missions on the same track are shown as one path on the map. */
  track: string
  /** Mission that has to be passed before this one is unlocked. */
  requires?: string
  /** Share of the maximum points needed to pass (0–1). Defaults to 0.6. */
  passRatio?: number
  /** Created by the parents in the app (always unlocked). */
  custom?: boolean
}

export type Mission =
  | (MissionBase & { type: 'multiplication'; config: MultiplicationConfig })
  | (MissionBase & { type: 'vocabulary'; config: VocabularyConfig })
  | (MissionBase & { type: 'quiz'; config: QuizConfig })

export interface Task {
  /** Stable key of the underlying item, used to remember mistakes (e.g. "7x8", "en:horse"). */
  key: string
  prompt: string
  /** Small hint shown above the prompt, e.g. "Übersetze ins Deutsche". */
  hint: string
  answer: string
  /** Further accepted spellings of the answer. */
  alternatives: string[]
  mode: AnswerMode
  inputKind: 'number' | 'text'
  /** Answer options when mode is "choice" (contains the answer). */
  choices: string[]
  /** Points for a correct first attempt without speed bonus (1–3). */
  basePoints: number
}

export interface MissionProgress {
  bestPoints: number
  maxPoints: number
  /** Best rosette rating 0–3. */
  bestRosettes: number
  passed: boolean
  plays: number
  lastPlayedAt: string
}

export type ItemSlot = 'hat' | 'buddy' | 'background'

/** Rewards: badges, a daily streak and things bought in the shop. */
export interface PlayerExtras {
  /** Horseshoes spent in the shop (total collected minus spent = what is left). */
  spent: number
  owned: string[]
  equipped: Partial<Record<ItemSlot, string>>
  /** Badge id → date it was earned (ISO). */
  badges: Record<string, string>
  streak: { days: number; lastDay: string | null }
}

export interface Player {
  id: string
  name: string
  avatar: string
  color: string
  createdAt: string
  totalPoints: number
  missions: Record<string, MissionProgress>
  /** Number of mistakes per task key – tricky items are asked more often. */
  mistakes: Record<string, number>
  /** Missing for profiles created before rewards existed; read it via `extrasOf`. */
  extras?: PlayerExtras
}

export interface TaskResult {
  key: string
  correct: boolean
  points: number
}

export interface MissionResult {
  missionId: string
  points: number
  maxPoints: number
  rosettes: number
  passed: boolean
  results: TaskResult[]
}
