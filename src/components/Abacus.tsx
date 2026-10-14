import { type CSSProperties, type PointerEvent, useRef, useState } from 'react'
import { moveBead } from '../game/abacus'
import { GameIcon } from './GameIcon'

const ROWS = 10
const BEADS = 10
/** Free places on each rod, so beads can be pushed apart (bead size comes from CSS). */
const FREE = 3

/** Counting frame with 10 × 10 beads. It only shows beads – it never counts or calculates. */
export function Abacus() {
  const [open, setOpen] = useState(false)
  const [rows, setRows] = useState<number[]>(() => Array(ROWS).fill(BEADS))
  const swipe = useRef<{ row: number; bead: number; x: number } | null>(null)

  const move = (row: number, bead: number) => setRows((current) => current.map((left, i) => (i === row ? moveBead(left, bead) : left)))

  const onPointerDown = (row: number, bead: number) => (event: PointerEvent<HTMLButtonElement>) => {
    // Keep getting the pointer while the finger swipes off the bead.
    event.currentTarget.setPointerCapture?.(event.pointerId)
    swipe.current = { row, bead, x: event.clientX }
  }

  const onPointerUp = (event: PointerEvent) => {
    const start = swipe.current
    swipe.current = null
    if (!start) return
    const dx = event.clientX - start.x
    const onLeft = start.bead < rows[start.row]
    // A tap moves the bead to the other side; a swipe only in its own direction.
    if (Math.abs(dx) < 8 || (dx > 0 && onLeft) || (dx < 0 && !onLeft)) move(start.row, start.bead)
  }

  return (
    <>
      <button
        className={`abacus-tab ${open ? 'open' : ''}`}
        onClick={() => {
          setOpen(!open)
          // Phones: push the task up so question and answers stay visible above the frame.
          if (!open && window.matchMedia('(max-width: 720px)').matches) {
            requestAnimationFrame(() => document.querySelector('.task')?.scrollIntoView({ block: 'start', behavior: 'smooth' }))
          }
        }} aria-expanded={open} aria-controls="abacus-panel">
        <GameIcon name="abacus" size={28} />
        <span>Rechenschieber</span>
      </button>
      <aside id="abacus-panel" className={`abacus-panel card ${open ? 'open' : ''}`} aria-label="Rechenschieber" aria-hidden={!open}>
        <header className="abacus-header">
          <strong>
            <GameIcon name="abacus" className="inline-icon" /> Rechenschieber
          </strong>
          <span className="abacus-actions">
            <button className="button small secondary" onClick={() => setRows(Array(ROWS).fill(BEADS))} tabIndex={open ? 0 : -1}>
              ↺ Alle zurück
            </button>
            <button className="abacus-close" onClick={() => setOpen(false)} aria-label="Rechenschieber zuklappen" tabIndex={open ? 0 : -1}>
              ✕
            </button>
          </span>
        </header>
        <div className="abacus-frame" style={{ '--slots': BEADS + FREE } as CSSProperties}>
          {rows.map((left, row) => (
            <div key={row} className={`abacus-row ${row === 4 ? 'gap-after' : ''}`}>
              <span className="abacus-rod" />
              {Array.from({ length: BEADS }, (_, bead) => {
                // Beads on the right sit at the end of the rod, after the free places.
                const slot = bead < left ? bead : bead + FREE
                // 5 red and 5 white per row, so groups of five can be seen at a glance.
                const red = bead < 5
                return (
                  <button
                    key={bead}
                    className={`abacus-bead ${red ? 'red' : 'white'}`}
                    style={{ '--slot': slot } as CSSProperties}
                    onPointerDown={onPointerDown(row, bead)}
                    onPointerUp={onPointerUp}
                    onPointerCancel={() => (swipe.current = null)}
                    onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && (event.preventDefault(), move(row, bead))}
                    tabIndex={open ? 0 : -1}
                    aria-label={`Reihe ${row + 1}, Perle ${bead + 1}, ${bead < left ? 'links' : 'rechts'}`}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </aside>
    </>
  )
}
