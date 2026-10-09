import type { Player } from './types'

export type WorldId = 'farm' | 'space' | 'halloween' | 'racetrack'

export interface World {
  id: WorldId
  name: string
  description: string
  /** Small preview for the picker (CSS background). */
  preview: string
}

export const WORLDS: World[] = [
  { id: 'farm', name: 'Reiterhof', description: 'Grüne Koppel, Sonne und Wolken', preview: 'linear-gradient(180deg, #4cc3ff 0 55%, #74cc4f 55%)' },
  { id: 'space', name: 'Weltraum', description: 'Sterne, Planeten und Mondkrater', preview: 'radial-gradient(circle at 70% 30%, #ff9fd0 0 9px, transparent 10px), linear-gradient(180deg, #0b0624 0 60%, #7a73a8 60%)' },
  { id: 'halloween', name: 'Halloween', description: 'Vollmond, Fledermäuse und Kürbisse', preview: 'radial-gradient(circle at 70% 30%, #fff2c4 0 9px, transparent 10px), linear-gradient(180deg, #2b0f3a, #ff8a3d 60%, #2a1538 60%)' },
  { id: 'racetrack', name: 'Rennbahn', description: 'Tribüne, Fähnchen und Zielpfosten', preview: 'linear-gradient(180deg, #39a9ff 0 45%, #4fb83a 45% 70%, #ffffff 70% 74%, #d9a066 74%)' },
]

export const DEFAULT_WORLD: WorldId = 'farm'

export const isWorldId = (value: unknown): value is WorldId => WORLDS.some((world) => world.id === value)

export function worldOf(player: { extras?: Partial<NonNullable<Player['extras']>> } | undefined): WorldId {
  const world = player?.extras?.world
  return isWorldId(world) ? world : DEFAULT_WORLD
}

// --- The world shown right now (shared by the scenery and the app) ----------------------

const STORAGE_KEY = 'learningstar.world'
const listeners = new Set<() => void>()

function readStored(): WorldId {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return isWorldId(stored) ? stored : DEFAULT_WORLD
  } catch {
    return DEFAULT_WORLD
  }
}

let current: WorldId = typeof window === 'undefined' ? DEFAULT_WORLD : readStored()
if (typeof document !== 'undefined') document.documentElement.dataset.world = current

export const currentWorld = () => current

/** Switches the backdrop; the device remembers it for the stall before a child is chosen. */
export function showWorld(world: WorldId): void {
  if (world === current) return
  current = world
  document.documentElement.dataset.world = world
  try {
    localStorage.setItem(STORAGE_KEY, world)
  } catch {
    // Only a convenience.
  }
  listeners.forEach((listener) => listener())
}

export function subscribeWorld(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
