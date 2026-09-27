import { useState } from 'react'
import type { Player, PlayerProfile } from '../game/types'
import { PinPrompt, ProfileForm } from './PlayerSelect'

interface Props {
  player: Player
  /** PIN entered when the horse was chosen; null if it has to be asked again (e.g. after a reload). */
  knownPin: string | null
  onCheckPin: (pin: string) => Promise<boolean>
  /** `newPin`: undefined keeps the PIN, null removes it. */
  onSave: (pin: string | null, profile: PlayerProfile, newPin: string | null | undefined) => Promise<void>
  onBack: () => void
}

/** "Mein Pferd": name, horse, colour and PIN of the chosen child. */
export function ProfileEdit({ player, knownPin, onCheckPin, onSave, onBack }: Props) {
  const [pin, setPin] = useState(knownPin)
  const needsPin = Boolean(player.hasPin) && pin === null

  return (
    <main className="screen">
      <header className="topbar">
        <button className="button pill" onClick={onBack}>
          ← Zurück
        </button>
      </header>
      {needsPin ? (
        <PinPrompt player={player} purpose="edit" onCheck={onCheckPin} onUnlocked={setPin} onCancel={onBack} />
      ) : (
        <ProfileForm
          title="Mein Pferd"
          submitLabel="Speichern"
          initial={player}
          hasPin={Boolean(player.hasPin)}
          onCancel={onBack}
          onSubmit={async (profile, newPin) => {
            await onSave(player.hasPin ? pin : null, profile, newPin)
            onBack()
          }}
        />
      )}
    </main>
  )
}
