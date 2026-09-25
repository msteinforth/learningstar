import { useSyncExternalStore } from 'react'
import { isMuted, setMuted, subscribeMuted } from '../game/sound'

export function SoundToggle() {
  const muted = useSyncExternalStore(subscribeMuted, isMuted)
  return (
    <button className="button pill sound-toggle" onClick={() => setMuted(!muted)} aria-pressed={!muted} aria-label={muted ? 'Ton einschalten' : 'Ton ausschalten'}>
      {muted ? '🔇' : '🔊'}
    </button>
  )
}
