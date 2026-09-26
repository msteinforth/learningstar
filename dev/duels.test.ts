import { beforeAll, describe, expect, it } from 'vitest'
import { duelOutcome, FamilyDuelStore } from '../src/game/duels.ts'
import { createFamily } from '../src/game/family.ts'
import { missions } from '../src/game/missions.ts'
import { createPlayer } from '../src/game/progress.ts'
import { FamilyPlayerStore } from '../src/game/storage.ts'
import type { Duel } from '../src/game/types.ts'
import { createPgliteBackend, type Rpc } from './pglite-rpc.ts'

const result = (points: number, correct = points) => ({ points, maxPoints: 20, correct, total: 10, finishedAt: '2026-09-26T08:00:00.000Z' })

describe('FamilyDuelStore against the Supabase schema', () => {
  let rpc: Rpc

  beforeAll(async () => {
    rpc = (await createPgliteBackend()).rpc
  })

  async function setup() {
    const family = await createFamily(rpc, 'Duell')
    const players = new FamilyPlayerStore(rpc, family.code)
    const lena = await players.create(createPlayer('Lena', 'horse:bay', '#ff5a5f'))
    const tom = await players.create(createPlayer('Tom', 'horse:grey', '#1cb0f6'))
    const duel: Duel = {
      id: crypto.randomUUID(),
      mission: missions[0],
      seed: 12345,
      challengerId: lena.id,
      opponentId: tom.id,
      createdAt: new Date().toISOString(),
      challengerResult: result(14),
      opponentResult: null,
    }
    return { family, lena, tom, duel, store: new FamilyDuelStore(rpc, family.code) }
  }

  it('lets the challenged child answer once and decides the winner', async () => {
    const { lena, tom, duel, store } = await setup()
    await store.create(duel)
    const [listed] = await store.list()
    expect(listed).toMatchObject({ id: duel.id, seed: 12345, opponentResult: null })
    expect(listed.mission.id).toBe(missions[0].id)

    await expect(store.answer(duel.id, lena.id, result(20))).rejects.toThrow('schon beendet')
    const answered = await store.answer(duel.id, tom.id, result(16))
    expect(duelOutcome(answered)).toEqual({ status: 'done', winnerId: tom.id })
    await expect(store.answer(duel.id, tom.id, result(20))).rejects.toThrow('schon beendet')
  })

  it('refuses duels with children from another family or impossible points', async () => {
    const { duel, store } = await setup()
    const other = await setup()
    await expect(store.create({ ...duel, opponentId: other.tom.id })).rejects.toThrow()
    await expect(store.create({ ...duel, challengerResult: result(500) })).rejects.toThrow()
    await expect(store.create({ ...duel, opponentId: duel.challengerId })).rejects.toThrow()
    expect(await store.list()).toEqual([])
  })
})
