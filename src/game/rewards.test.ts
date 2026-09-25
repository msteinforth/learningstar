import { describe, expect, it } from 'vitest'
import { missions } from './missions'
import { applyResult, createPlayer, summarize } from './progress'
import { BADGES, buyItem, canBuy, dayKey, equipItem, extrasOf, findItem, newBadges, nextStreak, SHOP_ITEMS, walletOf } from './rewards'
import type { Player } from './types'

const withPoints = (points: number, extras: Partial<Player['extras']> = {}): Player => ({
  ...createPlayer('Lena', '🐴', '#ff5a5f'),
  totalPoints: points,
  extras: { ...extrasOf({}), ...extras },
})

describe('streak', () => {
  it('counts consecutive days and restarts after a gap', () => {
    const monday = new Date(2026, 8, 21, 18)
    let streak = nextStreak({ days: 0, lastDay: null }, monday)
    expect(streak).toEqual({ days: 1, lastDay: '2026-09-21' })
    streak = nextStreak(streak, new Date(2026, 8, 21, 20))
    expect(streak.days).toBe(1)
    streak = nextStreak(streak, new Date(2026, 8, 22, 7))
    expect(streak.days).toBe(2)
    streak = nextStreak(streak, new Date(2026, 8, 25, 7))
    expect(streak).toEqual({ days: 1, lastDay: '2026-09-25' })
  })

  it('handles month boundaries', () => {
    const streak = nextStreak({ days: 4, lastDay: '2026-09-30' }, new Date(2026, 9, 1, 9))
    expect(streak.days).toBe(5)
    expect(dayKey(new Date(2026, 9, 1))).toBe('2026-10-01')
  })
})

describe('badges', () => {
  it('have unique ids and reachable targets', () => {
    expect(new Set(BADGES.map((badge) => badge.id)).size).toBe(BADGES.length)
    for (const item of SHOP_ITEMS) {
      if (item.requiresBadge) expect(BADGES.map((badge) => badge.id)).toContain(item.requiresBadge)
    }
  })

  it('are awarded after a mission and reported once', () => {
    const mission = missions[0]
    const before = createPlayer('Lena', '🐴', '#ff5a5f')
    const perfect = summarize(mission, [{ key: 'a', correct: true, points: 3 }], 3)
    const after = applyResult(before, perfect, new Date(2026, 8, 25))
    expect(newBadges(before, after).map((badge) => badge.id)).toEqual(['erster-ritt', 'erste-schleife', 'fehlerfrei'])

    const again = applyResult(after, perfect, new Date(2026, 8, 25))
    expect(newBadges(after, again)).toEqual([])
    expect(extrasOf(again).streak.days).toBe(1)
  })
})

describe('shop', () => {
  it('spends from the wallet without touching the collected total', () => {
    const player = buyItem(withPoints(50), 'hat-bow')
    expect(player.totalPoints).toBe(50)
    expect(walletOf(player)).toBe(30)
    expect(extrasOf(player)).toMatchObject({ spent: 20, owned: ['hat-bow'], equipped: { hat: 'hat-bow' } })
  })

  it('refuses items that are too expensive, owned or locked', () => {
    expect(canBuy(withPoints(10), findItem('hat-bow')!)).toEqual({ ok: false, reason: 'too-expensive' })
    expect(canBuy(buyItem(withPoints(100), 'hat-bow'), findItem('hat-bow')!)).toEqual({ ok: false, reason: 'owned' })
    expect(canBuy(withPoints(1000), findItem('hat-crown')!)).toEqual({ ok: false, reason: 'locked' })
    expect(canBuy(withPoints(1000, { badges: { 'gold-sammler': '2026-09-25' } }), findItem('hat-crown')!)).toEqual({ ok: true })
    expect(() => buyItem(withPoints(10), 'hat-bow')).toThrow()
  })

  it('equips only owned items and can take them off', () => {
    const player = buyItem(buyItem(withPoints(100), 'hat-bow'), 'hat-cap')
    expect(extrasOf(player).equipped.hat).toBe('hat-cap')
    expect(extrasOf(equipItem(player, 'hat', 'hat-bow')).equipped.hat).toBe('hat-bow')
    expect(extrasOf(equipItem(player, 'hat', null)).equipped.hat).toBeUndefined()
    expect(() => equipItem(player, 'hat', 'hat-crown')).toThrow()
    expect(() => equipItem(player, 'buddy', 'hat-bow')).toThrow()
  })
})
