import { useEffect, useState } from 'react'
import type { LeaderboardEntry, PlayerStore } from '../game/storage'
import type { Player } from '../game/types'
import { Avatar } from './Avatar'
import { Points } from './Icons'

interface Props {
  store: PlayerStore
  player: Player
  familyName: string | null
}

type Period = 'week' | 'total'
type State = { status: 'loading' } | { status: 'error'; message: string } | { status: 'ready'; entries: LeaderboardEntry[] }

export function Leaderboard({ store, player, familyName }: Props) {
  const [period, setPeriod] = useState<Period>('week')
  const [state, setState] = useState<State>({ status: 'loading' })
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let active = true
    store.leaderboard().then(
      (entries) => active && setState({ status: 'ready', entries }),
      (error: Error) => active && setState({ status: 'error', message: error.message }),
    )
    return () => {
      active = false
    }
  }, [store, reload])

  const refresh = () => {
    setState({ status: 'loading' })
    setReload((count) => count + 1)
  }

  const pointsOf = (entry: LeaderboardEntry) => (period === 'week' ? entry.weekPoints : entry.totalPoints)
  const ranked = state.status === 'ready' ? [...state.entries].sort((a, b) => pointsOf(b) - pointsOf(a)) : []
  // Players with the same points share a place.
  const placeOf = (entry: LeaderboardEntry) => ranked.findIndex((other) => pointsOf(other) === pointsOf(entry))

  return (
    <main className="screen">
      <header className="topbar">
        <span />
        <button className="button pill" onClick={refresh} disabled={state.status === 'loading'} aria-label="Aktualisieren">
          ↻ Aktualisieren
        </button>
      </header>

      <header className="page-title">
        <h1>🏆 Rangliste</h1>
        <p className="on-sky">{familyName ?? 'Alle Spieler auf diesem Gerät'}</p>
      </header>

      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={period === 'week'} className={period === 'week' ? 'active' : ''} onClick={() => setPeriod('week')}>
          Diese Woche
        </button>
        <button role="tab" aria-selected={period === 'total'} className={period === 'total' ? 'active' : ''} onClick={() => setPeriod('total')}>
          Gesamt
        </button>
      </div>

      {state.status === 'loading' && <p className="hint center">Lade Rangliste …</p>}
      {state.status === 'error' && (
        <div className="card notice error">
          <p>{state.message}</p>
          <button className="button secondary" onClick={refresh}>
            Nochmal versuchen
          </button>
        </div>
      )}
      {state.status === 'ready' && (
        <>
          <ol className="podium" aria-label="Siegertreppchen">
            {ranked.slice(0, 3).map((entry, slot) => {
              const place = placeOf(entry)
              return (
                <li key={entry.playerId} className={`podium-spot place-${slot + 1} ${entry.playerId === player.id ? 'me' : ''}`}>
                  {slot === 0 && pointsOf(entry) > 0 && (
                    <span className="crown" aria-hidden="true">
                      👑
                    </span>
                  )}
                  <Avatar player={entry} size={slot === 0 ? 72 : 58} />
                  <span className="podium-name">
                    {entry.name}
                    {entry.playerId === player.id && <small> (du)</small>}
                  </span>
                  <span className="podium-block">
                    <span className="place-number" aria-label={`Platz ${place + 1}`}>
                      {place + 1}
                    </span>
                    <Points value={pointsOf(entry)} />
                  </span>
                </li>
              )
            })}
          </ol>
          {ranked.length > 3 && (
            <ol className="ranking" start={4}>
              {ranked.slice(3).map((entry) => (
                <li key={entry.playerId} className={`card rank-row ${entry.playerId === player.id ? 'me' : ''}`}>
                  <span className="place" aria-label={`Platz ${placeOf(entry) + 1}`}>
                    {placeOf(entry) + 1}
                  </span>
                  <Avatar player={entry} size={44} />
                  <span className="player-name">
                    {entry.name}
                    {entry.playerId === player.id && <small> (du)</small>}
                  </span>
                  <Points value={pointsOf(entry)} />
                </li>
              ))}
            </ol>
          )}
        </>
      )}
      {period === 'week' && state.status === 'ready' && (
        <p className="leaderboard-hint">🗓️ Jeden Montag beginnt eine neue Woche – dann hat jeder wieder die Chance auf Platz 1!</p>
      )}
    </main>
  )
}
