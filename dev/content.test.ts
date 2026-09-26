import { beforeAll, describe, expect, it } from 'vitest'
import { buildMission, emptyDraft } from '../src/game/custom.ts'
import { createFamily } from '../src/game/family.ts'
import { FamilyContentStore, WrongPinError } from '../src/game/content.ts'
import { FamilyDuelStore } from '../src/game/duels.ts'
import { missions } from '../src/game/missions.ts'
import { createPlayer, summarize } from '../src/game/progress.ts'
import { FamilyPlayerStore } from '../src/game/storage.ts'
import { createPgliteBackend, type Rpc } from './pglite-rpc.ts'

describe('FamilyContentStore against the Supabase schema', () => {
  let rpc: Rpc

  beforeAll(async () => {
    rpc = (await createPgliteBackend()).rpc
  })

  const mission = () => buildMission({ ...emptyDraft('english'), title: 'Woche 12', text: 'the saddle = der Sattel\nthe hay = das Heu' })

  it('sets a PIN once and shares own missions with every device', async () => {
    const family = await createFamily(rpc, 'Eltern')
    const tablet = new FamilyContentStore(rpc, family.code)
    const laptop = new FamilyContentStore(rpc, family.code)

    expect(await tablet.load()).toEqual({ hasPin: false, missions: [] })
    await expect(tablet.saveMissions('1234', [mission()])).rejects.toBeInstanceOf(WrongPinError)

    await tablet.setPin(null, '1234')
    expect(await laptop.checkPin('1234')).toBe(true)
    expect(await laptop.checkPin('0000')).toBe(false)

    const saved = await tablet.saveMissions('1234', [mission()])
    expect(saved).toHaveLength(1)
    expect((await laptop.load()).missions[0]).toMatchObject({ title: 'Woche 12', custom: true, track: 'english' })
  })

  it('protects the PIN and the missions', async () => {
    const family = await createFamily(rpc, 'Geschützt')
    const store = new FamilyContentStore(rpc, family.code)
    await store.setPin(null, '1234')

    await expect(store.setPin(null, '9999')).rejects.toBeInstanceOf(WrongPinError)
    await expect(store.setPin('0000', '9999')).rejects.toBeInstanceOf(WrongPinError)
    await expect(store.saveMissions('0000', [])).rejects.toBeInstanceOf(WrongPinError)

    await store.setPin('1234', '5678')
    expect(await store.checkPin('5678')).toBe(true)
    expect(await store.checkPin('1234')).toBe(false)
  })

  it('never reveals the PIN hash', async () => {
    const family = await createFamily(rpc, 'Geheim')
    await new FamilyContentStore(rpc, family.code).setPin(null, '4321')
    const { data } = await rpc('get_family_content', { p_code: family.code })
    expect(JSON.stringify(data)).not.toMatch(/[0-9a-f]{64}/)
  })

  it('deletes a child with points and duels, but only with the parents\' PIN', async () => {
    const family = await createFamily(rpc, 'Löschen')
    const content = new FamilyContentStore(rpc, family.code)
    const players = new FamilyPlayerStore(rpc, family.code)
    const duels = new FamilyDuelStore(rpc, family.code)
    await content.setPin(null, '1357')
    const lena = await players.create(createPlayer('Lena', 'horse:bay', '#ff5a5f'))
    const tom = await players.create(createPlayer('Tom', 'horse:grey', '#1cb0f6'))
    await players.recordResult(tom.id, summarize(missions[0], [{ key: 'a', correct: true, points: 3 }], 3))
    const result = { points: 3, maxPoints: 3, correct: 1, total: 1, finishedAt: new Date().toISOString() }
    await duels.create({ id: crypto.randomUUID(), mission: missions[0], seed: 1, challengerId: lena.id, opponentId: tom.id, createdAt: new Date().toISOString(), challengerResult: result, opponentResult: null })

    await expect(content.deletePlayer('0000', tom.id)).rejects.toBeInstanceOf(WrongPinError)
    const other = await createFamily(rpc, 'Fremd')
    const stranger = new FamilyContentStore(rpc, other.code)
    await stranger.setPin(null, '1357')
    await expect(stranger.deletePlayer('1357', tom.id)).rejects.toThrow()
    expect(await players.list()).toHaveLength(2)

    await content.deletePlayer('1357', tom.id)
    expect((await players.list()).map((player) => player.name)).toEqual(['Lena'])
    expect(await duels.list()).toEqual([])
    expect((await players.leaderboard()).map((entry) => entry.name)).toEqual(['Lena'])
  })
})
