import { missions, tracks } from '../game/missions'
import { isUnlocked } from '../game/progress'
import { walletOf } from '../game/rewards'
import type { Mission, Player } from '../game/types'
import { Avatar } from './Avatar'
import { Points, Rosettes } from './Icons'
import { SoundToggle } from './SoundToggle'

interface Props {
  player: Player
  /** Tournament whose path is shown; null shows the overview of all tournaments. */
  tournamentId: string | null
  onSelectTournament: (id: string | null) => void
  onStart: (mission: Mission) => void
  onSwitchPlayer: () => void
}

/** Horizontal position (in % of the width) of each station along the winding trail. */
const TRAIL_X = [28, 70, 34, 66, 28, 72, 34, 64, 28, 70]
const STATION_SPACING = 132
const TRAIL_PADDING = 84

function trailPath(points: { x: number; y: number }[]): string {
  return points
    .map((point, i) => {
      if (i === 0) return `M ${point.x} ${point.y}`
      const previous = points[i - 1]
      const midY = (previous.y + point.y) / 2
      return `C ${previous.x} ${midY}, ${point.x} ${midY}, ${point.x} ${point.y}`
    })
    .join(' ')
}

export function MissionMap({ player, tournamentId, onSelectTournament, onStart, onSwitchPlayer }: Props) {
  const selected = tracks.find((track) => track.id === tournamentId)

  return (
    <main className="screen">
      <header className="topbar">
        <button className="player-chip" onClick={onSwitchPlayer} title="Spieler wechseln">
          <Avatar player={player} size={44} />
          <span>{player.name}</span>
        </button>
        <span className="topbar-end">
          <SoundToggle />
          <span className="points-badge" title="Hufeisen im Beutel">
            <Points value={walletOf(player)} />
          </span>
        </span>
      </header>

      {!selected && (
        <>
          <header className="page-title">
            <h1>🏇 Turniere</h1>
            <p className="on-sky">Wähle dein Turnier!</p>
          </header>
          <ul className="tournament-grid">
            {tracks.map((track) => {
              const trackMissions = missions.filter((mission) => mission.track === track.id)
              const done = trackMissions.filter((mission) => player.missions[mission.id]?.passed).length
              const rosettes = trackMissions.reduce((sum, mission) => sum + (player.missions[mission.id]?.bestRosettes ?? 0), 0)
              return (
                <li key={track.id}>
                  <button className={`tournament-card theme-${track.id} ${done === trackMissions.length ? 'complete' : ''}`} onClick={() => onSelectTournament(track.id)}>
                    <span className="tournament-icon" aria-hidden="true">
                      {track.icon}
                    </span>
                    <span className="tournament-text">
                      <small>{track.subject}</small>
                      <strong>{track.title}</strong>
                      <span className="tournament-progress" aria-label={`${done} von ${trackMissions.length} geschafft`}>
                        <span style={{ width: `${(done / trackMissions.length) * 100}%` }} />
                      </span>
                      <span className="tournament-meta">
                        {done}/{trackMissions.length} geschafft · 🎀 {rosettes}
                      </span>
                    </span>
                    {done === trackMissions.length && (
                      <span className="tournament-trophy" aria-label="Turnier gewonnen">
                        🏆
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </>
      )}

      {selected && (
        <button className="button pill back-to-tournaments" onClick={() => onSelectTournament(null)}>
          ← Alle Turniere
        </button>
      )}

      {tracks.filter((track) => track === selected).map((track) => {
        const trackMissions = missions.filter((mission) => mission.track === track.id)
        const done = trackMissions.filter((mission) => player.missions[mission.id]?.passed).length
        const current = trackMissions.find((mission) => isUnlocked(mission, player) && !player.missions[mission.id]?.passed)
        const height = TRAIL_PADDING + 64 + (trackMissions.length - 1) * STATION_SPACING
        const points = trackMissions.map((_, i) => ({ x: TRAIL_X[i % TRAIL_X.length], y: TRAIL_PADDING + i * STATION_SPACING }))
        const path = trailPath(points)

        return (
          <section key={track.id} className={`track theme-${track.id}`}>
            <header className="track-banner">
              <span className="track-icon" aria-hidden="true">
                {track.icon}
              </span>
              <div>
                <h2>{track.title}</h2>
                <p>{track.tagline}</p>
              </div>
              <span className="track-count">
                {done}/{trackMissions.length}
                <small>geschafft</small>
              </span>
            </header>

            <div className="trail" style={{ height }}>
              <svg className="trail-line" viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" aria-hidden="true">
                <path className="trail-bed" d={path} />
                <path className="trail-dash" d={path} />
              </svg>
              <ol className="sr-only-list">
                {trackMissions.map((mission, i) => {
                  const unlocked = isUnlocked(mission, player)
                  const progress = player.missions[mission.id]
                  const isCurrent = mission === current
                  const { x, y } = points[i]
                  return (
                    <li
                      key={mission.id}
                      className={`station ${x > 50 ? 'label-left' : ''} ${unlocked ? '' : 'locked'}`}
                      style={{ left: `${x}%`, top: y }}
                    >
                      <button
                        className={`node ${progress?.passed ? 'passed' : ''} ${isCurrent ? 'current' : ''}`}
                        disabled={!unlocked}
                        onClick={() => onStart(mission)}
                        aria-label={`${mission.title}${unlocked ? '' : ' (noch gesperrt)'}`}
                      >
                        {isCurrent && (
                          <span className="here" aria-hidden="true">
                            {player.avatar}
                          </span>
                        )}
                        <span aria-hidden="true">{!unlocked ? '🔒' : progress?.passed ? '★' : i + 1}</span>
                      </button>
                      <span className="station-label">
                        <strong>{mission.title}</strong>
                        <span>{mission.subtitle}</span>
                        {progress && <Rosettes count={progress.bestRosettes} size={16} />}
                      </span>
                    </li>
                  )
                })}
              </ol>
            </div>
          </section>
        )
      })}
    </main>
  )
}
