import { useState } from 'react'
import { canBuy, extrasOf, findBadge, SHOP_ITEMS, SLOTS, type ShopItem, walletOf } from '../game/rewards'
import type { ItemSlot, Player } from '../game/types'
import { Avatar } from './Avatar'
import { Confetti } from './Confetti'
import { Horseshoe } from './Icons'

interface Props {
  player: Player
  onBuy: (item: ShopItem) => Promise<void>
  onEquip: (slot: ItemSlot, itemId: string | null) => Promise<void>
}

export function Shop({ player, onBuy, onEquip }: Props) {
  const [slot, setSlot] = useState<ItemSlot>('hat')
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [celebrate, setCelebrate] = useState<string | null>(null)

  const extras = extrasOf(player)
  const wallet = walletOf(player)
  const items = SHOP_ITEMS.filter((item) => item.slot === slot)

  const run = async (action: () => Promise<void>) => {
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

  const buy = (item: ShopItem) => {
    // Kids tap fast – buying needs a second tap to confirm.
    if (confirmId !== item.id) {
      setConfirmId(item.id)
      return
    }
    setConfirmId(null)
    run(async () => {
      await onBuy(item)
      setCelebrate(item.id)
    })
  }

  return (
    <main className="screen shop">
      {celebrate && <Confetti key={celebrate} pieces={40} />}
      <header className="page-title">
        <h1>🛍️ Hufeisen-Laden</h1>
        <p className="on-sky">Mach dein Pferd schick!</p>
      </header>

      <section className="card shop-preview">
        <Avatar player={player} size={112} />
        <div>
          <strong className="shop-name">{player.name}</strong>
          <span className="wallet">
            Im Beutel: <Horseshoe size={22} /> <b>{wallet}</b>
          </span>
        </div>
      </section>

      {error && <p className="notice error">{error}</p>}

      <div className="tabs tabs-3" role="tablist">
        {SLOTS.map((option) => (
          <button
            key={option.id}
            role="tab"
            aria-selected={option.id === slot}
            className={option.id === slot ? 'active' : ''}
            onClick={() => {
              setSlot(option.id)
              setConfirmId(null)
            }}
          >
            <span aria-hidden="true">{option.icon}</span> {option.title}
          </button>
        ))}
      </div>

      {extras.equipped[slot] && (
        <button className="button pill take-off" disabled={busy} onClick={() => run(() => onEquip(slot, null))}>
          ✕ Ablegen
        </button>
      )}

      <ul className="shop-grid">
        {items.map((item) => {
          const owned = extras.owned.includes(item.id)
          const worn = extras.equipped[slot] === item.id
          const check = canBuy(player, item)
          const lockedBy = !owned && check.ok === false && check.reason === 'locked' ? findBadge(item.requiresBadge ?? '') : undefined
          return (
            <li key={item.id} className={`card shop-item ${worn ? 'worn' : ''} ${celebrate === item.id ? 'just-bought' : ''} ${lockedBy ? 'locked' : ''}`}>
              <span className="item-look" style={item.slot === 'background' ? { background: item.look } : undefined} aria-hidden="true">
                {item.slot === 'background' ? '' : item.look}
              </span>
              <strong>{item.name}</strong>
              {owned ? (
                <button className={`button small ${worn ? 'secondary' : 'track'}`} disabled={busy || worn} onClick={() => run(() => onEquip(slot, item.id))}>
                  {worn ? '✓ Angezogen' : 'Anziehen'}
                </button>
              ) : lockedBy ? (
                <span className="item-lock">
                  🔒 Abzeichen „{lockedBy.title}“
                </span>
              ) : (
                <button
                  className={`button small ${confirmId === item.id ? 'primary' : 'buy'}`}
                  disabled={busy || !check.ok}
                  onClick={() => buy(item)}
                >
                  {confirmId === item.id ? (
                    'Wirklich kaufen?'
                  ) : (
                    <>
                      <Horseshoe size={16} /> {item.price}
                    </>
                  )}
                </button>
              )}
              {!owned && !lockedBy && !check.ok && <span className="item-missing">Noch {item.price - wallet} Hufeisen</span>}
            </li>
          )
        })}
      </ul>
    </main>
  )
}
