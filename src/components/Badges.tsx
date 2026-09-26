import { BADGES, extrasOf } from '../game/rewards'
import type { Player } from '../game/types'
import { GameIcon } from './GameIcon'

export function Badges({ player }: { player: Player }) {
  const earned = extrasOf(player).badges
  const count = BADGES.filter((badge) => earned[badge.id]).length
  const streak = extrasOf(player).streak

  return (
    <main className="screen">
      <header className="page-title">
        <h1>
          <GameIcon name="medal" className="inline-icon" /> Abzeichen
        </h1>
        <p className="on-sky">
          {count} von {BADGES.length} gesammelt
        </p>
      </header>

      {streak.days > 0 && (
        <p className="card streak">
          <GameIcon name="fire" className="inline-icon" /> {streak.days === 1 ? 'Heute gespielt!' : `${streak.days} Tage in Folge gespielt!`}
        </p>
      )}

      <ul className="badge-grid">
        {BADGES.map((badge) => {
          const earnedAt = earned[badge.id]
          const { current, target } = badge.progress(player)
          return (
            <li key={badge.id} className={`card badge ${earnedAt ? 'earned' : ''}`}>
              <span className="medal" aria-hidden="true">
                <GameIcon name={badge.icon} size="70%" />
              </span>
              <strong>{badge.title}</strong>
              <span className="badge-text">{badge.description}</span>
              {earnedAt ? (
                <span className="badge-date">✓ {new Date(earnedAt).toLocaleDateString('de-DE')}</span>
              ) : (
                <span className="progress" aria-label={`${Math.min(current, target)} von ${target}`}>
                  <span className="progress-fill" style={{ width: `${Math.min(1, current / target) * 100}%` }} />
                  <span className="progress-text">
                    {Math.min(current, target)} / {target}
                  </span>
                </span>
              )}
            </li>
          )
        })}
      </ul>
    </main>
  )
}
