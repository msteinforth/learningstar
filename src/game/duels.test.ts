import { describe, expect, it } from 'vitest'
import { duelOutcome, duelWins, LocalDuelStore, openChallenges, sanitizeDuels } from './duels'
import { missions } from './missions'
import { createRng } from './random'
import { generateTasks } from './tasks'
import type { Duel } from './types'

class MemoryStorage {
  private items = new Map<string, string>()
  getItem(key: string) {
    return this.items.get(key) ?? null
  }
  setItem(key: string, value: string) {
    this.items.set(key, value)
  }
}

const result = (points: number, correct = points) => ({ points, maxPoints: 20, correct, total: 10, finishedAt: '2026-09-26T08:00:00.000Z' })
const duel = (overrides: Partial<Duel> = {}): Duel => ({
  id: 'd1',
  mission: missions[0],
  seed: 42,
  challengerId: 'lena',
  opponentId: 'tom',
  createdAt: '2026-09-26T08:00:00.000Z',
  challengerResult: result(14),
  opponentResult: null,
  ...overrides,
})

describe('duels', () => {
  it('give both children the same tasks, whatever mistakes they made before', () => {
    const a = generateTasks(missions[2], createRng(42), {})
    const b = generateTasks(missions[2], createRng(42), {})
    expect(a.map((task) => task.prompt)).toEqual(b.map((task) => task.prompt))
  })

  it('decide the winner by horseshoes, then correct answers', () => {
    expect(duelOutcome(duel())).toEqual({ status: 'open' })
    expect(duelOutcome(duel({ opponentResult: result(16) }))).toEqual({ status: 'done', winnerId: 'tom' })
    expect(duelOutcome(duel({ opponentResult: result(14, 9) }))).toEqual({ status: 'done', winnerId: 'lena' })
    expect(duelOutcome(duel({ opponentResult: result(14) }))).toEqual({ status: 'done', winnerId: null })
  })

  it('count wins and open challenges per child', () => {
    const list = [duel({ id: 'a', opponentResult: result(20) }), duel({ id: 'b', opponentResult: result(3) }), duel({ id: 'c' })]
    expect(duelWins(list, 'tom')).toBe(1)
    expect(duelWins(list, 'lena')).toBe(1)
    expect(openChallenges(list, 'tom').map((d) => d.id)).toEqual(['c'])
    expect(openChallenges(list, 'lena')).toEqual([])
  })

  it('drop broken duels', () => {
    const vocabulary = missions.find((mission) => mission.type === 'vocabulary')!
    // A vocabulary mission that is neither built in nor carries its words cannot be played.
    expect(sanitizeDuels([duel(), { id: 'x' }, duel({ mission: { ...vocabulary, id: 'gibt-es-nicht' } })])).toEqual([duel()])
  })

  it('are stored on the device and can be answered once', async () => {
    const store = new LocalDuelStore(new MemoryStorage() as unknown as Storage)
    await store.create(duel())
    await expect(store.answer('d1', 'lena', result(1))).rejects.toThrow()
    const answered = await store.answer('d1', 'tom', result(18))
    expect(answered.opponentResult?.points).toBe(18)
    await expect(store.answer('d1', 'tom', result(20))).rejects.toThrow()
    expect(await store.list()).toEqual([answered])
  })
})
