export type MissionType = 'multiplication' | 'vocabulary'
export type AnswerMode = 'choice' | 'input'
export type Direction = 'en-de' | 'de-en'

export interface MultiplicationConfig {
  /** Rows of the times table to practise, e.g. [7] for the 7-times table. */
  factors: number[]
  count: number
  mode?: AnswerMode
}

export interface VocabularyConfig {
  /** Key into the vocabulary lists in src/data/vocabulary.json. */
  list: string
  direction: Direction
  mode: AnswerMode
  count: number
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
}

export type Mission =
  | (MissionBase & { type: 'multiplication'; config: MultiplicationConfig })
  | (MissionBase & { type: 'vocabulary'; config: VocabularyConfig })

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
