import type { Player } from './types'

/**
 * Persistence for player profiles. The MVP stores everything in the browser;
 * a server-backed implementation can replace it later so that siblings on
 * different devices share one family leaderboard.
 */
export interface PlayerStore {
  list(): Promise<Player[]>
  save(player: Player): Promise<void>
  remove(id: string): Promise<void>
}

const PLAYERS_KEY = 'learningstar.players.v1'

export class LocalPlayerStore implements PlayerStore {
  private readonly storage: Storage

  constructor(storage: Storage = window.localStorage) {
    this.storage = storage
  }

  async list(): Promise<Player[]> {
    return this.read()
  }

  async save(player: Player): Promise<void> {
    const players = this.read().filter((existing) => existing.id !== player.id)
    this.write([...players, player])
  }

  async remove(id: string): Promise<void> {
    this.write(this.read().filter((player) => player.id !== id))
  }

  private read(): Player[] {
    try {
      const raw = this.storage.getItem(PLAYERS_KEY)
      const parsed: unknown = raw ? JSON.parse(raw) : []
      return Array.isArray(parsed) ? (parsed as Player[]) : []
    } catch {
      return []
    }
  }

  private write(players: Player[]): void {
    this.storage.setItem(PLAYERS_KEY, JSON.stringify(players))
  }
}
