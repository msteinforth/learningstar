import { describe, expect, it } from 'vitest'
import { addUsage, DEFAULT_SETTINGS, limitFor, sanitizeSettings, secondsLeft, secondsToday, today } from './limits'

describe('daily play time', () => {
  it('uses the default or the own value of a child', () => {
    const settings = { defaultLimit: 30, limits: { lena: 45, tom: null } }
    expect(limitFor(settings, 'mia')).toBe(30)
    expect(limitFor(settings, 'lena')).toBe(45)
    expect(limitFor(settings, 'tom')).toBeNull()
  })

  it('counts only today and starts over on a new day', () => {
    const usage = addUsage(addUsage(undefined, '2026-09-27', 30), '2026-09-27', 30)
    expect(usage).toEqual({ day: '2026-09-27', seconds: 60 })
    expect(addUsage(usage, '2026-09-28', 30)).toEqual({ day: '2026-09-28', seconds: 30 })
    expect(secondsToday({ usage }, '2026-09-27')).toBe(60)
    expect(secondsToday({ usage }, '2026-09-28')).toBe(0)
  })

  it('knows how much time is left', () => {
    const settings = { defaultLimit: 1, limits: { free: null } }
    const player = { id: 'lena', usage: { day: '2026-09-27', seconds: 30 } }
    expect(secondsLeft(settings, player, '2026-09-27')).toBe(30)
    expect(secondsLeft(settings, { ...player, usage: { day: '2026-09-27', seconds: 90 } }, '2026-09-27')).toBe(0)
    expect(secondsLeft(settings, { ...player, id: 'free' }, '2026-09-27')).toBeNull()
  })

  it('reads settings defensively', () => {
    expect(sanitizeSettings(undefined)).toEqual(DEFAULT_SETTINGS)
    expect(sanitizeSettings({})).toEqual(DEFAULT_SETTINGS)
    expect(sanitizeSettings({ defaultLimit: null })).toEqual({ defaultLimit: null, limits: {} })
    expect(sanitizeSettings({ defaultLimit: -5, limits: { a: 20, b: 'x', c: null, d: 99999 } })).toEqual({ defaultLimit: 30, limits: { a: 20, c: null } })
  })

  it('formats the local day', () => {
    expect(today(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05')
  })
})
