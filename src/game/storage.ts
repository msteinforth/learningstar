import { call, type Rpc } from './backend'
import { applyResult } from './progress'
import type { MissionResult, Player } from './types'

export interface LeaderboardEntry {
  playerId: string
  name: string
  avatar: string
  color: string
  totalPoints: number
  /** Points collected since Monday 0:00. */
  weekPoints: number
}

/**
 * Persistence for player profiles. Without a family everything stays in this
 * browser; with a family the profiles live on the server and are shared by
 * all devices that know the family code.
 */
export interface PlayerStore {
  list(): Promise<Player[]>
  create(player: Player): Promise<Player>
  /** Stores a finished mission and returns the updated player. */
  recordResult(playerId: string, result: MissionResult): Promise<Player>
  leaderboard(): Promise<LeaderboardEntry[]>
}

/** Monday 0:00 local time of the week containing `now`. */
export function startOfWeek(now: Date): Date {
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7))
  return start
}

export function rankEntries(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return [...entries].sort((a, b) => b.weekPoints - a.weekPoints || b.totalPoints - a.totalPoints)
}

const PLAYERS_KEY = 'learningstar.players.v1'
const EVENTS_KEY = 'learningstar.events.v1'
const EVENT_RETENTION_MS = 14 * 24 * 60 * 60 * 1000

interface PointEvent {
  playerId: string
  points: number
  at: string
}

export class LocalPlayerStore implements PlayerStore {
  private readonly storage: Storage
  private readonly now: () => Date

  constructor(storage: Storage = window.localStorage, now: () => Date = () => new Date()) {
    this.storage = storage
    this.now = now
  }

  async list(): Promise<Player[]> {
    return this.read<Player>(PLAYERS_KEY)
  }

  async create(player: Player): Promise<Player> {
    this.writePlayer(player)
    return player
  }

  async recordResult(playerId: string, result: MissionResult): Promise<Player> {
    const player = this.read<Player>(PLAYERS_KEY).find((candidate) => candidate.id === playerId)
    if (!player) throw new Error(`Unbekannter Spieler: ${playerId}`)
    const updated = applyResult(player, result, this.now())
    this.writePlayer(updated)

    const cutoff = this.now().getTime() - EVENT_RETENTION_MS
    const events = this.read<PointEvent>(EVENTS_KEY).filter((event) => new Date(event.at).getTime() >= cutoff)
    events.push({ playerId, points: result.points, at: this.now().toISOString() })
    this.storage.setItem(EVENTS_KEY, JSON.stringify(events))
    return updated
  }

  async leaderboard(): Promise<LeaderboardEntry[]> {
    const weekStart = startOfWeek(this.now()).getTime()
    const events = this.read<PointEvent>(EVENTS_KEY).filter((event) => new Date(event.at).getTime() >= weekStart)
    return rankEntries(
      this.read<Player>(PLAYERS_KEY).map((player) => ({
        playerId: player.id,
        name: player.name,
        avatar: player.avatar,
        color: player.color,
        totalPoints: player.totalPoints,
        weekPoints: events.filter((event) => event.playerId === player.id).reduce((sum, event) => sum + event.points, 0),
      })),
    )
  }

  /** Removes all local profiles, e.g. after they were moved into a family. */
  clear(): void {
    this.storage.removeItem(PLAYERS_KEY)
    this.storage.removeItem(EVENTS_KEY)
  }

  private writePlayer(player: Player): void {
    const players = this.read<Player>(PLAYERS_KEY).filter((existing) => existing.id !== player.id)
    this.storage.setItem(PLAYERS_KEY, JSON.stringify([...players, player]))
  }

  private read<T>(key: string): T[] {
    try {
      const raw = this.storage.getItem(key)
      const parsed: unknown = raw ? JSON.parse(raw) : []
      return Array.isArray(parsed) ? (parsed as T[]) : []
    } catch {
      return []
    }
  }
}

export class FamilyPlayerStore implements PlayerStore {
  private readonly rpc: Rpc
  private readonly code: string

  constructor(rpc: Rpc, code: string) {
    this.rpc = rpc
    this.code = code
  }

  list(): Promise<Player[]> {
    return call(this.rpc, 'list_players', { p_code: this.code })
  }

  create(player: Player): Promise<Player> {
    return call(this.rpc, 'create_player', { p_code: this.code, p_player: player })
  }

  async recordResult(playerId: string, result: MissionResult): Promise<Player> {
    // Start from the server copy in case the same child played on another device.
    const current = await call<Player>(this.rpc, 'get_player', { p_code: this.code, p_player_id: playerId })
    const updated = applyResult(current, result)
    return call(this.rpc, 'save_progress', {
      p_code: this.code,
      p_player_id: playerId,
      p_mission_id: result.missionId,
      p_points: result.points,
      p_missions: updated.missions,
      p_mistakes: updated.mistakes,
    })
  }

  leaderboard(): Promise<LeaderboardEntry[]> {
    return call(this.rpc, 'leaderboard', { p_code: this.code })
  }
}
