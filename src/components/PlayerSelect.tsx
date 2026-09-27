import { type CSSProperties, type FormEvent, useState } from 'react'
import type { Player, PlayerExtras, PlayerProfile } from '../game/types'
import { AVATARS, COLORS } from '../game/avatars'
import { PIN_PATTERN } from '../game/pin'
import { Avatar } from './Avatar'
import { HORSES, horseFor } from '../game/horses'
import { HorseHead, HorseSide } from './Horse'
import { Points } from './Icons'
import { GameIcon } from './GameIcon'

interface Props {
  /** null while loading. */
  players: Player[] | null
  loadError: string | null
  familyName: string | null
  onRetry: () => void
  onSelect: (player: Player) => void
  /** Creates a player; with `pin` the horse is protected right away. */
  onCreate: (profile: PlayerProfile, pin: string | null) => Promise<void>
  onCheckPin: (player: Player, pin: string) => Promise<boolean>
  /** `pin` is the current PIN (null without one); `newPin` undefined keeps it, null removes it. */
  onEdit: (player: Player, pin: string | null, profile: PlayerProfile, newPin: string | null | undefined) => Promise<void>
  /** Opens the family settings; missing when no family server is set up. */
  onOpenFamily?: () => void
  onOpenParents: () => void
}

type Mode =
  | { kind: 'list' }
  | { kind: 'create' }
  | { kind: 'pin'; player: Player; next: 'play' | 'edit' }
  | { kind: 'edit'; player: Player; pin: string | null }

const errorText = (error: unknown) => (error instanceof Error ? error.message : String(error))

export function PlayerSelect({ players, loadError, familyName, onRetry, onSelect, onCreate, onCheckPin, onEdit, onOpenFamily, onOpenParents }: Props) {
  const [mode, setMode] = useState<Mode>({ kind: 'list' })

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

  const toList = () => setMode({ kind: 'list' })
  const open = (player: Player, next: 'play' | 'edit') => {
    if (player.hasPin) setMode({ kind: 'pin', player, next })
    else if (next === 'play') onSelect(player)
    else setMode({ kind: 'edit', player, pin: null })
  }

  const creating = mode.kind === 'create' || players.length === 0

  return (
    <main className="screen">
      <header className="hero">
        <HorseSide horse={HORSES[4]} width={150} running className="logo-horse" />
        <h1 className="logo">
          Learning<span className="logo-star">★</span>Star
        </h1>
        <p className="on-sky">Willkommen im Stall! Wer reitet heute?</p>
        {familyName && (
          <p className="family-badge">
            <GameIcon name="house" className="inline-icon" /> {familyName}
          </p>
        )}
      </header>

      {mode.kind === 'pin' ? (
        <PinPrompt
          player={mode.player}
          purpose={mode.next}
          onCheck={(pin) => onCheckPin(mode.player, pin)}
          onUnlocked={(pin) => (mode.next === 'play' ? onSelect(mode.player) : setMode({ kind: 'edit', player: mode.player, pin }))}
          onCancel={toList}
        />
      ) : mode.kind === 'edit' ? (
        <ProfileForm
          title="Pferd bearbeiten"
          submitLabel="Speichern"
          initial={mode.player}
          hasPin={Boolean(mode.player.hasPin)}
          onCancel={toList}
          onSubmit={async (profile, newPin) => {
            await onEdit(mode.player, mode.pin, profile, newPin)
            toList()
          }}
        />
      ) : (
        <>
          {players.length > 0 && (
            <ul className="player-list">
              {players.map((player) => (
                <li key={player.id} className="player-row">
                  <button className="player-card" style={{ '--player': player.color } as CSSProperties} onClick={() => open(player, 'play')}>
                    <Avatar player={player} size={64} />
                    <span className="player-name">
                      {player.name}
                      <Points value={player.totalPoints} />
                    </span>
                    {player.hasPin && <GameIcon name="lock" className="pin-badge" size={26} title="Mit PIN geschützt" />}
                  </button>
                  <button className="edit-player" onClick={() => open(player, 'edit')} aria-label={`${player.name} bearbeiten`} title="Pferd bearbeiten">
                    <GameIcon name="pencil" size={26} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {creating ? (
            <ProfileForm
              title="Neues Pferd in den Stall"
              submitLabel="Los geht's!"
              hasPin={false}
              onCancel={players.length > 0 ? toList : undefined}
              onSubmit={async (profile, newPin) => {
                await onCreate(profile, newPin ?? null)
                toList()
              }}
            />
          ) : (
            <button className="button primary new-player" onClick={() => setMode({ kind: 'create' })}>
              + Neuer Spieler
            </button>
          )}
        </>
      )}

      <div className="stall-links">
        {onOpenFamily && (
          <button className="button pill" onClick={onOpenFamily}>
            <GameIcon name="house" className="inline-icon" /> {familyName ? 'Familien-Code' : 'Auf mehreren Geräten spielen'}
          </button>
        )}
        <button className="button pill" onClick={onOpenParents}>
          <GameIcon name="family" className="inline-icon" /> Eltern-Bereich
        </button>
      </div>
    </main>
  )
}

function PinPrompt({
  player,
  purpose,
  onCheck,
  onUnlocked,
  onCancel,
}: {
  player: Player
  purpose: 'play' | 'edit'
  onCheck: (pin: string) => Promise<boolean>
  onUnlocked: (pin: string) => void
  onCancel: () => void
}) {
  const [pin, setPin] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      if (await onCheck(pin)) onUnlocked(pin)
      else {
        setError('Die PIN stimmt nicht.')
        setPin('')
      }
    } catch (caught) {
      setError(errorText(caught))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="card panel pin-prompt" onSubmit={submit}>
      <Avatar player={player} size={84} />
      <h2>{player.name}</h2>
      <p>{purpose === 'play' ? 'Dieses Pferd ist mit einer PIN geschützt.' : 'Zum Bearbeiten brauchst du die PIN.'}</p>
      <label>
        Deine PIN
        <input
          className="pin-input"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          maxLength={6}
          value={pin}
          autoFocus
          onChange={(event) => setPin(event.target.value.replace(/\D/g, ''))}
        />
      </label>
      {error && <p className="notice error">{error}</p>}
      <small className="field-help">PIN vergessen? Mama oder Papa können sie im Eltern-Bereich zurücksetzen.</small>
      <div className="actions">
        <button type="button" className="button secondary" onClick={onCancel}>
          Zurück
        </button>
        <button type="submit" className="button primary" disabled={busy || pin.length < 4}>
          <GameIcon name="lock-open" className="inline-icon" /> Öffnen
        </button>
      </div>
    </form>
  )
}

type PinChoice = 'keep' | 'set' | 'remove'

function ProfileForm({
  title,
  submitLabel,
  initial,
  hasPin,
  onCancel,
  onSubmit,
}: {
  title: string
  submitLabel: string
  initial?: PlayerProfile & { extras?: Partial<PlayerExtras> }
  /** Whether the horse already has a PIN (only when editing). */
  hasPin: boolean
  onCancel?: () => void
  /** `newPin`: undefined keeps the PIN, null removes it. */
  onSubmit: (profile: PlayerProfile, newPin: string | null | undefined) => Promise<void>
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [avatar, setAvatar] = useState(initial?.avatar && horseFor(initial.avatar) ? initial.avatar : AVATARS[0])
  const [color, setColor] = useState(initial?.color ?? COLORS[0])
  const [pinChoice, setPinChoice] = useState<PinChoice>('keep')
  const [pin, setPin] = useState('')
  const [repeat, setRepeat] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) return
    setError(null)
    if (pinChoice === 'set') {
      if (!PIN_PATTERN.test(pin)) return setError('Die PIN muss aus 4 bis 6 Ziffern bestehen.')
      if (pin !== repeat) return setError('Die beiden PINs stimmen nicht überein.')
    }
    setBusy(true)
    try {
      await onSubmit({ name, avatar, color }, pinChoice === 'set' ? pin : pinChoice === 'remove' ? null : undefined)
    } catch (caught) {
      setError(errorText(caught))
      setBusy(false)
    }
  }

  const pinOptions: [PinChoice, string][] = hasPin
    ? [
        ['keep', 'PIN behalten'],
        ['set', 'PIN ändern'],
        ['remove', 'PIN entfernen'],
      ]
    : [
        ['keep', 'Ohne PIN'],
        ['set', 'Mit PIN schützen'],
      ]

  return (
    <form className="card create-form" onSubmit={submit}>
      <h2>{title}</h2>
      {error && <p className="notice error">{error}</p>}
      <label>
        Dein Name
        <input value={name} onChange={(event) => setName(event.target.value)} maxLength={20} autoFocus={!initial} placeholder="z. B. Lena" />
      </label>
      <fieldset>
        <legend>Dein Pferd</legend>
        <div className="options">
          {AVATARS.map((option) => (
            <button
              type="button"
              key={option}
              className={`option horse-option ${option === avatar ? 'selected' : ''}`}
              onClick={() => setAvatar(option)}
              aria-pressed={option === avatar}
              aria-label={horseFor(option).name}
              title={horseFor(option).name}
            >
              <HorseHead horse={horseFor(option)} size="100%" />
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
      <fieldset>
        <legend>
          <GameIcon name="lock" className="inline-icon" /> PIN für dein Pferd
        </legend>
        <div className="chip-row">
          {pinOptions.map(([choice, label]) => (
            <button type="button" key={choice} className={`chip ${pinChoice === choice ? 'selected' : ''}`} aria-pressed={pinChoice === choice} onClick={() => setPinChoice(choice)}>
              {label}
            </button>
          ))}
        </div>
        {pinChoice === 'set' && (
          <div className="pin-fields">
            <label>
              {hasPin ? 'Neue PIN' : 'PIN'} (4–6 Ziffern)
              <input className="pin-input" type="password" inputMode="numeric" autoComplete="off" maxLength={6} value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, ''))} />
            </label>
            <label>
              PIN wiederholen
              <input className="pin-input" type="password" inputMode="numeric" autoComplete="off" maxLength={6} value={repeat} onChange={(event) => setRepeat(event.target.value.replace(/\D/g, ''))} />
            </label>
          </div>
        )}
        <small className="field-help">Mit PIN kann nur du mit deinem Pferd reiten und es verändern.</small>
      </fieldset>
      <div className="preview">
        {/* Hat and buddy from the shop stay on; the background is left out so the colour choice shows. */}
        <Avatar player={{ avatar, color, extras: { equipped: { hat: initial?.extras?.equipped?.hat, buddy: initial?.extras?.equipped?.buddy } } }} size={72} />
        <span className="preview-text">
          <strong>{name.trim() || 'Dein Name'}</strong>
          <small>{horseFor(avatar).name}</small>
        </span>
      </div>
      <div className="actions">
        {onCancel && (
          <button type="button" className="button secondary" onClick={onCancel}>
            Abbrechen
          </button>
        )}
        <button type="submit" className="button primary" disabled={busy || !name.trim()}>
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
