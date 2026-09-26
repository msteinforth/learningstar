import { describe, expect, it } from 'vitest'
import { describeMistake } from '../../game/custom'
import { tracks } from '../../game/missions'
import { BADGES, SHOP_ITEMS, SLOTS } from '../../game/rewards'
import { quizBanks } from '../../game/tasks'
import { isIconName } from '.'

describe('own icon set', () => {
  it('has a drawing for every icon the game data uses', () => {
    const names = [
      ...tracks.map((track) => track.icon),
      ...BADGES.map((badge) => badge.icon),
      ...SHOP_ITEMS.filter((item) => item.slot !== 'background').map((item) => item.look),
      ...SLOTS.map((slot) => slot.icon),
      ...Object.values(quizBanks).flatMap((bank) => bank.questions.filter((q) => q.prompt.startsWith('img:')).map((q) => q.prompt.slice(4))),
    ]
    expect(names.filter((name) => !isIconName(name))).toEqual([])
  })

  it('names picture questions by their answer in the mistake list', () => {
    expect(describeMistake('quiz:rechtschreibung:img:bike')).toBe('Fahrrad (Deutsch)')
  })
})
