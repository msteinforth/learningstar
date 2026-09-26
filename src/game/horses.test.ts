import { describe, expect, it } from 'vitest'
import { AVATARS } from './avatars'
import { horseFor } from './horses'

describe('horseFor', () => {
  it('finds an illustration for every avatar choice', () => {
    for (const avatar of AVATARS) {
      expect(horseFor(avatar)).toBeDefined()
      // Must fit the avatar column of the family database.
      expect(avatar.length).toBeLessThanOrEqual(16)
    }
  })

  it('maps emojis from older profiles to horses', () => {
    expect(horseFor('🦄')?.id).toBe('unicorn')
    expect(horseFor('🐴')?.id).toBe('bay')
    expect(horseFor('🐶').id).toBe('bay')
  })
})
