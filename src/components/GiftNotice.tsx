import { useState } from 'react'
import { findItem } from '../game/rewards'
import type { Gift } from '../game/types'
import { Confetti } from './Confetti'
import { GameIcon } from './GameIcon'

/** "Lena hat dir die Krone geschenkt!" – shown once to the child who got a present. */
export function GiftNotice({ gifts, onClose }: { gifts: Gift[]; onClose: (equipItemId?: string) => Promise<void> }) {
  const [busy, setBusy] = useState(false)
  const close = async (equipItemId?: string) => {
    setBusy(true)
    try {
      await onClose(equipItemId)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="gift-backdrop">
      <Confetti pieces={50} />
      <section className="card panel gift-dialog gift-received" role="dialog" aria-label="Ein Geschenk für dich">
        <GameIcon name="gift" size={72} className="gift-bounce" />
        <h2>{gifts.length === 1 ? 'Ein Geschenk für dich!' : `${gifts.length} Geschenke für dich!`}</h2>
        <ul className="gift-list">
          {gifts.map((gift) => {
            const item = findItem(gift.itemId)
            if (!item) return null
            return (
              <li key={`${gift.itemId}-${gift.at}`}>
                <span className="item-look small" style={item.slot === 'background' ? { background: item.look } : undefined} aria-hidden="true">
                  {item.slot === 'background' ? null : <GameIcon name={item.look} size="78%" />}
                </span>
                <span className="gift-text">
                  <strong>{item.name}</strong>
                  <small>Geschenk von {gift.fromName}</small>
                </span>
                <button className="button small track" disabled={busy} onClick={() => close(item.id)}>
                  Anziehen
                </button>
              </li>
            )
          })}
        </ul>
        <button className="button primary" disabled={busy} onClick={() => close()}>
          Danke!
        </button>
      </section>
    </div>
  )
}
