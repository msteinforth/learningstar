import { findTrack, missions, tracks } from './missions'
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
    duelWins: extras?.duelWins ?? 0,
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

// Ids of the first two stay as they were, earned badges are stored by id.
const CHAMPIONS = [
  { id: 'einmaleins-profi', track: 'math', title: '1×1-Profi', icon: 'abacus' },
  { id: 'deutsch-profi', track: 'german', title: 'Dressur-Star', icon: 'book' },
  { id: 'englisch-profi', track: 'english', title: 'English Rider', icon: 'guard-hat' },
  { id: 'franzoesisch-profi', track: 'french', title: 'Champion de France', icon: 'croissant' },
  { id: 'spanisch-profi', track: 'spanish', title: 'Campeón de España', icon: 'fan' },
]

export const BADGES: Badge[] = [
  { id: 'erster-ritt', title: 'Erster Ausritt', description: 'Spiele deine erste Mission.', icon: 'chick', progress: (p) => ({ current: playCount(p), target: 1 }) },
  { id: 'erste-schleife', title: 'Erste Schleife', description: 'Bestehe eine Mission.', icon: 'bow', progress: (p) => ({ current: passedCount(p), target: 1 }) },
  { id: 'fehlerfrei', title: 'Fehlerfreier Ritt', description: 'Hol dir 3 Schleifen in einer Mission.', icon: 'sparkles', progress: (p) => ({ current: goldCount(p), target: 1 }) },
  { id: 'gold-sammler', title: 'Gold-Sammler', description: 'Hol dir 3 Schleifen in 5 Missionen.', icon: 'trophy', progress: (p) => ({ current: goldCount(p), target: 5 }) },
  { id: 'fleissig', title: 'Fleißiges Pony', description: 'Spiele 10 Missionen.', icon: 'carrot', progress: (p) => ({ current: playCount(p), target: 10 }) },
  { id: 'marathon', title: 'Marathon-Reiter', description: 'Spiele 50 Missionen.', icon: 'lightning', progress: (p) => ({ current: playCount(p), target: 50 }) },
  { id: 'serie-3', title: 'Dranbleiber', description: 'Spiele 3 Tage hintereinander.', icon: 'fire', progress: (p) => ({ current: extrasOf(p).streak.days, target: 3 }) },
  { id: 'serie-7', title: 'Wochen-Held', description: 'Spiele 7 Tage hintereinander.', icon: 'star-shine', progress: (p) => ({ current: extrasOf(p).streak.days, target: 7 }) },
  { id: 'hufeisen-100', title: 'Hufeisen-Sammler', description: 'Sammle 100 Hufeisen.', icon: 'horseshoe', progress: (p) => ({ current: p.totalPoints, target: 100 }) },
  { id: 'hufeisen-500', title: 'Hufeisen-Schatz', description: 'Sammle 500 Hufeisen.', icon: 'treasure', progress: (p) => ({ current: p.totalPoints, target: 500 }) },
  ...CHAMPIONS.map(({ id, track, title, icon }) => ({
    id,
    title,
    description: `Bestehe alle Missionen im ${findTrack(track)?.title ?? track}.`,
    icon,
    progress: (p: Player) => ({ current: passedCount(p, trackMissions(track)), target: trackMissions(track).length }),
  })),
  { id: 'duell-sieg', title: 'Duell-Gewinner', description: 'Gewinne ein Duell.', icon: 'swords', progress: (p) => ({ current: extrasOf(p).duelWins ?? 0, target: 1 }) },
  { id: 'duell-champion', title: 'Duell-Champion', description: 'Gewinne 5 Duelle.', icon: 'shield', progress: (p) => ({ current: extrasOf(p).duelWins ?? 0, target: 5 }) },
  {
    id: 'allrounder',
    title: 'Allround-Reiter',
    description: 'Bestehe in jedem Turnier mindestens eine Mission.',
    icon: 'carousel',
    progress: (p) => ({ current: tracks.filter((track) => passedCount(p, trackMissions(track.id)) > 0).length, target: tracks.length }),
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
  /** Icon name (see components/icon-art) for hats and buddies, CSS background for backgrounds. */
  look: string
  price: number
  /** Only for sale once this badge was earned. */
  requiresBadge?: string
}

export const SLOTS: { id: ItemSlot; title: string; icon: string }[] = [
  { id: 'hat', title: 'Kopfschmuck', icon: 'top-hat' },
  { id: 'buddy', title: 'Freunde', icon: 'paw' },
  { id: 'background', title: 'Hintergründe', icon: 'rainbow' },
]

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'hat-bow', slot: 'hat', name: 'Schleife', look: 'bow', price: 20 },
  { id: 'hat-cap', slot: 'hat', name: 'Kappe', look: 'cap', price: 30 },
  { id: 'hat-flowers', slot: 'hat', name: 'Blumenkranz', look: 'flowers', price: 40 },
  { id: 'hat-tophat', slot: 'hat', name: 'Zylinder', look: 'top-hat', price: 60 },
  { id: 'hat-party', slot: 'hat', name: 'Partyhut', look: 'party-hat', price: 80 },
  { id: 'hat-grad', slot: 'hat', name: 'Doktorhut', look: 'grad-cap', price: 100, requiresBadge: 'einmaleins-profi' },
  { id: 'hat-crown', slot: 'hat', name: 'Krone', look: 'crown', price: 200, requiresBadge: 'gold-sammler' },
  // Premium: for children who save up for a long time.
  { id: 'hat-helmet', slot: 'hat', name: 'Reithelm', look: 'riding-helmet', price: 300 },
  { id: 'hat-cowboy', slot: 'hat', name: 'Cowboyhut', look: 'cowboy-hat', price: 400 },
  { id: 'hat-tiara', slot: 'hat', name: 'Diadem', look: 'tiara', price: 600 },
  { id: 'hat-wizard', slot: 'hat', name: 'Zauberhut', look: 'wizard-hat', price: 750 },
  { id: 'hat-viking', slot: 'hat', name: 'Wikingerhelm', look: 'viking-helmet', price: 900 },
  { id: 'hat-unicorn', slot: 'hat', name: 'Einhorn-Horn', look: 'unicorn-horn', price: 1500, requiresBadge: 'hufeisen-500' },

  { id: 'buddy-carrot', slot: 'buddy', name: 'Karotte', look: 'carrot', price: 15 },
  { id: 'buddy-apple', slot: 'buddy', name: 'Apfel', look: 'apple', price: 15 },
  { id: 'buddy-butterfly', slot: 'buddy', name: 'Schmetterling', look: 'butterfly', price: 40 },
  { id: 'buddy-bird', slot: 'buddy', name: 'Vögelchen', look: 'bird', price: 50 },
  { id: 'buddy-cat', slot: 'buddy', name: 'Stallkatze', look: 'cat', price: 80 },
  { id: 'buddy-dog', slot: 'buddy', name: 'Hofhund', look: 'dog', price: 90 },
  { id: 'buddy-star', slot: 'buddy', name: 'Glücksstern', look: 'star', price: 120, requiresBadge: 'serie-7' },
  { id: 'buddy-bunny', slot: 'buddy', name: 'Häschen', look: 'bunny', price: 300 },
  { id: 'buddy-hedgehog', slot: 'buddy', name: 'Igel', look: 'hedgehog', price: 400 },
  { id: 'buddy-owl', slot: 'buddy', name: 'Schlaue Eule', look: 'owl', price: 550 },
  { id: 'buddy-fox', slot: 'buddy', name: 'Füchslein', look: 'fox', price: 650 },
  { id: 'buddy-penguin', slot: 'buddy', name: 'Pinguin', look: 'penguin', price: 800 },
  { id: 'buddy-dragon', slot: 'buddy', name: 'Mini-Drache', look: 'dragon', price: 1500, requiresBadge: 'duell-champion' },

  { id: 'bg-meadow', slot: 'background', name: 'Frühlingswiese', look: 'linear-gradient(160deg, #b8f28b, #4fae3b)', price: 25 },
  { id: 'bg-sky', slot: 'background', name: 'Himmelblau', look: 'linear-gradient(160deg, #a8e6ff, #1cb0f6)', price: 25 },
  { id: 'bg-sunset', slot: 'background', name: 'Sonnenuntergang', look: 'linear-gradient(160deg, #ffd23f, #ff7eb6 55%, #a560f0)', price: 60 },
  { id: 'bg-beach', slot: 'background', name: 'Strand', look: 'linear-gradient(180deg, #5ec8ff 0 55%, #ffe29a 55%)', price: 70 },
  { id: 'bg-night', slot: 'background', name: 'Sternennacht', look: 'radial-gradient(circle at 30% 30%, #fff 0 2px, transparent 3px), radial-gradient(circle at 70% 60%, #fff 0 1.5px, transparent 2.5px), linear-gradient(160deg, #3b3f8f, #141a4a)', price: 90 },
  { id: 'bg-rainbow', slot: 'background', name: 'Regenbogen', look: 'conic-gradient(from 200deg, #ff5a5f, #ff9f1c, #ffd23f, #58cc02, #1cb0f6, #a560f0, #ff5a5f)', price: 150 },
  { id: 'bg-gold', slot: 'background', name: 'Goldglanz', look: 'linear-gradient(135deg, #fff3b0, #ffc629 45%, #e0a000)', price: 150, requiresBadge: 'fehlerfrei' },
  {
    id: 'bg-flowers',
    slot: 'background',
    name: 'Blumenmeer',
    look: 'radial-gradient(circle at 25% 70%, #ff7eb6 0 4px, transparent 5px), radial-gradient(circle at 70% 78%, #ffe066 0 4px, transparent 5px), radial-gradient(circle at 50% 88%, #ffffff 0 3px, transparent 4px), linear-gradient(180deg, #bdf0ff 0 50%, #7fd65a 50%)',
    price: 350,
  },
  {
    id: 'bg-ocean',
    slot: 'background',
    name: 'Unterwasserwelt',
    look: 'radial-gradient(circle at 25% 35%, rgba(255,255,255,0.8) 0 3px, transparent 4px), radial-gradient(circle at 75% 20%, rgba(255,255,255,0.7) 0 2px, transparent 3px), linear-gradient(180deg, #5ee0f0, #1c7fd6 60%, #0b3f8a)',
    price: 500,
  },
  {
    id: 'bg-aurora',
    slot: 'background',
    name: 'Polarlicht',
    look: 'linear-gradient(200deg, transparent 20%, rgba(88,204,2,0.75) 40%, transparent 60%), linear-gradient(160deg, transparent 30%, rgba(165,96,240,0.8) 55%, transparent 75%), linear-gradient(180deg, #0b1440, #1a2a6c)',
    price: 700,
  },
  {
    id: 'bg-galaxy',
    slot: 'background',
    name: 'Galaxie',
    look: 'radial-gradient(circle at 20% 25%, #fff 0 1.5px, transparent 2.5px), radial-gradient(circle at 80% 40%, #fff 0 2px, transparent 3px), radial-gradient(circle at 45% 80%, #fff 0 1.5px, transparent 2.5px), radial-gradient(ellipse at 60% 55%, #ff7eb6 0, #a560f0 30%, transparent 60%), linear-gradient(160deg, #1a0b3d, #3b1a7a)',
    price: 1000,
  },
  {
    id: 'bg-diamond',
    slot: 'background',
    name: 'Diamantglanz',
    look: 'conic-gradient(from 45deg, #e8f7ff, #a8e6ff, #ffffff, #d8c8ff, #ffffff, #a8e6ff, #e8f7ff)',
    price: 2000,
    requiresBadge: 'allrounder',
  },
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
