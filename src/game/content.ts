import { call, type Rpc } from './backend'
import { sanitizeMissions } from './custom'
import { LocalDuelStore } from './duels'
import { LocalPlayerStore } from './storage'
import type { Mission } from './types'

/** What the parents set up: their PIN (only whether one exists) and their own missions. */
export interface ParentContent {
  hasPin: boolean
  missions: Mission[]
}

export interface ContentStore {
  load(): Promise<ParentContent>
  checkPin(pin: string): Promise<boolean>
  /** Sets the first PIN (`oldPin` null) or changes it. */
  setPin(oldPin: string | null, newPin: string): Promise<void>
  saveMissions(pin: string, missions: Mission[]): Promise<Mission[]>
  /** Deletes a child with all points, badges, purchases and duels. */
  deletePlayer(pin: string, playerId: string): Promise<void>
}

export class WrongPinError extends Error {
  constructor() {
    super('Die PIN stimmt nicht.')
  }
}

/** SHA-256 of the PIN, salted with the family code, so the PIN itself is never stored. */
export async function hashPin(pin: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`learningstar:${salt}:${pin}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

const CONTENT_KEY = 'learningstar.parents.v1'

interface LocalContent {
  pinHash: string | null
  missions: Mission[]
}

export class LocalContentStore implements ContentStore {
  private readonly storage: Storage

  constructor(storage: Storage = window.localStorage) {
    this.storage = storage
  }

  async load(): Promise<ParentContent> {
    const content = this.read()
    return { hasPin: content.pinHash !== null, missions: content.missions }
  }

  async checkPin(pin: string): Promise<boolean> {
    const { pinHash } = this.read()
    return pinHash !== null && pinHash === (await hashPin(pin, 'local'))
  }

  async setPin(oldPin: string | null, newPin: string): Promise<void> {
    const content = this.read()
    if (content.pinHash !== null && (oldPin === null || !(await this.checkPin(oldPin)))) throw new WrongPinError()
    this.write({ ...content, pinHash: await hashPin(newPin, 'local') })
  }

  async saveMissions(pin: string, missions: Mission[]): Promise<Mission[]> {
    if (!(await this.checkPin(pin))) throw new WrongPinError()
    this.write({ ...this.read(), missions })
    return missions
  }

  async deletePlayer(pin: string, playerId: string): Promise<void> {
    if (!(await this.checkPin(pin))) throw new WrongPinError()
    new LocalPlayerStore(this.storage).remove(playerId)
    new LocalDuelStore(this.storage).removePlayer(playerId)
  }

  private read(): LocalContent {
    try {
      const parsed = JSON.parse(this.storage.getItem(CONTENT_KEY) ?? 'null') as Partial<LocalContent> | null
      return { pinHash: typeof parsed?.pinHash === 'string' ? parsed.pinHash : null, missions: sanitizeMissions(parsed?.missions) }
    } catch {
      return { pinHash: null, missions: [] }
    }
  }

  private write(content: LocalContent): void {
    this.storage.setItem(CONTENT_KEY, JSON.stringify(content))
  }
}

export class FamilyContentStore implements ContentStore {
  private readonly rpc: Rpc
  private readonly code: string

  constructor(rpc: Rpc, code: string) {
    this.rpc = rpc
    this.code = code
  }

  async load(): Promise<ParentContent> {
    const content = await call<{ hasPin: boolean; missions: unknown }>(this.rpc, 'get_family_content', { p_code: this.code })
    return { hasPin: content.hasPin, missions: sanitizeMissions(content.missions) }
  }

  async checkPin(pin: string): Promise<boolean> {
    return call<boolean>(this.rpc, 'check_parent_pin', { p_code: this.code, p_pin_hash: await this.hash(pin) })
  }

  async setPin(oldPin: string | null, newPin: string): Promise<void> {
    await this.wrongPinAware(async () =>
      call(this.rpc, 'set_parent_pin', {
        p_code: this.code,
        p_old_pin_hash: oldPin === null ? null : await this.hash(oldPin),
        p_new_pin_hash: await this.hash(newPin),
      }),
    )
  }

  async saveMissions(pin: string, missions: Mission[]): Promise<Mission[]> {
    const saved = await this.wrongPinAware(async () =>
      call<unknown>(this.rpc, 'save_custom_missions', { p_code: this.code, p_pin_hash: await this.hash(pin), p_missions: missions }),
    )
    return sanitizeMissions(saved)
  }

  async deletePlayer(pin: string, playerId: string): Promise<void> {
    await this.wrongPinAware(async () =>
      call(this.rpc, 'delete_player', { p_code: this.code, p_pin_hash: await this.hash(pin), p_player_id: playerId }),
    )
  }

  private hash(pin: string): Promise<string> {
    return hashPin(pin, this.code)
  }

  private async wrongPinAware<T>(action: () => Promise<T>): Promise<T> {
    try {
      return await action()
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'wrong_pin') throw new WrongPinError()
      throw error
    }
  }
}
