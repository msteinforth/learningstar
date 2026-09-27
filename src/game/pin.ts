/** SHA-256 of a PIN with a salt, so the PIN itself is never stored. */
export async function hashPin(pin: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`learningstar:${salt}:${pin}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

/** A child's PIN is salted with the player id, so it survives moving into a family. */
export const hashPlayerPin = (pin: string, playerId: string) => hashPin(pin, `player:${playerId}`)

export const PIN_PATTERN = /^\d{4,6}$/

export class WrongPinError extends Error {
  constructor() {
    super('Die PIN stimmt nicht.')
  }
}
