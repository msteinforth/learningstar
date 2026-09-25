import { type CSSProperties, type FormEvent, useState } from 'react'
import type { Player } from '../game/types'
import { AVATARS, COLORS } from '../game/avatars'
import { Avatar } from './Avatar'
import { Points } from './Icons'

interface Props {
  /** null while loading. */
  players: Player[] | null
  loadError: string | null
  familyName: string | null
  onRetry: () => void
  onSelect: (player: Player) => void
  onCreate: (name: string, avatar: string, color: string) => Promise<void>
  /** Opens the family settings; missing when no family server is set up. */
  onOpenFamily?: () => void
}

export function PlayerSelect({ players, loadError, familyName, onRetry, onSelect, onCreate, onOpenFamily }: Props) {
  const [wantsForm, setWantsForm] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState(AVATARS[0])
  const [color, setColor] = useState(COLORS[0])

  const creating = wantsForm || players?.length === 0

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) return
    setBusy(true)
    setError(null)
    try {
      await onCreate(name, avatar, color)
      setName('')
      setWantsForm(false)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setBusy(false)
    }
  }

  if (loadError) {
    return (
      <main className="screen">
        <div className="card notice error">
          <p>{loadError}</p>
          <div className="actions">
            <button className="button primary" onClick={onRetry}>
              Nochmal versuchen
            </button>
            {onOpenFamily && (
              <button className="button secondary" onClick={onOpenFamily}>
                Familie
              </button>
            )}
          </div>
        </div>
      </main>
    )
  }

  if (!players) {
    return (
      <main className="screen">
        <p className="hint center">Lade Spieler …</p>
      </main>
    )
  }

  return (
    <main className="screen">
      <header className="hero">
        <span className="logo-horse" aria-hidden="true">
          🐴
        </span>
        <h1 className="logo">
          Learning<span className="logo-star">★</span>Star
        </h1>
        <p className="on-sky">Willkommen im Stall! Wer reitet heute?</p>
        {familyName && <p className="family-badge">🏡 {familyName}</p>}
      </header>

      {players.length > 0 && (
        <ul className="player-list">
          {players.map((player) => (
            <li key={player.id}>
              <button className="player-card" style={{ '--player': player.color } as CSSProperties} onClick={() => onSelect(player)}>
                <Avatar player={player} size={64} />
                <span className="player-name">
                  {player.name}
                  <Points value={player.totalPoints} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {creating ? (
        <form className="card create-form" onSubmit={submit}>
          <h2>Neues Pferd in den Stall</h2>
          {error && <p className="notice error">{error}</p>}
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
              <button type="button" className="button secondary" onClick={() => setWantsForm(false)}>
                Abbrechen
              </button>
            )}
            <button type="submit" className="button primary" disabled={busy || !name.trim()}>
              Los geht's!
            </button>
          </div>
        </form>
      ) : (
        <button className="button primary new-player" onClick={() => setWantsForm(true)}>
          + Neuer Spieler
        </button>
      )}

      {onOpenFamily && (
        <button className="button pill new-player" onClick={onOpenFamily}>
          {familyName ? '🏡 Familien-Code anzeigen' : '🏡 Auf mehreren Geräten spielen'}
        </button>
      )}
    </main>
  )
}
