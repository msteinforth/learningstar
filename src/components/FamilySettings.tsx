import { type FormEvent, useState } from 'react'
import { type Family, formatCode } from '../game/family'

interface Props {
  family: Family | null
  /** Number of profiles stored only on this device. */
  localPlayers: number
  onCreate: (name: string, takeLocalPlayers: boolean) => Promise<void>
  onJoin: (code: string, takeLocalPlayers: boolean) => Promise<void>
  onLeave: () => void
  onBack: () => void
}

export function FamilySettings({ family, localPlayers, onCreate, onJoin, onLeave, onBack }: Props) {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [takeLocal, setTakeLocal] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [confirmLeave, setConfirmLeave] = useState(false)

  const run = (action: () => Promise<void>) => async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await action()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught))
    } finally {
      setBusy(false)
    }
  }

  const copy = async () => {
    if (!family) return
    try {
      await navigator.clipboard.writeText(formatCode(family.code))
      setCopied(true)
    } catch {
      // Copying is optional – the code is visible anyway.
    }
  }

  const takeLocalOption = localPlayers > 0 && (
    <label className="checkbox">
      <input type="checkbox" checked={takeLocal} onChange={(event) => setTakeLocal(event.target.checked)} />
      {localPlayers === 1 ? 'Den Spieler' : `Die ${localPlayers} Spieler`} von diesem Gerät mitnehmen
    </label>
  )

  return (
    <main className="screen">
      <header className="topbar">
        <button className="button pill" onClick={onBack}>
          ← Zurück
        </button>
      </header>
      <header className="page-title">
        <h1>🏡 Familie</h1>
        <p className="on-sky">Mit einer Familie spielt ihr auf mehreren Geräten und seht eine gemeinsame Rangliste.</p>
      </header>

      {error && <p className="card notice error">{error}</p>}

      {family ? (
        <section className="card panel">
          <h2>{family.name}</h2>
          <p>Gib diesen Familien-Code auf jedem weiteren Gerät unter „Familie beitreten“ ein:</p>
          <p className="family-code">{formatCode(family.code)}</p>
          <button className="button secondary" onClick={copy}>
            {copied ? '✓ Kopiert' : 'Code kopieren'}
          </button>
          <p className="hint">Behandle den Code wie einen Haustürschlüssel: Wer ihn kennt, sieht die Namen und Punkte eurer Familie.</p>
          {confirmLeave ? (
            <div className="actions">
              <p className="hint">Die Spielstände bleiben in der Familie gespeichert. Mit dem Code kannst du jederzeit wieder beitreten.</p>
              <button className="button secondary" onClick={() => setConfirmLeave(false)}>
                Abbrechen
              </button>
              <button className="button danger" onClick={onLeave}>
                Gerät abmelden
              </button>
            </div>
          ) : (
            <button className="button ghost" onClick={() => setConfirmLeave(true)}>
              Dieses Gerät von der Familie abmelden
            </button>
          )}
        </section>
      ) : (
        <>
          <form className="card panel" onSubmit={run(() => onCreate(name, takeLocal))}>
            <h2>Neue Familie gründen</h2>
            <label>
              Name der Familie
              <input value={name} onChange={(event) => setName(event.target.value)} maxLength={40} placeholder="z. B. Familie Sonnenschein" />
            </label>
            {takeLocalOption}
            <button type="submit" className="button primary" disabled={busy || !name.trim()}>
              Familie gründen
            </button>
          </form>

          <form className="card panel" onSubmit={run(() => onJoin(code, takeLocal))}>
            <h2>Familie beitreten</h2>
            <label>
              Familien-Code
              <input
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
                maxLength={9}
                placeholder="ABCD-2345"
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                className="code-input"
              />
            </label>
            {takeLocalOption}
            <button type="submit" className="button primary" disabled={busy || code.replace(/[^A-Za-z0-9]/g, '').length !== 8}>
              Beitreten
            </button>
          </form>
        </>
      )}
    </main>
  )
}
