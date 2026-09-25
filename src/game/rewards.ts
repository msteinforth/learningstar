import { missions } from './missions'
import type { ItemSlot, Player, PlayerExtras } from './types'

// --- Extras & wallet ----------------------------------------------------------

export function extrasOf(player: { extras?: Partial<PlayerExtras> }): PlayerExtras {
  const extras = player.extras
  return {
    spent: extras?.spent ?? 0,
    owned: extras?.owned ?? [],
    equipped: extras?.equipped ?? {},
    badges: extras?.badges ?? {},
    streak: extras?.streak ?? { days: 0, lastDay: null },
  }
}

/** Horseshoes that can still be spent in the shop. */
export function walletOf(player: Player): number {
  return Math.max(0, player.totalPoints - extrasOf(player).spent)
}

// --- Daily streak ---------------------------------------------------------------

/** Local calendar day as "YYYY-MM-DD". */
export function dayKey(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function nextStreak(streak: PlayerExtras['streak'], now: Date): PlayerExtras['streak'] {
  const today = dayKey(now)
  if (streak.lastDay === today) return streak
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  return { days: streak.lastDay === dayKey(yesterday) ? streak.days + 1 : 1, lastDay: today }
}

// --- Badges ----------------------------------------------------------------------

export interface Badge {
  id: string
  title: string
  description: string
  icon: string
  /** Current progress towards the badge; the badge is earned at `current >= target`. */
  progress: (player: Player) => { current: number; target: number }
}

const trackMissions = (track: string) => missions.filter((mission) => mission.track === track)
const passedCount = (player: Player, list = missions) => list.filter((mission) => player.missions[mission.id]?.passed).length
const goldCount = (player: Player) => Object.values(player.missions).filter((progress) => progress.bestRosettes >= 3).length
const playCount = (player: Player) => Object.values(player.missions).reduce((sum, progress) => sum + progress.plays, 0)

export const BADGES: Badge[] = [
  { id: 'erster-ritt', title: 'Erster Ausritt', description: 'Spiele deine erste Mission.', icon: '🐣', progress: (p) => ({ current: playCount(p), target: 1 }) },
  { id: 'erste-schleife', title: 'Erste Schleife', description: 'Bestehe eine Mission.', icon: '🎀', progress: (p) => ({ current: passedCount(p), target: 1 }) },
  { id: 'fehlerfrei', title: 'Fehlerfreier Ritt', description: 'Hol dir 3 Schleifen in einer Mission.', icon: '✨', progress: (p) => ({ current: goldCount(p), target: 1 }) },
  { id: 'gold-sammler', title: 'Gold-Sammler', description: 'Hol dir 3 Schleifen in 5 Missionen.', icon: '🏆', progress: (p) => ({ current: goldCount(p), target: 5 }) },
  { id: 'fleissig', title: 'Fleißiges Pony', description: 'Spiele 10 Missionen.', icon: '🐎', progress: (p) => ({ current: playCount(p), target: 10 }) },
  { id: 'marathon', title: 'Marathon-Reiter', description: 'Spiele 50 Missionen.', icon: '🏃', progress: (p) => ({ current: playCount(p), target: 50 }) },
  { id: 'serie-3', title: 'Dranbleiber', description: 'Spiele 3 Tage hintereinander.', icon: '🔥', progress: (p) => ({ current: extrasOf(p).streak.days, target: 3 }) },
  { id: 'serie-7', title: 'Wochen-Held', description: 'Spiele 7 Tage hintereinander.', icon: '🌟', progress: (p) => ({ current: extrasOf(p).streak.days, target: 7 }) },
  { id: 'hufeisen-100', title: 'Hufeisen-Sammler', description: 'Sammle 100 Hufeisen.', icon: '🧲', progress: (p) => ({ current: p.totalPoints, target: 100 }) },
  { id: 'hufeisen-500', title: 'Hufeisen-Schatz', description: 'Sammle 500 Hufeisen.', icon: '💰', progress: (p) => ({ current: p.totalPoints, target: 500 }) },
  {
    id: 'einmaleins-profi',
    title: '1×1-Profi',
    description: 'Bestehe alle Missionen im Rechen-Parcours.',
    icon: '🧮',
    progress: (p) => ({ current: passedCount(p, trackMissions('math')), target: trackMissions('math').length }),
  },
  {
    id: 'englisch-profi',
    title: 'English Rider',
    description: 'Bestehe alle Missionen im Englisch-Ausritt.',
    icon: '💂',
    progress: (p) => ({ current: passedCount(p, trackMissions('english')), target: trackMissions('english').length }),
  },
]

export function findBadge(id: string): Badge | undefined {
  return BADGES.find((badge) => badge.id === id)
}

/** Adds all badges the player has reached; already earned badges are kept. */
export function awardBadges(player: Player, now: Date): Player {
  const extras = extrasOf(player)
  const badges = { ...extras.badges }
  for (const badge of BADGES) {
    if (badges[badge.id]) continue
    const { current, target } = badge.progress(player)
    if (current >= target) badges[badge.id] = now.toISOString()
  }
  return { ...player, extras: { ...extras, badges } }
}

/** Badges in `after` that were not yet in `before`. */
export function newBadges(before: Player, after: Player): Badge[] {
  const earlier = extrasOf(before).badges
  return BADGES.filter((badge) => extrasOf(after).badges[badge.id] && !earlier[badge.id])
}

// --- Shop ------------------------------------------------------------------------------

export interface ShopItem {
  id: string
  slot: ItemSlot
  name: string
  /** Emoji for hats and buddies, CSS background for backgrounds. */
  look: string
  price: number
  /** Only for sale once this badge was earned. */
  requiresBadge?: string
}

export const SLOTS: { id: ItemSlot; title: string; icon: string }[] = [
  { id: 'hat', title: 'Kopfschmuck', icon: '🎩' },
  { id: 'buddy', title: 'Freunde', icon: '🐾' },
  { id: 'background', title: 'Hintergründe', icon: '🌈' },
]

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'hat-bow', slot: 'hat', name: 'Schleife', look: '🎀', price: 20 },
  { id: 'hat-cap', slot: 'hat', name: 'Kappe', look: '🧢', price: 30 },
  { id: 'hat-flowers', slot: 'hat', name: 'Blumenkranz', look: '🌸', price: 40 },
  { id: 'hat-tophat', slot: 'hat', name: 'Zylinder', look: '🎩', price: 60 },
  { id: 'hat-party', slot: 'hat', name: 'Partyhut', look: '🥳', price: 80 },
  { id: 'hat-grad', slot: 'hat', name: 'Doktorhut', look: '🎓', price: 100, requiresBadge: 'einmaleins-profi' },
  { id: 'hat-crown', slot: 'hat', name: 'Krone', look: '👑', price: 200, requiresBadge: 'gold-sammler' },

  { id: 'buddy-carrot', slot: 'buddy', name: 'Karotte', look: '🥕', price: 15 },
  { id: 'buddy-apple', slot: 'buddy', name: 'Apfel', look: '🍎', price: 15 },
  { id: 'buddy-butterfly', slot: 'buddy', name: 'Schmetterling', look: '🦋', price: 40 },
  { id: 'buddy-bird', slot: 'buddy', name: 'Vögelchen', look: '🐤', price: 50 },
  { id: 'buddy-cat', slot: 'buddy', name: 'Stallkatze', look: '🐈', price: 80 },
  { id: 'buddy-dog', slot: 'buddy', name: 'Hofhund', look: '🐕', price: 90 },
  { id: 'buddy-star', slot: 'buddy', name: 'Glücksstern', look: '🌟', price: 120, requiresBadge: 'serie-7' },

  { id: 'bg-meadow', slot: 'background', name: 'Frühlingswiese', look: 'linear-gradient(160deg, #b8f28b, #4fae3b)', price: 25 },
  { id: 'bg-sky', slot: 'background', name: 'Himmelblau', look: 'linear-gradient(160deg, #a8e6ff, #1cb0f6)', price: 25 },
  { id: 'bg-sunset', slot: 'background', name: 'Sonnenuntergang', look: 'linear-gradient(160deg, #ffd23f, #ff7eb6 55%, #a560f0)', price: 60 },
  { id: 'bg-beach', slot: 'background', name: 'Strand', look: 'linear-gradient(180deg, #5ec8ff 0 55%, #ffe29a 55%)', price: 70 },
  { id: 'bg-night', slot: 'background', name: 'Sternennacht', look: 'radial-gradient(circle at 30% 30%, #fff 0 2px, transparent 3px), radial-gradient(circle at 70% 60%, #fff 0 1.5px, transparent 2.5px), linear-gradient(160deg, #3b3f8f, #141a4a)', price: 90 },
  { id: 'bg-rainbow', slot: 'background', name: 'Regenbogen', look: 'conic-gradient(from 200deg, #ff5a5f, #ff9f1c, #ffd23f, #58cc02, #1cb0f6, #a560f0, #ff5a5f)', price: 150 },
  { id: 'bg-gold', slot: 'background', name: 'Goldglanz', look: 'linear-gradient(135deg, #fff3b0, #ffc629 45%, #e0a000)', price: 150, requiresBadge: 'fehlerfrei' },
]

export function findItem(id: string | undefined): ShopItem | undefined {
  return SHOP_ITEMS.find((item) => item.id === id)
}

export type BuyCheck = { ok: true } | { ok: false; reason: 'owned' | 'locked' | 'too-expensive' }

export function canBuy(player: Player, item: ShopItem): BuyCheck {
  const extras = extrasOf(player)
  if (extras.owned.includes(item.id)) return { ok: false, reason: 'owned' }
  if (item.requiresBadge && !extras.badges[item.requiresBadge]) return { ok: false, reason: 'locked' }
  if (walletOf(player) < item.price) return { ok: false, reason: 'too-expensive' }
  return { ok: true }
}

/** Buys and puts on the item. Throws when it cannot be bought. */
export function buyItem(player: Player, itemId: string): Player {
  const item = findItem(itemId)
  if (!item) throw new Error(`Unbekannter Artikel: ${itemId}`)
  const check = canBuy(player, item)
  if (!check.ok) throw new Error(`Kauf nicht möglich: ${check.reason}`)
  const extras = extrasOf(player)
  return {
    ...player,
    extras: {
      ...extras,
      spent: extras.spent + item.price,
      owned: [...extras.owned, item.id],
      equipped: { ...extras.equipped, [item.slot]: item.id },
    },
  }
}

/** Puts on an owned item, or takes off whatever is in `slot` when `itemId` is null. */
export function equipItem(player: Player, slot: ItemSlot, itemId: string | null): Player {
  const extras = extrasOf(player)
  const equipped = { ...extras.equipped }
  if (itemId === null) {
    delete equipped[slot]
  } else {
    const item = findItem(itemId)
    if (!item || item.slot !== slot || !extras.owned.includes(itemId)) throw new Error(`Nicht im Besitz: ${itemId}`)
    equipped[slot] = itemId
  }
  return { ...player, extras: { ...extras, equipped } }
}
