import { beforeAll, describe, expect, it } from 'vitest'
import { FamilyContentStore } from '../src/game/content.ts'
import { createFamily, moveIntoFamily } from '../src/game/family.ts'
import { createPlayer } from '../src/game/progress.ts'
import { buyItem, extrasOf } from '../src/game/rewards.ts'
import { FamilyPlayerStore, LocalPlayerStore } from '../src/game/storage.ts'
import { createPgliteBackend, type Rpc } from './pglite-rpc.ts'

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

describe('profile and PIN of a child on the family server', () => {
  let rpc: Rpc

  beforeAll(async () => {
    rpc = (await createPgliteBackend()).rpc
  })

  it('changes name, horse and colour', async () => {
    const family = await createFamily(rpc, 'Profil')
    const store = new FamilyPlayerStore(rpc, family.code)
    const lena = await store.create(createPlayer('Lena', 'horse:bay', '#ff5a5f'))
    expect(lena.hasPin).toBe(false)

    const updated = await store.updateProfile(lena.id, null, { name: '  Lena M.  ', avatar: 'horse:unicorn', color: '#1cb0f6' })
    expect(updated).toMatchObject({ name: 'Lena M.', avatar: 'horse:unicorn', color: '#1cb0f6', totalPoints: 0 })
    expect((await store.list())[0]).toMatchObject({ avatar: 'horse:unicorn' })
    expect((await store.leaderboard())[0]).toMatchObject({ avatar: 'horse:unicorn', color: '#1cb0f6' })
  })

  it('protects a horse with a PIN that never leaves the server', async () => {
    const family = await createFamily(rpc, 'PIN')
    const store = new FamilyPlayerStore(rpc, family.code)
    const tom = await store.create(createPlayer('Tom', 'horse:grey', '#1cb0f6'))

    const locked = await store.setPin(tom.id, null, '2468')
    expect(locked.hasPin).toBe(true)
    expect(JSON.stringify(await store.list())).not.toMatch(/[0-9a-f]{64}/)

    expect(await store.checkPin(tom.id, '2468')).toBe(true)
    expect(await store.checkPin(tom.id, '1111')).toBe(false)

    // Without the PIN neither the profile nor the PIN itself can be changed.
    await expect(store.updateProfile(tom.id, null, { name: 'Hacker', avatar: 'horse:bay', color: '#000000' })).rejects.toThrow('Die PIN stimmt nicht.')
    await expect(store.updateProfile(tom.id, '1111', { name: 'Hacker', avatar: 'horse:bay', color: '#000000' })).rejects.toThrow('Die PIN stimmt nicht.')
    await expect(store.setPin(tom.id, null, null)).rejects.toThrow('Die PIN stimmt nicht.')
    expect((await store.list())[0].name).toBe('Tom')

    await store.updateProfile(tom.id, '2468', { name: 'Tommy', avatar: 'horse:bay', color: '#000000' })
    const changed = await store.setPin(tom.id, '2468', '1357')
    expect(await store.checkPin(tom.id, '1357')).toBe(true)
    expect(changed.name).toBe('Tommy')

    const removed = await store.setPin(tom.id, '1357', null)
    expect(removed.hasPin).toBe(false)
    expect(await store.checkPin(tom.id, '')).toBe(true)
  })

  it('lets the parents reset a forgotten PIN, but nobody else', async () => {
    const family = await createFamily(rpc, 'Vergessen')
    const store = new FamilyPlayerStore(rpc, family.code)
    const content = new FamilyContentStore(rpc, family.code)
    await content.setPin(null, '9999')
    const mia = await store.create(createPlayer('Mia', 'horse:bay', '#ff5a5f'))
    await store.setPin(mia.id, null, '4321')

    await expect(content.resetPlayerPin('0000', mia.id)).rejects.toThrow('Die PIN stimmt nicht.')
    const other = await createFamily(rpc, 'Fremd')
    const stranger = new FamilyContentStore(rpc, other.code)
    await stranger.setPin(null, '9999')
    await expect(stranger.resetPlayerPin('9999', mia.id)).rejects.toThrow()
    await expect(new FamilyPlayerStore(rpc, other.code).checkPin(mia.id, '4321')).rejects.toThrow()

    await content.resetPlayerPin('9999', mia.id)
    expect((await store.list())[0].hasPin).toBe(false)
  })

  it('keeps the PIN when local players move into a family', async () => {
    const local = new LocalPlayerStore(new MemoryStorage())
    const ben = await local.create(createPlayer('Ben', 'horse:bay', '#ff5a5f'))
    await local.setPin(ben.id, null, '8642')

    const family = await createFamily(rpc, 'Umzug mit PIN')
    await moveIntoFamily(rpc, family, await local.export())
    const store = new FamilyPlayerStore(rpc, family.code)
    expect((await store.list())[0].hasPin).toBe(true)
    expect(await store.checkPin(ben.id, '8642')).toBe(true)
    expect(await store.checkPin(ben.id, '0000')).toBe(false)
  })
})

describe('daily play time on the family server', () => {
  let rpc: Rpc

  beforeAll(async () => {
    rpc = (await createPgliteBackend()).rpc
  })

  it('adds up play time from several devices and starts over on a new day', async () => {
    const family = await createFamily(rpc, 'Zeit')
    const tablet = new FamilyPlayerStore(rpc, family.code)
    const laptop = new FamilyPlayerStore(rpc, family.code)
    const lena = await tablet.create(createPlayer('Lena', 'horse:bay', '#ff5a5f'))

    await tablet.addUsage(lena.id, '2026-09-27', 30)
    expect(await laptop.addUsage(lena.id, '2026-09-27', 30)).toEqual({ day: '2026-09-27', seconds: 60 })
    expect((await laptop.list())[0].usage).toEqual({ day: '2026-09-27', seconds: 60 })
    expect(await tablet.addUsage(lena.id, '2026-09-28', 30)).toEqual({ day: '2026-09-28', seconds: 30 })

    await expect(tablet.addUsage(lena.id, '2026-09-28', 5000)).rejects.toThrow()
    await expect(tablet.addUsage(lena.id, 'morgen', 30)).rejects.toThrow()
    await expect(new FamilyPlayerStore(rpc, (await createFamily(rpc, 'Fremd')).code).addUsage(lena.id, '2026-09-28', 30)).rejects.toThrow()
  })

  it('lets only the parents change the limits and give time back', async () => {
    const family = await createFamily(rpc, 'Eltern-Zeit')
    const content = new FamilyContentStore(rpc, family.code)
    const store = new FamilyPlayerStore(rpc, family.code)
    await content.setPin(null, '2468')
    const tom = await store.create(createPlayer('Tom', 'horse:bay', '#ff5a5f'))

    expect((await content.load()).settings).toEqual({ defaultLimit: 30, limits: {} })
    await expect(content.saveSettings('0000', { defaultLimit: 60, limits: {} })).rejects.toThrow('Die PIN stimmt nicht.')
    await content.saveSettings('2468', { defaultLimit: 45, limits: { [tom.id]: null } })
    expect((await content.load()).settings).toEqual({ defaultLimit: 45, limits: { [tom.id]: null } })

    await store.addUsage(tom.id, '2026-09-27', 120)
    await expect(content.resetUsage('0000', tom.id)).rejects.toThrow('Die PIN stimmt nicht.')
    await content.resetUsage('2468', tom.id)
    expect((await store.list())[0].usage).toEqual({})
  })
})

describe('presents on the family server', () => {
  let rpc: Rpc

  beforeAll(async () => {
    rpc = (await createPgliteBackend()).rpc
  })

  it('moves an item between siblings in one step', async () => {
    const family = await createFamily(rpc, 'Geschenke')
    const store = new FamilyPlayerStore(rpc, family.code)
    const lena = await store.create({ ...createPlayer('Lena', 'horse:bay', '#ff5a5f'), totalPoints: 100 })
    const tom = await store.create(createPlayer('Tom', 'horse:grey', '#1cb0f6'))
    await store.updateExtras(lena.id, (current) => buyItem(current, 'hat-bow'))

    const { from, to } = await store.giveItem(lena.id, tom.id, 'hat-bow')
    expect(extrasOf(from).owned).toEqual([])
    expect(extrasOf(from).equipped).toEqual({})
    expect(extrasOf(from).spent).toBe(20)
    expect(extrasOf(from).giftsGiven).toBe(1)
    expect(extrasOf(to).owned).toEqual(['hat-bow'])
    expect(extrasOf(to).gifts).toEqual([expect.objectContaining({ itemId: 'hat-bow', fromId: lena.id, fromName: 'Lena' })])

    // Not twice, not without owning it, not across families.
    await expect(store.giveItem(lena.id, tom.id, 'hat-bow')).rejects.toThrow('Diesen Artikel hast du nicht (mehr).')
    await expect(store.giveItem(tom.id, lena.id, 'hat-cap')).rejects.toThrow('Diesen Artikel hast du nicht (mehr).')
    const other = new FamilyPlayerStore(rpc, (await createFamily(rpc, 'Fremd')).code)
    await expect(other.giveItem(tom.id, lena.id, 'hat-bow')).rejects.toThrow()
    const stranger = await other.create(createPlayer('Fremd', 'horse:bay', '#ff5a5f'))
    await expect(store.giveItem(tom.id, stranger.id, 'hat-bow')).rejects.toThrow()
  })

  it('refuses a present the sibling already has', async () => {
    const family = await createFamily(rpc, 'Doppelt')
    const store = new FamilyPlayerStore(rpc, family.code)
    const lena = await store.create({ ...createPlayer('Lena', 'horse:bay', '#ff5a5f'), totalPoints: 100 })
    const tom = await store.create({ ...createPlayer('Tom', 'horse:grey', '#1cb0f6'), totalPoints: 100 })
    await store.updateExtras(lena.id, (current) => buyItem(current, 'hat-bow'))
    await store.updateExtras(tom.id, (current) => buyItem(current, 'hat-bow'))
    await expect(store.giveItem(lena.id, tom.id, 'hat-bow')).rejects.toThrow('Das hat dein Geschwisterkind schon.')
  })
})
