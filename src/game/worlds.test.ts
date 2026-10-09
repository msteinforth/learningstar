import { describe, expect, it } from 'vitest'
import { isWorldId, WORLDS, worldOf } from './worlds'

describe('worlds', () => {
  it('offers the farm, space, halloween and the racetrack', () => {
    expect(WORLDS.map((world) => world.id)).toEqual(['farm', 'space', 'halloween', 'racetrack'])
  })

  it('falls back to the farm for children without (or with an unknown) world', () => {
    expect(worldOf(undefined)).toBe('farm')
    expect(worldOf({ extras: {} })).toBe('farm')
    expect(worldOf({ extras: { world: 'mars' } })).toBe('farm')
    expect(worldOf({ extras: { world: 'halloween' } })).toBe('halloween')
    expect(isWorldId('space')).toBe(true)
  })
})
