import { GameIcon } from './GameIcon'

export type NavTarget = 'map' | 'duels' | 'shop' | 'badges' | 'leaderboard'

const ITEMS: { id: NavTarget; label: string; icon: string }[] = [
  { id: 'map', label: 'Hof', icon: 'map' },
  { id: 'duels', label: 'Duelle', icon: 'swords' },
  { id: 'shop', label: 'Laden', icon: 'bag' },
  { id: 'badges', label: 'Abzeichen', icon: 'medal' },
  { id: 'leaderboard', label: 'Rangliste', icon: 'trophy' },
]

/** `hints` shows a small red counter on an item, e.g. open duel challenges. */
export function BottomNav({ active, onNavigate, hints = {} }: { active: NavTarget; onNavigate: (target: NavTarget) => void; hints?: Partial<Record<NavTarget, number>> }) {
  return (
    <nav className="bottom-nav" aria-label="Hauptmenü">
      {ITEMS.map((item) => (
        <button key={item.id} className={item.id === active ? 'active' : ''} aria-current={item.id === active ? 'page' : undefined} onClick={() => onNavigate(item.id)}>
          <GameIcon name={item.icon} className="nav-icon" size={30} />
          {item.label}
          {hints[item.id] ? (
            <span className="nav-dot" aria-label={`${hints[item.id]} neu`}>
              {hints[item.id]}
            </span>
          ) : null}
        </button>
      ))}
    </nav>
  )
}
