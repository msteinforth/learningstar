export type NavTarget = 'map' | 'shop' | 'badges' | 'leaderboard'

const ITEMS: { id: NavTarget; label: string; icon: string }[] = [
  { id: 'map', label: 'Hof', icon: '🗺️' },
  { id: 'shop', label: 'Laden', icon: '🛍️' },
  { id: 'badges', label: 'Abzeichen', icon: '🏅' },
  { id: 'leaderboard', label: 'Rangliste', icon: '🏆' },
]

export function BottomNav({ active, onNavigate, badgeHint }: { active: NavTarget; onNavigate: (target: NavTarget) => void; badgeHint?: number }) {
  return (
    <nav className="bottom-nav" aria-label="Hauptmenü">
      {ITEMS.map((item) => (
        <button key={item.id} className={item.id === active ? 'active' : ''} aria-current={item.id === active ? 'page' : undefined} onClick={() => onNavigate(item.id)}>
          <span className="nav-icon" aria-hidden="true">
            {item.icon}
          </span>
          {item.label}
          {item.id === 'badges' && badgeHint ? <span className="nav-dot">{badgeHint}</span> : null}
        </button>
      ))}
    </nav>
  )
}
