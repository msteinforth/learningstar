import { describe, expect, it } from 'vitest'
import { isCorrectAnswer } from './answers'
import { findMission, missions, tracks } from './missions'
import { applyResult, createPlayer, isUnlocked, summarize } from './progress'
import { createRng } from './random'
import { isPassed, maxTaskPoints, rosettesFor, taskPoints } from './scoring'
import { generateTasks, multiplicationBasePoints, quizBanks, vocabularyLists } from './tasks'

describe('taskPoints', () => {
  it('gives the base points plus a speed bonus, capped at 3', () => {
    expect(taskPoints(1, 1, 10_000)).toBe(1)
    expect(taskPoints(1, 1, 2_000)).toBe(2)
    expect(taskPoints(3, 1, 2_000)).toBe(3)
  })

  it('knows the best reachable points per task', () => {
    expect(maxTaskPoints(1)).toBe(2)
    expect(maxTaskPoints(3)).toBe(3)
  })

  it('gives one point for a correct second attempt', () => {
    expect(taskPoints(3, 2, 1_000)).toBe(1)
  })
})

describe('rosettes and passing', () => {
  it('awards 0–3 rosettes by share of the maximum', () => {
    expect(rosettesFor(5, 30)).toBe(0)
    expect(rosettesFor(18, 30)).toBe(1)
    expect(rosettesFor(24, 30)).toBe(2)
    expect(rosettesFor(29, 30)).toBe(3)
  })

  it('passes at 60 % by default', () => {
    expect(isPassed(17, 30)).toBe(false)
    expect(isPassed(18, 30)).toBe(true)
    expect(isPassed(20, 30, 0.7)).toBe(false)
  })
})

describe('isCorrectAnswer', () => {
  it('ignores case, spaces and articles', () => {
    expect(isCorrectAnswer('  Pferd ', 'das Pferd')).toBe(true)
    expect(isCorrectAnswer('das pferd', 'das Pferd')).toBe(true)
    expect(isCorrectAnswer('ride', 'to ride')).toBe(true)
  })

  it('accepts umlaut spellings and alternatives', () => {
    expect(isCorrectAnswer('Maehne', 'die Mähne')).toBe(true)
    expect(isCorrectAnswer('Möhre', 'die Karotte', ['die Möhre'])).toBe(true)
  })

  it('accepts French and Spanish answers without accents or articles', () => {
    expect(isCorrectAnswer('ecurie', "l'écurie")).toBe(true)
    expect(isCorrectAnswer('Cheval', 'le cheval')).toBe(true)
    expect(isCorrectAnswer('adios', 'adiós')).toBe(true)
    expect(isCorrectAnswer('el prado', 'el prado')).toBe(true)
    expect(isCorrectAnswer('Que tal?', '¿qué tal?')).toBe(true)
    expect(isCorrectAnswer('cheval', 'le poney')).toBe(false)
  })

  it('rejects wrong or empty answers', () => {
    expect(isCorrectAnswer('Kuh', 'das Pferd')).toBe(false)
    expect(isCorrectAnswer('', 'das Pferd')).toBe(false)
  })
})

describe('multiplication difficulty', () => {
  it('rates easy, medium and hard pairs', () => {
    expect(multiplicationBasePoints(2, 5)).toBe(1)
    expect(multiplicationBasePoints(7, 10)).toBe(1)
    expect(multiplicationBasePoints(3, 4)).toBe(2)
    expect(multiplicationBasePoints(7, 8)).toBe(3)
  })
})

describe('generateTasks', () => {
  it('creates valid tasks for every mission', () => {
    for (const mission of missions) {
      const tasks = generateTasks(mission, createRng(42))
      expect(tasks).toHaveLength(mission.config.count)
      for (const task of tasks) {
        expect(task.basePoints).toBeGreaterThanOrEqual(1)
        expect(task.basePoints).toBeLessThanOrEqual(3)
        if (task.mode === 'choice') {
          expect(task.choices).toContain(task.answer)
          expect(new Set(task.choices).size).toBe(task.choices.length)
        }
      }
    }
  })

  it('produces multiplication answers that match the prompt', () => {
    const mission = missions.find((candidate) => candidate.type === 'multiplication')!
    for (const task of generateTasks(mission, createRng(1))) {
      const [a, b] = task.prompt.split(' × ').map(Number)
      expect(task.answer).toBe(String(a * b))
    }
  })

  it('is deterministic for the same seed', () => {
    const mission = missions[0]
    expect(generateTasks(mission, createRng(7))).toEqual(generateTasks(mission, createRng(7)))
  })

  it('asks previously wrong items more often', () => {
    const mission = missions.find((candidate) => candidate.id === '1x1-reihe-6-7')!
    const mistakes = { '1x1:8x7': 5 }
    let hits = 0
    for (let seed = 0; seed < 200; seed++) {
      if (generateTasks(mission, createRng(seed), mistakes).some((task) => task.key === '1x1:8x7')) hits++
    }
    // Without weighting the chance is 10/20 = 50 %.
    expect(hits / 200).toBeGreaterThan(0.75)
  })
})

describe('mission data', () => {
  it('references existing missions, tournaments, vocabulary lists and quiz banks', () => {
    const ids = new Set(missions.map((mission) => mission.id))
    expect(ids.size).toBe(missions.length)
    for (const mission of missions) {
      expect(tracks.map((track) => track.id)).toContain(mission.track)
      if (mission.requires) expect(findMission(mission.requires)?.track).toBe(mission.track)
      if (mission.type === 'vocabulary') expect(vocabularyLists[mission.config.list]).toBeDefined()
      if (mission.type === 'quiz') expect(quizBanks[mission.config.bank]).toBeDefined()
    }
  })

  it('has one open start mission and several missions per tournament', () => {
    for (const track of tracks) {
      const trackMissions = missions.filter((mission) => mission.track === track.id)
      expect(trackMissions.length).toBeGreaterThanOrEqual(4)
      expect(trackMissions.filter((mission) => !mission.requires)).toHaveLength(1)
    }
  })

  it('keeps quiz answers among their options', () => {
    for (const bank of Object.values(quizBanks)) {
      for (const question of bank.questions) {
        if (question.options) expect(question.options).toContain(question.answer)
        if (question.options) expect(new Set(question.options).size).toBe(question.options.length)
      }
    }
  })

  it('asks German grammar with der/die/das in fixed order', () => {
    const mission = findMission('de-artikel')!
    for (const task of generateTasks(mission, createRng(3))) {
      expect(task.choices).toEqual(['der', 'die', 'das'])
      expect(task.hint).toBe('Welcher Artikel passt?')
    }
  })

  it('names the target language in vocabulary hints', () => {
    const [task] = generateTasks(findMission('fr-couleurs')!, createRng(1))
    expect(task.hint).toBe('Was heißt das auf Französisch?')
    const [spanish] = generateTasks(findMission('es-cuadra')!, createRng(1))
    expect(spanish.hint).toBe('Was heißt das auf Deutsch?')
  })
})

describe('player progress', () => {
  const mission = missions[0]
  const next = missions.find((candidate) => candidate.requires === mission.id)!

  it('stores points, best result and unlocks the next mission', () => {
    const player = createPlayer('Lena', '🐴', '#c0703a')
    expect(isUnlocked(next, player)).toBe(false)

    const result = summarize(mission, [
      { key: 'a', correct: true, points: 3 },
      { key: 'b', correct: false, points: 0 },
    ], 6)
    const updated = applyResult(player, result)

    expect(updated.totalPoints).toBe(3)
    expect(updated.missions[mission.id]).toMatchObject({ bestPoints: 3, passed: false, plays: 1 })
    expect(updated.mistakes).toEqual({ b: 1 })
    expect(player.totalPoints).toBe(0)

    const better = applyResult(updated, summarize(mission, [
      { key: 'a', correct: true, points: 3 },
      { key: 'b', correct: true, points: 2 },
    ], 6))
    expect(better.totalPoints).toBe(8)
    expect(better.missions[mission.id]).toMatchObject({ bestPoints: 5, passed: true, plays: 2 })
    expect(better.mistakes).toEqual({})
    expect(isUnlocked(next, better)).toBe(true)
  })
})
