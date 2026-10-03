import { useState } from 'react'
import { canBuy, canGive, extrasOf, findBadge, SHOP_ITEMS, SLOTS, type ShopItem, walletOf } from '../game/rewards'
import type { ItemSlot, Player } from '../game/types'
import { Avatar } from './Avatar'
import { Confetti } from './Confetti'
import { Horseshoe } from './Icons'
import { GameIcon } from './GameIcon'

interface Props {
  player: Player
  /** All children of the family (for presents). */
  players: Player[]
  onBuy: (item: ShopItem) => Promise<void>
  onEquip: (slot: ItemSlot, itemId: string | null) => Promise<void>
  onGive: (item: ShopItem, to: Player) => Promise<void>
}

export function Shop({ player, players, onBuy, onEquip, onGive }: Props) {
  const [slot, setSlot] = useState<ItemSlot>('hat')
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [celebrate, setCelebrate] = useState<string | null>(null)
  const [gift, setGift] = useState<{ item: ShopItem; to: Player | null } | null>(null)
  const [thanks, setThanks] = useState<string | null>(null)
  const siblings = players.filter((other) => other.id !== player.id)

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
        <h1>
          <GameIcon name="bag" className="inline-icon" /> Hufeisen-Laden
        </h1>
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
      {thanks && (
        <p className="notice success gift-thanks">
          <GameIcon name="gift" className="inline-icon" /> {thanks}
        </p>
      )}

      {gift && (
        <div className="gift-backdrop" onClick={() => !busy && setGift(null)}>
          <section className="card panel gift-dialog" role="dialog" aria-label={`${gift.item.name} verschenken`} onClick={(event) => event.stopPropagation()}>
            <span className="item-look" style={gift.item.slot === 'background' ? { background: gift.item.look } : undefined} aria-hidden="true">
              {gift.item.slot === 'background' ? null : <GameIcon name={gift.item.look} size="78%" />}
            </span>
            {!gift.to ? (
              <>
                <h2>{gift.item.name} verschenken</h2>
                <p>An wen soll das Geschenk gehen?</p>
                <div className="opponent-row">
                  {siblings.map((other) => {
                    const check = canGive(player, other, gift.item.id)
                    return (
                      <button key={other.id} className="opponent" disabled={!check.ok} onClick={() => setGift({ ...gift, to: other })}>
                        <Avatar player={other} size={60} />
                        <span>{other.name}</span>
                        {!check.ok && <small>hat es schon</small>}
                      </button>
                    )
                  })}
                </div>
                <button className="button secondary" onClick={() => setGift(null)}>
                  Abbrechen
                </button>
              </>
            ) : (
              <>
                <h2>
                  {gift.item.name} an {gift.to.name} verschenken?
                </h2>
                <p>Danach gehört es {gift.to.name}. Deine Hufeisen bekommst du nicht zurück.</p>
                <div className="actions">
                  <button className="button secondary" disabled={busy} onClick={() => setGift({ ...gift, to: null })}>
                    Zurück
                  </button>
                  <button
                    className="button primary"
                    disabled={busy}
                    onClick={() => {
                      const { item, to } = gift
                      run(async () => {
                        await onGive(item, to!)
                        setGift(null)
                        setThanks(`${to!.name} freut sich über dein Geschenk: ${item.name}!`)
                        setCelebrate(`gift-${item.id}`)
                      })
                    }}
                  >
                    <GameIcon name="gift" className="inline-icon" /> Verschenken
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      )}

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
            <GameIcon name={option.icon} className="inline-icon" /> {option.title}
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
                {item.slot === 'background' ? null : <GameIcon name={item.look} size="78%" />}
              </span>
              <strong>{item.name}</strong>
              {owned ? (
                <>
                  <button className={`button small ${worn ? 'secondary' : 'track'}`} disabled={busy || worn} onClick={() => run(() => onEquip(slot, item.id))}>
                    {worn ? '✓ Angezogen' : 'Anziehen'}
                  </button>
                  {siblings.length > 0 && (
                    <button
                      className="gift-link"
                      disabled={busy}
                      onClick={() => {
                        setThanks(null)
                        setGift({ item, to: null })
                      }}
                    >
                      <GameIcon name="gift" className="inline-icon" /> Verschenken
                    </button>
                  )}
                </>
              ) : lockedBy ? (
                <span className="item-lock">
                  <GameIcon name="lock" className="inline-icon" /> Abzeichen „{lockedBy.title}“
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
