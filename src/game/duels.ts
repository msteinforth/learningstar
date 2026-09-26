import { call, type Rpc } from './backend'
import { sanitizeMissions } from './custom'
import { findMission } from './missions'
import type { Duel, DuelResult, Mission, MissionResult } from './types'

export type DuelOutcome = { status: 'open' } | { status: 'done'; winnerId: string | null }

/** Winner by horseshoes; with equal points the one with more correct answers wins, otherwise it's a draw. */
export function duelOutcome(duel: Duel): DuelOutcome {
  const a = duel.challengerResult
  const b = duel.opponentResult
  if (!b) return { status: 'open' }
  const diff = a.points - b.points || a.correct - b.correct
  return { status: 'done', winnerId: diff > 0 ? duel.challengerId : diff < 0 ? duel.opponentId : null }
}

export function duelWins(duels: Duel[], playerId: string): number {
  return duels.filter((duel) => {
    const outcome = duelOutcome(duel)
    return outcome.status === 'done' && outcome.winnerId === playerId
  }).length
}

/** Challenges this player still has to answer. */
export function openChallenges(duels: Duel[], playerId: string): Duel[] {
  return duels.filter((duel) => duel.opponentId === playerId && !duel.opponentResult)
}

export function toDuelResult(result: MissionResult, now = new Date()): DuelResult {
  return {
    points: result.points,
    maxPoints: result.maxPoints,
    correct: result.results.filter((task) => task.correct).length,
    total: result.results.length,
    finishedAt: now.toISOString(),
  }
}

export function newSeed(): number {
  return Math.floor(Math.random() * 2 ** 31)
}

/** Built-in missions are known by id; own missions must carry their words or questions. */
function isPlayable(mission: unknown): boolean {
  if (!mission || typeof mission !== 'object') return false
  const id = (mission as Mission).id
  return (typeof id === 'string' && !!findMission(id)) || sanitizeMissions([mission]).length === 1
}

function isResult(result: unknown): result is DuelResult {
  return !!result && typeof result === 'object' && typeof (result as DuelResult).points === 'number' && typeof (result as DuelResult).maxPoints === 'number'
}

/** Keeps only well-formed duels (they come from storage or the server). */
export function sanitizeDuels(value: unknown): Duel[] {
  if (!Array.isArray(value)) return []
  return value.filter((duel): duel is Duel => {
    if (!duel || typeof duel !== 'object') return false
    const d = duel as Duel
    return (
      typeof d.id === 'string' &&
      typeof d.seed === 'number' &&
      typeof d.challengerId === 'string' &&
      typeof d.opponentId === 'string' &&
      isResult(d.challengerResult) &&
      (d.opponentResult === null || isResult(d.opponentResult)) &&
      isPlayable(d.mission)
    )
  })
}

export interface DuelStore {
  /** Most recent duels first. */
  list(): Promise<Duel[]>
  create(duel: Duel): Promise<Duel>
  answer(duelId: string, playerId: string, result: DuelResult): Promise<Duel>
}

const DUELS_KEY = 'learningstar.duels.v1'
const KEEP_DUELS = 50

export class LocalDuelStore implements DuelStore {
  private readonly storage: Storage

  constructor(storage: Storage = window.localStorage) {
    this.storage = storage
  }

  async list(): Promise<Duel[]> {
    return this.read()
  }

  async create(duel: Duel): Promise<Duel> {
    this.write([duel, ...this.read()].slice(0, KEEP_DUELS))
    return duel
  }

  async answer(duelId: string, playerId: string, result: DuelResult): Promise<Duel> {
    const duels = this.read()
    const duel = duels.find((candidate) => candidate.id === duelId)
    if (!duel || duel.opponentId !== playerId || duel.opponentResult) throw new Error('Dieses Duell ist schon beendet.')
    const answered = { ...duel, opponentResult: result }
    this.write(duels.map((candidate) => (candidate.id === duelId ? answered : candidate)))
    return answered
  }

  private read(): Duel[] {
    try {
      return sanitizeDuels(JSON.parse(this.storage.getItem(DUELS_KEY) ?? '[]'))
    } catch {
      return []
    }
  }

  private write(duels: Duel[]): void {
    this.storage.setItem(DUELS_KEY, JSON.stringify(duels))
  }
}

export class FamilyDuelStore implements DuelStore {
  private readonly rpc: Rpc
  private readonly code: string

  constructor(rpc: Rpc, code: string) {
    this.rpc = rpc
    this.code = code
  }

  async list(): Promise<Duel[]> {
    return sanitizeDuels(await call<unknown>(this.rpc, 'list_duels', { p_code: this.code }))
  }

  async create(duel: Duel): Promise<Duel> {
    await call(this.rpc, 'create_duel', { p_code: this.code, p_duel: duel })
    return duel
  }

  async answer(duelId: string, playerId: string, result: DuelResult): Promise<Duel> {
    const [duel] = sanitizeDuels([
      await call<unknown>(this.rpc, 'answer_duel', { p_code: this.code, p_duel_id: duelId, p_player_id: playerId, p_result: result }),
    ])
    if (!duel) throw new Error('Das Duell konnte nicht gespeichert werden.')
    return duel
  }
}
