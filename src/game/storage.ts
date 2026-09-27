import { call, type Rpc } from './backend'
import { hashPlayerPin, WrongPinError } from './pin'
import { applyResult } from './progress'
import type { MissionResult, Player, PlayerExtras, PlayerProfile } from './types'

export interface LeaderboardEntry {
  playerId: string
  name: string
  avatar: string
  color: string
  totalPoints: number
  /** Points collected since Monday 0:00. */
  weekPoints: number
  /** For showing the avatar with its hat, buddy and background. */
  extras?: Partial<PlayerExtras>
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
  /** Changes badges, shop items etc. (everything except points) and returns the updated player. */
  updateExtras(playerId: string, update: (player: Player) => Player): Promise<Player>
  /** Changes name, horse and colour; needs the child's PIN if the horse has one. */
  updateProfile(playerId: string, pin: string | null, profile: PlayerProfile): Promise<Player>
  /** True if the PIN is right (or the horse has no PIN). */
  checkPin(playerId: string, pin: string): Promise<boolean>
  /** Sets, changes (old PIN needed) or removes (`newPin` null) the child's PIN. */
  setPin(playerId: string, oldPin: string | null, newPin: string | null): Promise<Player>
  leaderboard(): Promise<LeaderboardEntry[]>
}

/** Name, horse and colour as the server accepts them. */
export function cleanProfile(profile: PlayerProfile): PlayerProfile {
  return { name: profile.name.trim().slice(0, 20), avatar: profile.avatar, color: profile.color }
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
/** Player id → hash of the child's PIN. */
const PINS_KEY = 'learningstar.playerPins.v1'
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
    return this.read<Player>(PLAYERS_KEY).map((player) => this.withPin(player))
  }

  /** Profiles including the PIN hashes, for moving them into a family. */
  async export(): Promise<(Player & { pinHash?: string })[]> {
    const pins = this.pins()
    return this.read<Player>(PLAYERS_KEY).map((player) => (pins[player.id] ? { ...player, pinHash: pins[player.id] } : player))
  }

  async create(player: Player): Promise<Player> {
    this.writePlayer(player)
    return this.withPin(player)
  }

  async updateProfile(playerId: string, pin: string | null, profile: PlayerProfile): Promise<Player> {
    const player = this.find(playerId)
    if (!(await this.checkPin(playerId, pin ?? ''))) throw new WrongPinError()
    const updated = { ...player, ...cleanProfile(profile) }
    this.writePlayer(updated)
    return this.withPin(updated)
  }

  async checkPin(playerId: string, pin: string): Promise<boolean> {
    const hash = this.pins()[playerId]
    return !hash || hash === (await hashPlayerPin(pin, playerId))
  }

  async setPin(playerId: string, oldPin: string | null, newPin: string | null): Promise<Player> {
    const player = this.find(playerId)
    if (!(await this.checkPin(playerId, oldPin ?? ''))) throw new WrongPinError()
    const pins = this.pins()
    if (newPin === null) delete pins[playerId]
    else pins[playerId] = await hashPlayerPin(newPin, playerId)
    this.storage.setItem(PINS_KEY, JSON.stringify(pins))
    return this.withPin(player)
  }

  /** Forgotten PIN: the parents' area removes it (after checking the parents' PIN). */
  removePin(playerId: string): void {
    const pins = this.pins()
    delete pins[playerId]
    this.storage.setItem(PINS_KEY, JSON.stringify(pins))
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
    return this.withPin(updated)
  }

  async updateExtras(playerId: string, update: (player: Player) => Player): Promise<Player> {
    const player = this.read<Player>(PLAYERS_KEY).find((candidate) => candidate.id === playerId)
    if (!player) throw new Error(`Unbekannter Spieler: ${playerId}`)
    const updated = { ...player, extras: update(player).extras }
    this.writePlayer(updated)
    return this.withPin(updated)
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
        extras: { equipped: player.extras?.equipped ?? {} },
      })),
    )
  }

  /** Removes one profile together with its points history. */
  remove(playerId: string): void {
    this.removePin(playerId)
    this.storage.setItem(PLAYERS_KEY, JSON.stringify(this.read<Player>(PLAYERS_KEY).filter((player) => player.id !== playerId)))
    this.storage.setItem(EVENTS_KEY, JSON.stringify(this.read<PointEvent>(EVENTS_KEY).filter((event) => event.playerId !== playerId)))
  }

  /** Removes all local profiles, e.g. after they were moved into a family. */
  clear(): void {
    this.storage.removeItem(PLAYERS_KEY)
    this.storage.removeItem(PINS_KEY)
    this.storage.removeItem(EVENTS_KEY)
  }

  private writePlayer(player: Player): void {
    const { hasPin: _derived, ...stored } = player
    // Keep the order of the stall when a profile changes.
    const players = this.read<Player>(PLAYERS_KEY)
    const next = players.some((existing) => existing.id === player.id) ? players.map((existing) => (existing.id === player.id ? stored : existing)) : [...players, stored]
    this.storage.setItem(PLAYERS_KEY, JSON.stringify(next))
  }

  private find(playerId: string): Player {
    const player = this.read<Player>(PLAYERS_KEY).find((candidate) => candidate.id === playerId)
    if (!player) throw new Error(`Unbekannter Spieler: ${playerId}`)
    return player
  }

  private withPin(player: Player): Player {
    const { hasPin: _stale, ...rest } = player
    return this.pins()[player.id] ? { ...rest, hasPin: true } : rest
  }

  private pins(): Record<string, string> {
    try {
      const parsed: unknown = JSON.parse(this.storage.getItem(PINS_KEY) ?? '{}')
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Record<string, string>) : {}
    } catch {
      return {}
    }
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
      p_extras: updated.extras ?? {},
    })
  }

  async updateExtras(playerId: string, update: (player: Player) => Player): Promise<Player> {
    const current = await call<Player>(this.rpc, 'get_player', { p_code: this.code, p_player_id: playerId })
    return call(this.rpc, 'save_extras', { p_code: this.code, p_player_id: playerId, p_extras: update(current).extras ?? {} })
  }

  async updateProfile(playerId: string, pin: string | null, profile: PlayerProfile): Promise<Player> {
    const { name, avatar, color } = cleanProfile(profile)
    return call(this.rpc, 'update_player', {
      p_code: this.code,
      p_player_id: playerId,
      p_pin_hash: pin === null ? null : await hashPlayerPin(pin, playerId),
      p_name: name,
      p_avatar: avatar,
      p_color: color,
    })
  }

  async checkPin(playerId: string, pin: string): Promise<boolean> {
    return call(this.rpc, 'check_player_pin', { p_code: this.code, p_player_id: playerId, p_pin_hash: await hashPlayerPin(pin, playerId) })
  }

  async setPin(playerId: string, oldPin: string | null, newPin: string | null): Promise<Player> {
    return call(this.rpc, 'set_player_pin', {
      p_code: this.code,
      p_player_id: playerId,
      p_old_pin_hash: oldPin === null ? null : await hashPlayerPin(oldPin, playerId),
      p_new_pin_hash: newPin === null ? null : await hashPlayerPin(newPin, playerId),
    })
  }

  leaderboard(): Promise<LeaderboardEntry[]> {
    return call(this.rpc, 'leaderboard', { p_code: this.code })
  }
}
