import { beforeAll, describe, expect, it } from 'vitest'
import { buildMission, emptyDraft } from '../src/game/custom.ts'
import { createFamily } from '../src/game/family.ts'
import { FamilyContentStore, WrongPinError } from '../src/game/content.ts'
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
})
