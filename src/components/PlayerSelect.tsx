import { type FormEvent, useState } from 'react'
import type { Player } from '../game/types'
import { AVATARS, COLORS } from '../game/avatars'
import { Avatar } from './Avatar'
import { Points } from './Icons'

interface Props {
  players: Player[]
  onSelect: (player: Player) => void
  onCreate: (name: string, avatar: string, color: string) => void
}

export function PlayerSelect({ players, onSelect, onCreate }: Props) {
  const [creating, setCreating] = useState(players.length === 0)
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState(AVATARS[0])
  const [color, setColor] = useState(COLORS[0])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) return
    onCreate(name, avatar, color)
    setName('')
    setCreating(false)
  }

  return (
    <main className="screen">
      <header className="hero">
        <h1>
          <span aria-hidden="true">🐴</span> LearningStar
        </h1>
        <p>Willkommen im Stall! Wer reitet heute?</p>
      </header>

      {players.length > 0 && (
        <ul className="player-list">
          {players.map((player) => (
            <li key={player.id}>
              <button className="card player-card" onClick={() => onSelect(player)}>
                <Avatar player={player} />
                <span className="player-name">{player.name}</span>
                <Points value={player.totalPoints} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {creating ? (
        <form className="card create-form" onSubmit={submit}>
          <h2>Neues Pferd in den Stall</h2>
          <label>
            Dein Name
            <input value={name} onChange={(event) => setName(event.target.value)} maxLength={20} autoFocus placeholder="z. B. Lena" />
          </label>
          <fieldset>
            <legend>Dein Tier</legend>
            <div className="options">
              {AVATARS.map((option) => (
                <button type="button" key={option} className={`option ${option === avatar ? 'selected' : ''}`} onClick={() => setAvatar(option)} aria-pressed={option === avatar}>
                  {option}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>Deine Farbe</legend>
            <div className="options">
              {COLORS.map((option) => (
                <button
                  type="button"
                  key={option}
                  className={`option swatch ${option === color ? 'selected' : ''}`}
                  style={{ background: option }}
                  onClick={() => setColor(option)}
                  aria-label={`Farbe ${option}`}
                  aria-pressed={option === color}
                />
              ))}
            </div>
          </fieldset>
          <div className="preview">
            <Avatar player={{ avatar, color }} size={72} />
            <strong>{name.trim() || 'Dein Name'}</strong>
          </div>
          <div className="actions">
            {players.length > 0 && (
              <button type="button" className="button secondary" onClick={() => setCreating(false)}>
                Abbrechen
              </button>
            )}
            <button type="submit" className="button primary" disabled={!name.trim()}>
              Los geht's!
            </button>
          </div>
        </form>
      ) : (
        <button className="button secondary" onClick={() => setCreating(true)}>
          + Neuer Spieler
        </button>
      )}
    </main>
  )
}
