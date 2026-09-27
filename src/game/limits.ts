import type { Player } from './types'

/** Daily play time the parents allow, in minutes; null means no limit. */
export type Limit = number | null

export interface FamilySettings {
  /** Applies to every child without an own value. */
  defaultLimit: Limit
  /** Player id → own limit (null = no limit). Missing = the default applies. */
  limits: Record<string, Limit>
}

export interface PlayerUsage {
  /** Local calendar day, e.g. "2026-09-27". */
  day: string
  seconds: number
}

export const DEFAULT_SETTINGS: FamilySettings = { defaultLimit: 30, limits: {} }

export const LIMIT_OPTIONS = [10, 15, 20, 30, 45, 60, 90, 120]

/** Seconds added per heartbeat while a child plays. */
export const HEARTBEAT_SECONDS = 30

/** Today's date in local time as YYYY-MM-DD. */
export function today(now: Date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

const isLimit = (value: unknown): value is Limit => value === null || (typeof value === 'number' && Number.isInteger(value) && value > 0 && value <= 24 * 60)

/** Settings from storage or the server; anything unknown falls back to the defaults. */
export function sanitizeSettings(value: unknown): FamilySettings {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { ...DEFAULT_SETTINGS, limits: {} }
  const raw = value as { defaultLimit?: unknown; limits?: unknown }
  const limits: Record<string, Limit> = {}
  if (raw.limits && typeof raw.limits === 'object' && !Array.isArray(raw.limits)) {
    for (const [id, limit] of Object.entries(raw.limits)) if (isLimit(limit)) limits[id] = limit
  }
  return { defaultLimit: 'defaultLimit' in raw && isLimit(raw.defaultLimit) ? raw.defaultLimit : DEFAULT_SETTINGS.defaultLimit, limits }
}

export function limitFor(settings: FamilySettings, playerId: string): Limit {
  return playerId in settings.limits ? settings.limits[playerId] : settings.defaultLimit
}

/** Seconds played today (usage from an earlier day counts as 0). */
export function secondsToday(player: Pick<Player, 'usage'>, day: string = today()): number {
  return player.usage?.day === day ? player.usage.seconds : 0
}

/** Seconds left today, or null without a limit. */
export function secondsLeft(settings: FamilySettings, player: Pick<Player, 'id' | 'usage'>, day: string = today()): number | null {
  const limit = limitFor(settings, player.id)
  return limit === null ? null : Math.max(0, limit * 60 - secondsToday(player, day))
}

/** Adds play time, starting over on a new day. */
export function addUsage(usage: PlayerUsage | undefined, day: string, seconds: number): PlayerUsage {
  return { day, seconds: (usage?.day === day ? usage.seconds : 0) + seconds }
}

export function formatMinutes(seconds: number): string {
  return `${Math.ceil(seconds / 60)} Min`
}
