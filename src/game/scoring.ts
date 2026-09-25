export const MAX_TASK_POINTS = 3
/** Answers faster than this earn one bonus point (capped at MAX_TASK_POINTS). */
export const FAST_ANSWER_MS = 6000
export const DEFAULT_PASS_RATIO = 0.6

/** Rosette thresholds as share of the maximum points: 1, 2 or 3 rosettes. */
const ROSETTE_THRESHOLDS = [0.6, 0.8, 0.95]

export function taskPoints(basePoints: number, attempt: number, elapsedMs: number): number {
  if (attempt > 1) return 1
  const bonus = elapsedMs < FAST_ANSWER_MS ? 1 : 0
  return Math.min(MAX_TASK_POINTS, basePoints + bonus)
}

/** Best possible points for a task: base points plus the speed bonus. */
export function maxTaskPoints(basePoints: number): number {
  return Math.min(MAX_TASK_POINTS, basePoints + 1)
}

export function rosettesFor(points: number, maxPoints: number): number {
  if (maxPoints <= 0) return 0
  const ratio = points / maxPoints
  return ROSETTE_THRESHOLDS.filter((threshold) => ratio >= threshold).length
}

export function isPassed(points: number, maxPoints: number, passRatio = DEFAULT_PASS_RATIO): boolean {
  return maxPoints > 0 && points / maxPoints >= passRatio
}
