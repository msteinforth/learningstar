import { missions } from '../game/missions'
import type { Badge } from '../game/rewards'
import type { Mission, MissionResult, Player } from '../game/types'
import { PlayerHorse } from './Avatar'
import { Confetti } from './Confetti'
import { Points, Rosettes } from './Icons'

export type SaveState = { status: 'saving' } | { status: 'saved'; badges: Badge[] } | { status: 'error'; message: string }

interface Props {
  mission: Mission
  result: MissionResult
  player: Player
  /** Whether this run passed the mission for the first time. */
  firstPass: boolean
  save: SaveState
  onRetrySave: () => void
  onReplay: () => void
  onBack: () => void
  onNext: (mission: Mission) => void
}

const HEADLINES = ['Weiter üben – du schaffst das!', 'Geschafft!', 'Stark geritten!', 'Fehlerfreier Ritt!']

export function MissionResultView({ mission, result, player, firstPass, save, onRetrySave, onReplay, onBack, onNext }: Props) {
  const correct = result.results.filter((task) => task.correct).length
  const nextMission = missions.find((candidate) => candidate.requires === mission.id)

  return (
    <main className={`screen result theme-${mission.track}`}>
      {result.passed && <Confetti pieces={result.rosettes * 30} />}
      <section className="card result-card">
        <span className="result-hero" aria-hidden="true">
          <PlayerHorse avatar={player.avatar} width={150} running={result.passed} />
          {result.rosettes === 3 && <span className="result-trophy">🏆</span>}
        </span>
        <p className="result-kicker">{mission.title}</p>
        <h1>{result.passed ? HEADLINES[result.rosettes] : HEADLINES[0]}</h1>
        <Rosettes count={result.rosettes} size={64} />
        <dl className="stats">
          <div>
            <dt>Hufeisen</dt>
            <dd>
              <Points value={result.points} /> <small>von {result.maxPoints}</small>
            </dd>
          </div>
          <div>
            <dt>Richtig</dt>
            <dd>
              {correct} / {result.results.length}
            </dd>
          </div>
          <div>
            <dt>Gesamt</dt>
            <dd>{save.status === 'saved' ? <Points value={player.totalPoints} /> : '…'}</dd>
          </div>
        </dl>
        {save.status === 'saving' && <p className="hint">Hufeisen werden gespeichert …</p>}
        {save.status === 'error' && (
          <div className="notice error">
            <p>Deine Hufeisen konnten noch nicht gespeichert werden. {save.message}</p>
            <button className="button primary" onClick={onRetrySave}>
              Nochmal speichern
            </button>
          </div>
        )}
        {save.status === 'saved' &&
          save.badges.map((badge, i) => (
            <div key={badge.id} className="new-badge" style={{ animationDelay: `${0.8 + i * 0.3}s` }}>
              <span className="medal" aria-hidden="true">
                {badge.icon}
              </span>
              <span>
                <small>Neues Abzeichen!</small>
                <strong>{badge.title}</strong>
              </span>
            </div>
          ))}
        {firstPass && nextMission && (
          <p className="unlock">
            🔓 Neue Mission freigeschaltet: <strong>{nextMission.title}</strong>
          </p>
        )}
        {!result.passed && <p className="hint">Sammle mindestens {Math.round((mission.passRatio ?? 0.6) * 100)} % der Hufeisen, um die nächste Mission freizuschalten.</p>}
        <div className="actions">
          <button className="button secondary" onClick={onBack}>
            Zum Hof
          </button>
          <button className="button secondary" onClick={onReplay}>
            Nochmal
          </button>
          {result.passed && nextMission && save.status === 'saved' && (
            <button className="button primary" onClick={() => onNext(nextMission)}>
              Nächste Mission →
            </button>
          )}
        </div>
      </section>
    </main>
  )
}
