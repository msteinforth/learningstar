import { missions, tracks } from '../game/missions'
import { isUnlocked } from '../game/progress'
import type { Mission, Player } from '../game/types'
import { Avatar } from './Avatar'
import { Points, Rosettes } from './Icons'

interface Props {
  player: Player
  onStart: (mission: Mission) => void
  onSwitchPlayer: () => void
}

export function MissionMap({ player, onStart, onSwitchPlayer }: Props) {
  return (
    <main className="screen">
      <header className="topbar">
        <button className="player-chip" onClick={onSwitchPlayer} title="Spieler wechseln">
          <Avatar player={player} size={40} />
          <span>{player.name}</span>
        </button>
        <Points value={player.totalPoints} />
      </header>

      {tracks.map((track) => {
        const trackMissions = missions.filter((mission) => mission.track === track.id)
        const done = trackMissions.filter((mission) => player.missions[mission.id]?.passed).length
        return (
          <section key={track.id} className="track">
            <h2>
              <span aria-hidden="true">{track.icon}</span> {track.title}
              <small>
                {done} / {trackMissions.length}
              </small>
            </h2>
            <ol className="mission-path">
              {trackMissions.map((mission, index) => {
                const unlocked = isUnlocked(mission, player)
                const progress = player.missions[mission.id]
                return (
                  <li key={mission.id}>
                    <button className={`card mission-card ${progress?.passed ? 'passed' : ''}`} disabled={!unlocked} onClick={() => onStart(mission)}>
                      <span className="mission-step" aria-hidden="true">
                        {unlocked ? index + 1 : '🔒'}
                      </span>
                      <span className="mission-text">
                        <strong>{mission.title}</strong>
                        <span>{mission.subtitle}</span>
                      </span>
                      {progress && <Rosettes count={progress.bestRosettes} size={18} />}
                    </button>
                  </li>
                )
              })}
            </ol>
          </section>
        )
      })}
    </main>
  )
}
