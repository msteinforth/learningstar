import { describe, expect, it } from 'vitest'
import { missions } from './missions'
import { createPlayer, summarize } from './progress'
import { LocalPlayerStore, startOfWeek } from './storage'

class MemoryStorage implements Storage {
  private items = new Map<string, string>()
  get length() {
    return this.items.size
  }
  clear() {
    this.items.clear()
  }
  getItem(key: string) {
    return this.items.get(key) ?? null
  }
  key(index: number) {
    return [...this.items.keys()][index] ?? null
  }
  removeItem(key: string) {
    this.items.delete(key)
  }
  setItem(key: string, value: string) {
    this.items.set(key, value)
  }
}

const mission = missions[0]
const resultWith = (points: number) => summarize(mission, [{ key: 'k', correct: true, points }], 3)

describe('startOfWeek', () => {
  it('returns Monday 0:00', () => {
    expect(startOfWeek(new Date(2026, 8, 25, 15, 30))).toEqual(new Date(2026, 8, 21))
    expect(startOfWeek(new Date(2026, 8, 27, 23, 0))).toEqual(new Date(2026, 8, 21))
    expect(startOfWeek(new Date(2026, 8, 21, 0, 0))).toEqual(new Date(2026, 8, 21))
  })
})

describe('LocalPlayerStore', () => {
  it('stores players and results', async () => {
    const store = new LocalPlayerStore(new MemoryStorage())
    const lena = await store.create(createPlayer('Lena', '🐴', '#c0703a'))
    const updated = await store.recordResult(lena.id, resultWith(3))
    expect(updated.totalPoints).toBe(3)
    expect(await store.list()).toEqual([updated])
  })

  it('ranks by points of the current week', async () => {
    let now = new Date(2026, 8, 18, 12) // Friday of the previous week
    const store = new LocalPlayerStore(new MemoryStorage(), () => now)
    const lena = await store.create(createPlayer('Lena', '🐴', '#c0703a'))
    const tom = await store.create(createPlayer('Tom', '🦄', '#5b7fb5'))

    await store.recordResult(lena.id, resultWith(3))
    await store.recordResult(lena.id, resultWith(3))
    now = new Date(2026, 8, 22, 12) // Tuesday
    await store.recordResult(tom.id, resultWith(2))

    const board = await store.leaderboard()
    expect(board.map((entry) => [entry.name, entry.weekPoints, entry.totalPoints])).toEqual([
      ['Tom', 2, 2],
      ['Lena', 0, 6],
    ])
  })

  it('clears local profiles after moving them into a family', async () => {
    const store = new LocalPlayerStore(new MemoryStorage())
    await store.create(createPlayer('Lena', '🐴', '#c0703a'))
    store.clear()
    expect(await store.list()).toEqual([])
  })
})
