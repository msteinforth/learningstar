import { call, type Rpc } from './backend'
import type { Player } from './types'

export interface Family {
  code: string
  name: string
}

const FAMILY_KEY = 'learningstar.family.v1'

/** "K7PM3XQA" → "K7PM-3XQA" */
export function formatCode(code: string): string {
  return code.length === 8 ? `${code.slice(0, 4)}-${code.slice(4)}` : code
}

export function readFamily(storage: Storage = window.localStorage): Family | null {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(FAMILY_KEY) ?? 'null')
    if (parsed && typeof parsed === 'object' && 'code' in parsed && 'name' in parsed) return parsed as Family
  } catch {
    // Fall through: no family on this device.
  }
  return null
}

export function writeFamily(family: Family | null, storage: Storage = window.localStorage): void {
  if (family) storage.setItem(FAMILY_KEY, JSON.stringify(family))
  else storage.removeItem(FAMILY_KEY)
}

export function createFamily(rpc: Rpc, name: string): Promise<Family> {
  return call(rpc, 'create_family', { p_name: name.trim() })
}

export function joinFamily(rpc: Rpc, code: string): Promise<Family> {
  return call(rpc, 'join_family', { p_code: code })
}

/** Uploads profiles from this device into the family, keeping their points. */
export async function moveIntoFamily(rpc: Rpc, family: Family, players: Player[]): Promise<void> {
  for (const player of players) {
    await call(rpc, 'create_player', { p_code: family.code, p_player: player })
  }
}
