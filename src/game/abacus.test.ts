import { describe, expect, it } from 'vitest'
import { moveBead } from './abacus'

describe('counting frame', () => {
  it('pushes a bead and everything to its right over to the right', () => {
    // All 10 on the left; tapping the 8th bead (index 7) moves beads 8–10 → 7 stay left.
    expect(moveBead(10, 7)).toBe(7)
    expect(moveBead(10, 0)).toBe(0)
  })

  it('pulls a bead and everything to its left back to the left', () => {
    // 7 on the left; tapping the 9th bead (on the right) brings beads 8 and 9 back.
    expect(moveBead(7, 8)).toBe(9)
    expect(moveBead(0, 9)).toBe(10)
  })
})
