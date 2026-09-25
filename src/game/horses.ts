/** Coat colours of the illustrated horses. */
export interface HorseStyle {
  id: string
  name: string
  coat: string
  /** Slightly darker coat for legs and shadows on the far side. */
  shade: string
  mane: string
  muzzle: string
  /** White stripe down the face. */
  blaze?: boolean
  /** Coloured patches (pinto). */
  patches?: string
  /** Rainbow mane and a golden horn. */
  unicorn?: boolean
  /** Extra fluffy forelock (pony). */
  fluffy?: boolean
}

export const HORSES: HorseStyle[] = [
  { id: 'bay', name: 'Brauner', coat: '#a0643b', shade: '#7f4c2b', mane: '#2f1f18', muzzle: '#c99673', blaze: true },
  { id: 'chestnut', name: 'Fuchs', coat: '#d0743a', shade: '#ac5a28', mane: '#f5d58f', muzzle: '#eab08a' },
  { id: 'black', name: 'Rappe', coat: '#3b3344', shade: '#2a2331', mane: '#1b1520', muzzle: '#62586b', blaze: true },
  { id: 'grey', name: 'Schimmel', coat: '#eef0f6', shade: '#cfd4e0', mane: '#b9c0d0', muzzle: '#dfe2ea' },
  { id: 'palomino', name: 'Palomino', coat: '#ebbd62', shade: '#cf9d42', mane: '#fff5dc', muzzle: '#f5d9a4', blaze: true },
  { id: 'pinto', name: 'Schecke', coat: '#fbf6ef', shade: '#e3dbcf', mane: '#6b3f22', muzzle: '#f0e2d2', patches: '#a8622f' },
  { id: 'pony', name: 'Pony', coat: '#8e5a3c', shade: '#6f432b', mane: '#f1dfbf', muzzle: '#b98a6b', fluffy: true },
  { id: 'unicorn', name: 'Einhorn', coat: '#fdf7ff', shade: '#e6dcf0', mane: '#ff8fc8', muzzle: '#f6e6f4', unicorn: true },
]

export const RAINBOW = ['#ff6b8b', '#ffb23f', '#ffe066', '#6fdc8c', '#5cc8ff', '#b28dff']

/** Emojis used as avatars before the illustrations existed. */
const LEGACY: Record<string, string> = { '🐴': 'bay', '🦄': 'unicorn', '🐎': 'chestnut', '🏇': 'palomino' }

export const HORSE_AVATAR_PREFIX = 'horse:'

/** The horse for a stored avatar value ("horse:bay" or an old emoji), or undefined for other animals. */
export function horseFor(avatar: string): HorseStyle | undefined {
  const id = avatar.startsWith(HORSE_AVATAR_PREFIX) ? avatar.slice(HORSE_AVATAR_PREFIX.length) : LEGACY[avatar]
  return HORSES.find((horse) => horse.id === id)
}
