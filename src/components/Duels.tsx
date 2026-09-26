import { useState } from 'react'
import { duelOutcome, openChallenges } from '../game/duels'
import { findTrack, tracks } from '../game/missions'
import { isUnlocked } from '../game/progress'
import type { Duel, Mission, Player } from '../game/types'
import { Avatar } from './Avatar'
import { Horseshoe } from './Icons'
import { GameIcon } from './GameIcon'

interface Props {
  player: Player
  players: Player[]
  duels: Duel[]
  /** Built-in and parents' missions. */
  missions: Mission[]
  loadError: string | null
  onChallenge: (opponent: Player, mission: Mission) => void
  onAnswer: (duel: Duel) => void
  onReload: () => void
}

function MissionLabel({ mission }: { mission: Mission }) {
  const track = findTrack(mission.track)
  return (
    <span className="duel-mission">
      {track && <GameIcon name={track.icon} className="inline-icon" />} {mission.title}
    </span>
  )
}

export function Duels({ player, players, duels, missions, loadError, onChallenge, onAnswer, onReload }: Props) {
  const [creating, setCreating] = useState(false)
  const [opponentId, setOpponentId] = useState<string | null>(null)
  const [trackId, setTrackId] = useState<string>(tracks[0].id)

  const others = players.filter((candidate) => candidate.id !== player.id)
  const byId = (id: string) => players.find((candidate) => candidate.id === id)
  const mine = duels.filter((duel) => duel.challengerId === player.id || duel.opponentId === player.id)
  const incoming = openChallenges(duels, player.id)
  const waiting = mine.filter((duel) => duel.challengerId === player.id && !duel.opponentResult)
  const finished = mine.filter((duel) => duel.opponentResult).slice(0, 10)
  const opponent = opponentId ? byId(opponentId) : undefined
  const choices = missions.filter((mission) => mission.track === trackId && isUnlocked(mission, player))

  return (
    <main className="screen duels">
      <header className="topbar">
        <span />
        <button className="button pill" onClick={onReload} aria-label="Aktualisieren">
          ↻ Aktualisieren
        </button>
      </header>
      <header className="page-title">
        <h1>
          <GameIcon name="swords" className="inline-icon" /> Duelle
        </h1>
        <p className="on-sky">Fordere deine Geschwister heraus – gleiche Aufgaben, wer holt mehr Hufeisen?</p>
      </header>

      {loadError && (
        <div className="card notice error">
          <p>{loadError}</p>
          <button className="button secondary" onClick={onReload}>
            Nochmal versuchen
          </button>
        </div>
      )}

      {incoming.length > 0 && (
        <section className="duel-section">
          <h2 className="section-title on-sky">Herausforderungen an dich</h2>
          {incoming.map((duel) => {
            const challenger = byId(duel.challengerId)
            return (
              <article key={duel.id} className="card duel-card incoming">
                {challenger && <Avatar player={challenger} size={60} />}
                <div className="duel-text">
                  <strong>{challenger?.name ?? 'Jemand'} fordert dich heraus!</strong>
                  <MissionLabel mission={duel.mission} />
                  <span className="duel-target">
                    Schlage <Horseshoe size={16} /> {duel.challengerResult.points}
                  </span>
                </div>
                <button className="button primary" onClick={() => onAnswer(duel)}>
                  Annehmen <GameIcon name="swords" className="inline-icon" />
                </button>
              </article>
            )
          })}
        </section>
      )}

      {others.length === 0 ? (
        <p className="card panel hint">
          Für ein Duell braucht ihr mindestens zwei Spieler. Legt im Stall einen weiteren an oder verbindet eure Geräte über „Auf mehreren Geräten spielen“.
        </p>
      ) : !creating ? (
        <button className="button primary new-duel" onClick={() => setCreating(true)}>
          + Neues Duell
        </button>
      ) : (
        <section className="card panel duel-wizard">
          <h2>Neues Duell</h2>
          <fieldset>
            <legend>1. Wen forderst du heraus?</legend>
            <div className="opponent-row">
              {others.map((other) => (
                <button key={other.id} className={`opponent ${opponentId === other.id ? 'selected' : ''}`} aria-pressed={opponentId === other.id} onClick={() => setOpponentId(other.id)}>
                  <Avatar player={other} size={60} />
                  <span>{other.name}</span>
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>2. Welches Turnier?</legend>
            <div className="chip-row">
              {tracks.map((track) => (
                <button key={track.id} className={`chip theme-${track.id} ${trackId === track.id ? 'selected' : ''}`} aria-pressed={trackId === track.id} onClick={() => setTrackId(track.id)}>
                  <GameIcon name={track.icon} className="inline-icon" /> {track.subject}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>3. Welche Mission?</legend>
            <div className="duel-missions">
              {choices.map((mission) => (
                <button
                  key={mission.id}
                  className={`card duel-mission-choice theme-${mission.track}`}
                  disabled={!opponent}
                  onClick={() => opponent && onChallenge(opponent, mission)}
                >
                  <strong>{mission.title}</strong>
                  <small>{mission.subtitle}</small>
                </button>
              ))}
            </div>
            <small className="field-help">{opponent ? 'Tippe auf eine Mission – du spielst zuerst!' : 'Wähle zuerst, wen du herausforderst.'}</small>
          </fieldset>
          <button className="button secondary" onClick={() => setCreating(false)}>
            Abbrechen
          </button>
        </section>
      )}

      {waiting.length > 0 && (
        <section className="duel-section">
          <h2 className="section-title on-sky">Warten auf Antwort</h2>
          {waiting.map((duel) => {
            const other = byId(duel.opponentId)
            return (
              <article key={duel.id} className="card duel-card waiting">
                {other && <Avatar player={other} size={48} />}
                <div className="duel-text">
                  <strong>{other?.name ?? 'Jemand'} ist dran …</strong>
                  <MissionLabel mission={duel.mission} />
                </div>
                <span className="duel-score">
                  <Horseshoe size={18} /> {duel.challengerResult.points}
                </span>
              </article>
            )
          })}
        </section>
      )}

      {finished.length > 0 && (
        <section className="duel-section">
          <h2 className="section-title on-sky">Ergebnisse</h2>
          {finished.map((duel) => {
            const outcome = duelOutcome(duel)
            const winnerId = outcome.status === 'done' ? outcome.winnerId : null
            const iWon = winnerId === player.id
            const otherId = duel.challengerId === player.id ? duel.opponentId : duel.challengerId
            const other = byId(otherId)
            const sides = [
              { id: duel.challengerId, result: duel.challengerResult },
              { id: duel.opponentId, result: duel.opponentResult! },
            ]
            return (
              <article key={duel.id} className={`card duel-result ${iWon ? 'won' : winnerId ? 'lost' : 'draw'}`}>
                <span className="duel-verdict">
                  {iWon && <GameIcon name="trophy" className="inline-icon" />}
                  {!winnerId && <GameIcon name="equal" className="inline-icon" />} {iWon ? 'Gewonnen!' : winnerId ? 'Knapp daneben' : 'Unentschieden'}
                </span>
                <MissionLabel mission={duel.mission} />
                <div className="versus">
                  {sides.map((side, i) => {
                    const who = byId(side.id)
                    return (
                      <div key={side.id} className={`side ${winnerId === side.id ? 'winner' : ''}`}>
                        {winnerId === side.id && <GameIcon name="crown" className="crown" size={26} />}
                        {who && <Avatar player={who} size={52} />}
                        <span className="side-name">{who?.name ?? '?'}</span>
                        <span className="side-points">
                          <Horseshoe size={16} /> {side.result.points}
                        </span>
                        {i === 0 && <span className="vs">VS</span>}
                      </div>
                    )
                  })}
                </div>
                {other && (
                  <button className="button small secondary" onClick={() => onChallenge(other, duel.mission)}>
                    <GameIcon name="repeat" className="inline-icon" /> Revanche
                  </button>
                )}
              </article>
            )
          })}
        </section>
      )}
    </main>
  )
}
