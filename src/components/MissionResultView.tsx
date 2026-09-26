import { missions } from '../game/missions'
import { duelOutcome } from '../game/duels'
import type { Badge } from '../game/rewards'
import type { Duel, Mission, MissionResult, Player } from '../game/types'
import { PlayerHorse } from './Avatar'
import { Confetti } from './Confetti'
import { Points, Rosettes } from './Icons'
import { GameIcon } from './GameIcon'

/** A mission played as part of a duel: either starting a challenge or answering one. */
export type DuelPlay =
  | { kind: 'challenge'; mission: Mission; seed: number; challengerId: string; opponent: Player }
  | { kind: 'answer'; duel: Duel; seed: number }

export type DuelSaveState = { status: 'saving' } | { status: 'saved'; duel: Duel } | { status: 'error'; message: string }

export type SaveState = { status: 'saving' } | { status: 'saved'; badges: Badge[] } | { status: 'error'; message: string }

interface Props {
  mission: Mission
  result: MissionResult
  player: Player
  /** Whether this run passed the mission for the first time. */
  firstPass: boolean
  save: SaveState
  duel?: DuelPlay
  duelSave?: DuelSaveState
  /** Everyone in the family (for names in duel results). */
  players: Player[]
  onRetrySave: () => void
  onRetryDuel: () => void
  onReplay: () => void
  onBack: () => void
  onNext: (mission: Mission) => void
}

const HEADLINES = ['Weiter üben – du schaffst das!', 'Geschafft!', 'Stark geritten!', 'Fehlerfreier Ritt!']

export function MissionResultView({ mission, result, player, firstPass, save, duel, duelSave, players, onRetrySave, onRetryDuel, onReplay, onBack, onNext }: Props) {
  const correct = result.results.filter((task) => task.correct).length
  const nextMission = missions.find((candidate) => candidate.requires === mission.id)

  return (
    <main className={`screen result theme-${mission.track}`}>
      {result.passed && <Confetti pieces={result.rosettes * 30} />}
      <section className="card result-card">
        <span className="result-hero" aria-hidden="true">
          <PlayerHorse avatar={player.avatar} width={150} running={result.passed} />
          {result.rosettes === 3 && <GameIcon name="trophy" className="result-trophy" size={56} />}
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
                <GameIcon name={badge.icon} size="72%" />
              </span>
              <span>
                <small>Neues Abzeichen!</small>
                <strong>{badge.title}</strong>
              </span>
            </div>
          ))}
        {duel && duelSave && <DuelSummary duel={duel} state={duelSave} player={player} players={players} onRetry={onRetryDuel} />}
        {firstPass && nextMission && (
          <p className="unlock">
            <GameIcon name="lock-open" className="inline-icon" /> Neue Mission freigeschaltet: <strong>{nextMission.title}</strong>
          </p>
        )}
        {!duel && !result.passed && <p className="hint">Sammle mindestens {Math.round((mission.passRatio ?? 0.6) * 100)} % der Hufeisen, um die nächste Mission freizuschalten.</p>}
        {duel ? (
          <div className="actions">
            <button className="button primary" onClick={onBack}>
              <GameIcon name="swords" className="inline-icon" /> Zu den Duellen
            </button>
          </div>
        ) : (
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
        )}
      </section>
    </main>
  )
}

function DuelSummary({ duel, state, player, players, onRetry }: { duel: DuelPlay; state: DuelSaveState; player: Player; players: Player[]; onRetry: () => void }) {
  if (state.status === 'saving') return <p className="hint">Duell wird gespeichert …</p>
  if (state.status === 'error') {
    return (
      <div className="notice error">
        <p>Das Duell konnte noch nicht gespeichert werden. {state.message}</p>
        <button className="button primary" onClick={onRetry}>
          Nochmal speichern
        </button>
      </div>
    )
  }
  const saved = state.duel
  if (duel.kind === 'challenge') {
    return (
      <p className="duel-note">
        <GameIcon name="swords" className="inline-icon" /> Herausforderung an <strong>{duel.opponent.name}</strong> verschickt! {duel.opponent.name} muss {saved.challengerResult.points} Hufeisen schlagen.
      </p>
    )
  }
  const outcome = duelOutcome(saved)
  const challenger = players.find((candidate) => candidate.id === saved.challengerId)
  const winnerId = outcome.status === 'done' ? outcome.winnerId : null
  const verdict = winnerId === player.id ? 'Du hast das Duell gewonnen!' : winnerId ? `${challenger?.name ?? 'Dein Gegner'} hat knapp gewonnen.` : 'Unentschieden!'
  return (
    <p className={`duel-note ${winnerId === player.id ? 'won' : ''}`}>
      <strong>
        {winnerId === player.id && <GameIcon name="trophy" className="inline-icon" />}
        {outcome.status === 'done' && !winnerId && <GameIcon name="equal" className="inline-icon" />} {verdict}
      </strong>
      <br />
      {challenger?.name ?? 'Gegner'}: {saved.challengerResult.points} · Du: {saved.opponentResult?.points ?? 0} Hufeisen
    </p>
  )
}
