import { type FormEvent, useState } from 'react'
import type { ContentStore } from '../game/content'
import { buildMission, describeMistake, draftFromMission, draftProblems, emptyDraft, kindsFor, type MissionDraft, parseQuestions, parseVocabulary } from '../game/custom'
import { findTrack, missions as builtInMissions, tracks } from '../game/missions'
import { BADGES, extrasOf } from '../game/rewards'
import type { Mission, Player } from '../game/types'
import { Avatar } from './Avatar'
import { Points } from './Icons'
import { GameIcon } from './GameIcon'

interface Props {
  store: ContentStore
  hasPin: boolean
  customMissions: Mission[]
  players: Player[]
  onMissionsChanged: (missions: Mission[]) => void
  onPlayerDeleted: (playerId: string) => void
  onPinSet: () => void
  onOpenFamily?: () => void
  onBack: () => void
}

type Tab = 'missions' | 'progress' | 'settings'

const PIN_PATTERN = /^\d{4,6}$/

const errorText = (error: unknown) => (error instanceof Error ? error.message : String(error))

export function ParentArea({ store, hasPin, customMissions, players, onMissionsChanged, onPlayerDeleted, onPinSet, onOpenFamily, onBack }: Props) {
  const [pin, setPin] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('missions')

  return (
    <main className="screen parents">
      <header className="topbar">
        <button className="button pill" onClick={onBack}>
          ← Zum Stall
        </button>
        {pin && (
          <button className="button pill" onClick={() => setPin(null)}>
            <GameIcon name="lock" className="inline-icon" /> Sperren
          </button>
        )}
      </header>
      <header className="page-title">
        <h1>
          <GameIcon name="family" className="inline-icon" /> Eltern-Bereich
        </h1>
        <p className="on-sky">Missionen anlegen und Fortschritte ansehen</p>
      </header>

      {!pin ? (
        <PinGate store={store} hasPin={hasPin} onUnlocked={setPin} onPinSet={onPinSet} />
      ) : (
        <>
          <div className="tabs tabs-3" role="tablist">
            {(
              [
                ['missions', 'pencil', 'Missionen'],
                ['progress', 'chart', 'Fortschritt'],
                ['settings', 'gear', 'Einstellungen'],
              ] as const
            ).map(([id, icon, label]) => (
              <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>
                <GameIcon name={icon} className="inline-icon" /> {label}
              </button>
            ))}
          </div>
          {tab === 'missions' && <MissionManager store={store} pin={pin} missions={customMissions} onChanged={onMissionsChanged} />}
          {tab === 'progress' && <Progress store={store} pin={pin} players={players} customMissions={customMissions} onDeleted={onPlayerDeleted} />}
          {tab === 'settings' && <Settings store={store} pin={pin} onPinChanged={setPin} onOpenFamily={onOpenFamily} />}
        </>
      )}
    </main>
  )
}

// --- PIN ------------------------------------------------------------------------------

function PinInput({ label, value, onChange, autoFocus }: { label: string; value: string; onChange: (value: string) => void; autoFocus?: boolean }) {
  return (
    <label>
      {label}
      <input
        className="pin-input"
        type="password"
        inputMode="numeric"
        autoComplete="off"
        maxLength={6}
        value={value}
        autoFocus={autoFocus}
        onChange={(event) => onChange(event.target.value.replace(/\D/g, ''))}
      />
    </label>
  )
}

function PinGate({ store, hasPin, onUnlocked, onPinSet }: { store: ContentStore; hasPin: boolean; onUnlocked: (pin: string) => void; onPinSet: () => void }) {
  const [pin, setPin] = useState('')
  const [repeat, setRepeat] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    if (!PIN_PATTERN.test(pin)) return setError('Die PIN muss aus 4 bis 6 Ziffern bestehen.')
    if (!hasPin && pin !== repeat) return setError('Die beiden PINs stimmen nicht überein.')
    setBusy(true)
    try {
      if (hasPin) {
        if (await store.checkPin(pin)) onUnlocked(pin)
        else setError('Die PIN stimmt nicht.')
      } else {
        await store.setPin(null, pin)
        onPinSet()
        onUnlocked(pin)
      }
    } catch (caught) {
      setError(errorText(caught))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="card panel pin-gate" onSubmit={submit}>
      <GameIcon name="lock" className="lock-icon" size={56} />
      {hasPin ? (
        <>
          <h2>Nur für Eltern</h2>
          <PinInput label="PIN" value={pin} onChange={setPin} autoFocus />
        </>
      ) : (
        <>
          <h2>PIN festlegen</h2>
          <p>Mit der PIN schützt du den Eltern-Bereich vor neugierigen Kinderfingern. Mit Familie gilt sie auf allen Geräten.</p>
          <PinInput label="Neue PIN (4–6 Ziffern)" value={pin} onChange={setPin} autoFocus />
          <PinInput label="PIN wiederholen" value={repeat} onChange={setRepeat} />
        </>
      )}
      {error && <p className="notice error">{error}</p>}
      <button type="submit" className="button primary" disabled={busy || pin.length < 4}>
        {hasPin ? 'Öffnen' : 'PIN speichern'}
      </button>
    </form>
  )
}

// --- Missions ---------------------------------------------------------------------------

function MissionManager({ store, pin, missions, onChanged }: { store: ContentStore; pin: string; missions: Mission[]; onChanged: (missions: Mission[]) => void }) {
  const [draft, setDraft] = useState<MissionDraft | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const save = async (next: Mission[]) => {
    setBusy(true)
    setError(null)
    try {
      onChanged(await store.saveMissions(pin, next))
      return true
    } catch (caught) {
      setError(errorText(caught))
      return false
    } finally {
      setBusy(false)
    }
  }

  if (draft) {
    return (
      <MissionEditor
        draft={draft}
        busy={busy}
        error={error}
        onChange={setDraft}
        onCancel={() => {
          setDraft(null)
          setError(null)
        }}
        onSave={async () => {
          const mission = buildMission(draft)
          const exists = missions.some((existing) => existing.id === mission.id)
          const next = exists ? missions.map((existing) => (existing.id === mission.id ? mission : existing)) : [...missions, mission]
          if (await save(next)) setDraft(null)
        }}
      />
    )
  }

  return (
    <section className="mission-manager">
      {error && <p className="notice error">{error}</p>}
      <button className="button primary" onClick={() => setDraft(emptyDraft())}>
        + Neue Mission
      </button>
      {missions.length === 0 ? (
        <p className="card panel hint">
          Noch keine eigenen Missionen. Lege z. B. die Vokabeln für den nächsten Test an – sie erscheinen sofort mit Stern im passenden Turnier.
        </p>
      ) : (
        <ul className="custom-list">
          {missions.map((mission) => {
            const track = findTrack(mission.track)
            return (
              <li key={mission.id} className={`card custom-item theme-${mission.track}`}>
                <span className="custom-icon" aria-hidden="true">
                  {track && <GameIcon name={track.icon} size={30} />}
                </span>
                <span className="custom-text">
                  <strong>{mission.title}</strong>
                  <small>
                    {track?.title} · {mission.subtitle}
                  </small>
                </span>
                {confirmDelete === mission.id ? (
                  <span className="custom-actions">
                    <button className="button small secondary" onClick={() => setConfirmDelete(null)}>
                      Nein
                    </button>
                    <button
                      className="button small danger"
                      disabled={busy}
                      onClick={async () => {
                        if (await save(missions.filter((existing) => existing.id !== mission.id))) setConfirmDelete(null)
                      }}
                    >
                      Löschen
                    </button>
                  </span>
                ) : (
                  <span className="custom-actions">
                    <button className="button small secondary" onClick={() => setDraft(draftFromMission(mission))}>
                      Bearbeiten
                    </button>
                    <button className="button small secondary" aria-label={`${mission.title} löschen`} onClick={() => setConfirmDelete(mission.id)}>
                      <GameIcon name="trash" size={22} />
                    </button>
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

const KIND_LABELS: Record<MissionDraft['kind'], string> = {
  vocabulary: 'Vokabeln',
  quiz: 'Eigene Fragen',
  multiplication: '1×1',
}

const PLACEHOLDERS: Record<string, string> = {
  english: 'the saddle = der Sattel\nthe horse = das Pferd\nto ride = reiten',
  french: 'le chat = die Katze\nla maison = das Haus\nmanger = essen',
  spanish: 'el perro = der Hund\nla casa = das Haus\ncomer = essen',
}

function MissionEditor({
  draft,
  busy,
  error,
  onChange,
  onCancel,
  onSave,
}: {
  draft: MissionDraft
  busy: boolean
  error: string | null
  onChange: (draft: MissionDraft) => void
  onCancel: () => void
  onSave: () => void
}) {
  const [tried, setTried] = useState(false)
  const set = (changes: Partial<MissionDraft>) => onChange({ ...draft, ...changes })
  const problems = draftProblems(draft)
  const parsed = draft.kind === 'vocabulary' ? parseVocabulary(draft.text) : draft.kind === 'quiz' ? parseQuestions(draft.text) : null

  return (
    <form
      className={`card panel mission-editor theme-${draft.track}`}
      onSubmit={(event) => {
        event.preventDefault()
        setTried(true)
        if (problems.length === 0) onSave()
      }}
    >
      <h2>{draft.id ? 'Mission bearbeiten' : 'Neue Mission'}</h2>
      <label>
        Name der Mission
        <input value={draft.title} maxLength={40} onChange={(event) => set({ title: event.target.value })} placeholder="z. B. Vokabeltest Unit 3" />
      </label>

      <fieldset>
        <legend>Turnier</legend>
        <div className="chip-row">
          {tracks.map((track) => (
            <button
              type="button"
              key={track.id}
              className={`chip theme-${track.id} ${draft.track === track.id ? 'selected' : ''}`}
              aria-pressed={draft.track === track.id}
              onClick={() => set({ track: track.id, kind: kindsFor(track.id).includes(draft.kind) ? draft.kind : kindsFor(track.id)[0] })}
            >
              <GameIcon name={track.icon} className="inline-icon" /> {track.subject}
            </button>
          ))}
        </div>
      </fieldset>

      {kindsFor(draft.track).length > 1 && (
        <fieldset>
          <legend>Aufgabenart</legend>
          <div className="chip-row">
            {kindsFor(draft.track).map((kind) => (
              <button type="button" key={kind} className={`chip ${draft.kind === kind ? 'selected' : ''}`} aria-pressed={draft.kind === kind} onClick={() => set({ kind })}>
                {KIND_LABELS[kind]}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {draft.kind === 'multiplication' ? (
        <fieldset>
          <legend>1×1-Reihen</legend>
          <div className="chip-row">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((factor) => {
              const active = draft.factors.includes(factor)
              return (
                <button
                  type="button"
                  key={factor}
                  className={`chip round ${active ? 'selected' : ''}`}
                  aria-pressed={active}
                  onClick={() => set({ factors: active ? draft.factors.filter((f) => f !== factor) : [...draft.factors, factor] })}
                >
                  {factor}
                </button>
              )
            })}
          </div>
        </fieldset>
      ) : (
        <label>
          {draft.kind === 'vocabulary' ? 'Vokabeln – eine pro Zeile: Fremdwort = Deutsch' : 'Fragen – eine pro Zeile: Frage = Antwort'}
          <textarea
            rows={8}
            value={draft.text}
            onChange={(event) => set({ text: event.target.value })}
            placeholder={draft.kind === 'vocabulary' ? PLACEHOLDERS[draft.track] : 'Hauptstadt von Frankreich = Paris | Lyon | Nizza\n7 × 8 = 56\nHund = der | die | das'}
            spellCheck={false}
          />
          <small className="field-help">
            {draft.kind === 'vocabulary'
              ? 'Mehrere richtige Antworten mit „/“ trennen, z. B. „der Schweif / der Schwanz“.'
              : 'Falsche Antworten zum Auswählen mit „|“ anhängen. Mehrere richtige Antworten mit „/“ trennen.'}
            {parsed && parsed.items.length > 0 && <b> {parsed.items.length} erkannt.</b>}
          </small>
        </label>
      )}

      <div className="editor-options">
        {draft.kind === 'vocabulary' && (
          <label>
            Richtung
            <select value={draft.direction} onChange={(event) => set({ direction: event.target.value as MissionDraft['direction'] })}>
              <option value="to-de">Fremdsprache → Deutsch</option>
              <option value="from-de">Deutsch → Fremdsprache</option>
            </select>
          </label>
        )}
        <label>
          Antworten
          <select value={draft.mode} onChange={(event) => set({ mode: event.target.value as MissionDraft['mode'] })}>
            <option value="choice">Auswählen (leichter)</option>
            <option value="input">Selbst tippen (mehr Hufeisen)</option>
          </select>
        </label>
        <label>
          Aufgaben pro Runde
          <input type="number" min={3} max={20} value={draft.count} onChange={(event) => set({ count: Number(event.target.value) })} />
        </label>
      </div>

      {tried && problems.length > 0 && (
        <ul className="notice error problem-list">
          {problems.map((problem) => (
            <li key={problem}>{problem}</li>
          ))}
        </ul>
      )}
      {error && <p className="notice error">{error}</p>}
      <div className="actions">
        <button type="button" className="button secondary" onClick={onCancel}>
          Abbrechen
        </button>
        <button type="submit" className="button primary" disabled={busy}>
          Speichern
        </button>
      </div>
    </form>
  )
}

// --- Progress -------------------------------------------------------------------------------

function Progress({
  store,
  pin,
  players,
  customMissions,
  onDeleted,
}: {
  store: ContentStore
  pin: string
  players: Player[]
  customMissions: Mission[]
  onDeleted: (playerId: string) => void
}) {
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const remove = async (player: Player) => {
    setBusy(true)
    setError(null)
    try {
      await store.deletePlayer(pin, player.id)
      setConfirmId(null)
      onDeleted(player.id)
    } catch (caught) {
      setError(errorText(caught))
    } finally {
      setBusy(false)
    }
  }

  if (players.length === 0) return <p className="card panel hint">Noch keine Spieler angelegt.</p>
  const allMissions = [...builtInMissions, ...customMissions]
  return (
    <ul className="progress-list">
      {players.map((player) => {
        const extras = extrasOf(player)
        const badgeCount = BADGES.filter((badge) => extras.badges[badge.id]).length
        const tricky = Object.entries(player.mistakes)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 6)
        const lastPlayed = Object.values(player.missions)
          .map((progress) => progress.lastPlayedAt)
          .sort()
          .pop()
        return (
          <li key={player.id} className="card panel child-progress">
            <header className="child-header">
              <Avatar player={player} size={56} />
              <span>
                <strong>{player.name}</strong>
                <small>{lastPlayed ? `Zuletzt gespielt: ${new Date(lastPlayed).toLocaleDateString('de-DE')}` : 'Noch nicht gespielt'}</small>
              </span>
            </header>
            <dl className="child-stats">
              <div>
                <dt>Hufeisen</dt>
                <dd>
                  <Points value={player.totalPoints} />
                </dd>
              </div>
              <div>
                <dt>Abzeichen</dt>
                <dd>
                  <GameIcon name="medal" className="inline-icon" /> {badgeCount}/{BADGES.length}
                </dd>
              </div>
              <div>
                <dt>Serie</dt>
                <dd>
                  <GameIcon name="fire" className="inline-icon" /> {extras.streak.days}
                </dd>
              </div>
            </dl>
            <ul className="track-progress">
              {tracks.map((track) => {
                const trackMissions = allMissions.filter((mission) => mission.track === track.id)
                const done = trackMissions.filter((mission) => player.missions[mission.id]?.passed).length
                return (
                  <li key={track.id} className={`theme-${track.id}`}>
                    <span>
                      <GameIcon name={track.icon} className="inline-icon" /> {track.subject}
                    </span>
                    <span className="bar" aria-label={`${done} von ${trackMissions.length}`}>
                      <span style={{ width: `${(done / Math.max(1, trackMissions.length)) * 100}%` }} />
                    </span>
                    <small>
                      {done}/{trackMissions.length}
                    </small>
                  </li>
                )
              })}
            </ul>
            {confirmId === player.id ? (
              <div className="notice error delete-confirm">
                <p>
                  <strong>{player.name} wirklich löschen?</strong> Alle Hufeisen, Abzeichen, Einkäufe und Duelle gehen auf allen Geräten verloren. Das lässt sich
                  nicht rückgängig machen.
                </p>
                {error && <p>{error}</p>}
                <div className="actions">
                  <button className="button secondary" onClick={() => setConfirmId(null)} disabled={busy}>
                    Abbrechen
                  </button>
                  <button className="button danger" onClick={() => remove(player)} disabled={busy}>
                    Endgültig löschen
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="button small secondary delete-player"
                onClick={() => {
                  setError(null)
                  setConfirmId(player.id)
                }}
              >
                <GameIcon name="trash" className="inline-icon" /> Spieler löschen
              </button>
            )}
            {tricky.length > 0 && (
              <div className="tricky">
                <strong>Übt noch an:</strong>
                <span className="tricky-list">
                  {tricky.map(([key, count]) => (
                    <span key={key} className="tricky-item">
                      {describeMistake(key, customMissions)} <b>{count}×</b>
                    </span>
                  ))}
                </span>
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

// --- Settings -------------------------------------------------------------------------------

function Settings({ store, pin, onPinChanged, onOpenFamily }: { store: ContentStore; pin: string; onPinChanged: (pin: string) => void; onOpenFamily?: () => void }) {
  const [newPin, setNewPin] = useState('')
  const [repeat, setRepeat] = useState('')
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!PIN_PATTERN.test(newPin)) return setMessage({ ok: false, text: 'Die PIN muss aus 4 bis 6 Ziffern bestehen.' })
    if (newPin !== repeat) return setMessage({ ok: false, text: 'Die beiden PINs stimmen nicht überein.' })
    try {
      await store.setPin(pin, newPin)
      onPinChanged(newPin)
      setNewPin('')
      setRepeat('')
      setMessage({ ok: true, text: 'Die PIN wurde geändert.' })
    } catch (caught) {
      setMessage({ ok: false, text: errorText(caught) })
    }
  }

  return (
    <>
      <form className="card panel" onSubmit={submit}>
        <h2>PIN ändern</h2>
        <PinInput label="Neue PIN (4–6 Ziffern)" value={newPin} onChange={setNewPin} />
        <PinInput label="Neue PIN wiederholen" value={repeat} onChange={setRepeat} />
        {message && <p className={`notice ${message.ok ? 'success' : 'error'}`}>{message.text}</p>}
        <button type="submit" className="button primary" disabled={newPin.length < 4}>
          PIN ändern
        </button>
      </form>
      {onOpenFamily && (
        <section className="card panel">
          <h2>Familie</h2>
          <p>Familien-Code anzeigen, weitere Geräte verbinden oder dieses Gerät abmelden.</p>
          <button className="button secondary" onClick={onOpenFamily}>
            <GameIcon name="house" className="inline-icon" /> Zur Familie
          </button>
        </section>
      )}
    </>
  )
}
