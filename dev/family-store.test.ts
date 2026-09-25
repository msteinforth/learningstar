import { beforeAll, describe, expect, it } from 'vitest'
import { BackendError } from '../src/game/backend.ts'
import { createFamily, joinFamily, moveIntoFamily } from '../src/game/family.ts'
import { missions } from '../src/game/missions.ts'
import { createPlayer, summarize } from '../src/game/progress.ts'
import { FamilyPlayerStore } from '../src/game/storage.ts'
import { createPgliteBackend, type Rpc } from './pglite-rpc.ts'

describe('FamilyPlayerStore against the Supabase schema', () => {
  let rpc: Rpc

  beforeAll(async () => {
    rpc = (await createPgliteBackend()).rpc
  })

  it('shares players and points between two devices', async () => {
    const family = await createFamily(rpc, 'Familie Muster')
    const tablet = new FamilyPlayerStore(rpc, family.code)
    const joined = await joinFamily(rpc, family.code.toLowerCase())
    const laptop = new FamilyPlayerStore(rpc, joined.code)

    const lena = await tablet.create(createPlayer('Lena', '🐴', '#c0703a'))
    expect((await laptop.list()).map((player) => player.name)).toEqual(['Lena'])

    const mission = missions[0]
    const result = summarize(mission, [
      { key: '1x1:2x2', correct: true, points: 2 },
      { key: '1x1:3x2', correct: false, points: 0 },
    ], 4)
    // The same child plays on both devices; no points get lost.
    await tablet.recordResult(lena.id, result)
    const afterLaptop = await laptop.recordResult(lena.id, result)

    expect(afterLaptop.totalPoints).toBe(4)
    expect(afterLaptop.missions[mission.id]).toMatchObject({ bestPoints: 2, plays: 2 })
    expect(afterLaptop.mistakes).toEqual({ '1x1:3x2': 2 })

    const board = await tablet.leaderboard()
    expect(board).toEqual([expect.objectContaining({ name: 'Lena', weekPoints: 4, totalPoints: 4 })])
  })

  it('moves local players into a family with their points', async () => {
    const family = await createFamily(rpc, 'Umzug')
    const local = { ...createPlayer('Tom', '🦄', '#5b7fb5'), totalPoints: 37 }
    await moveIntoFamily(rpc, family, [local])
    const [tom] = await new FamilyPlayerStore(rpc, family.code).list()
    expect(tom).toMatchObject({ id: local.id, name: 'Tom', totalPoints: 37 })
  })

  it('reports unknown codes and connection problems in German', async () => {
    await expect(joinFamily(rpc, 'AAAA-AAAA')).rejects.toThrow('Diesen Familien-Code gibt es nicht')
    const offline: Rpc = () => Promise.reject(new TypeError('Failed to fetch'))
    const error = await new FamilyPlayerStore(offline, 'AAAAAAAA').list().catch((caught) => caught)
    expect(error).toBeInstanceOf(BackendError)
    expect(error.message).toMatch(/nicht erreichbar/)
  })
})
