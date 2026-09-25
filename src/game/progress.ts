import { awardBadges, extrasOf, nextStreak } from './rewards'
import { isPassed, rosettesFor } from './scoring'
import type { Mission, MissionResult, Player, TaskResult } from './types'

export function isUnlocked(mission: Mission, player: Player): boolean {
  return !mission.requires || player.missions[mission.requires]?.passed === true
}

export function summarize(mission: Mission, results: TaskResult[], maxPoints: number): MissionResult {
  const points = results.reduce((sum, result) => sum + result.points, 0)
  return {
    missionId: mission.id,
    points,
    maxPoints,
    rosettes: rosettesFor(points, maxPoints),
    passed: isPassed(points, maxPoints, mission.passRatio),
    results,
  }
}

/** Returns the updated player; the input is not modified. */
export function applyResult(player: Player, result: MissionResult, now = new Date()): Player {
  const previous = player.missions[result.missionId]
  const mistakes = { ...player.mistakes }
  for (const task of result.results) {
    if (!task.correct) {
      mistakes[task.key] = (mistakes[task.key] ?? 0) + 1
    } else if (mistakes[task.key]) {
      // A correct answer slowly makes the item "less tricky" again.
      mistakes[task.key] -= 1
      if (mistakes[task.key] <= 0) delete mistakes[task.key]
    }
  }
  const extras = extrasOf(player)
  const updated: Player = {
    ...player,
    extras: { ...extras, streak: nextStreak(extras.streak, now) },
    totalPoints: player.totalPoints + result.points,
    mistakes,
    missions: {
      ...player.missions,
      [result.missionId]: {
        bestPoints: Math.max(previous?.bestPoints ?? 0, result.points),
        maxPoints: result.maxPoints,
        bestRosettes: Math.max(previous?.bestRosettes ?? 0, result.rosettes),
        passed: (previous?.passed ?? false) || result.passed,
        plays: (previous?.plays ?? 0) + 1,
        lastPlayedAt: now.toISOString(),
      },
    },
  }
  return awardBadges(updated, now)
}

export function createPlayer(name: string, avatar: string, color: string, now = new Date()): Player {
  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    avatar,
    color,
    createdAt: now.toISOString(),
    totalPoints: 0,
    missions: {},
    mistakes: {},
  }
}
