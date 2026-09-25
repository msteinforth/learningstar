export type Rng = () => number

/** Small seeded PRNG (mulberry32) so a mission can be replayed with the same tasks. */
export function createRng(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function randomInt(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1))
}

export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/**
 * Picks `count` items, preferring items with a higher weight. Items are
 * repeated only when there are fewer items than requested.
 */
export function weightedPick<T>(items: readonly T[], count: number, weight: (item: T) => number, rng: Rng): T[] {
  const picked: T[] = []
  while (picked.length < count && items.length > 0) {
    const pool = shuffle(items, rng)
    const keyed = pool.map((item) => ({ item, score: rng() * weight(item) }))
    keyed.sort((x, y) => y.score - x.score)
    for (const { item } of keyed) {
      if (picked.length >= count) break
      picked.push(item)
    }
  }
  return picked
}
