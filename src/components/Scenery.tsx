import { useSyncExternalStore } from 'react'
import { currentWorld, subscribeWorld, type WorldId } from '../game/worlds'
import { Meadow } from './Meadow'

const CLOUD = 'M20 45 a18 18 0 0 1 4-35 a22 22 0 0 1 40-5 a18 18 0 0 1 32 8 a16 16 0 0 1 4 32 z'
const BAT = 'M0 6 C 4 0, 8 2, 10 5 C 11 2, 13 2, 14 4 C 15 2, 17 2, 18 5 C 20 2, 24 0, 28 6 C 24 5, 21 7, 20 10 C 18 8, 16 9, 14 11 C 12 9, 10 8, 8 10 C 7 7, 4 5, 0 6 Z'

/** Backdrop behind every screen. Sky, ground and decoration change with the chosen world; the horses stay. */
export function Scenery() {
  const world = useSyncExternalStore(subscribeWorld, currentWorld, currentWorld)
  return (
    <div className={`scenery world-${world}`} aria-hidden="true">
      <div className="sun" />
      <div className="stars" />
      <svg className="cloud cloud-1" viewBox="0 0 120 50">
        <path d={CLOUD} />
      </svg>
      <svg className="cloud cloud-2" viewBox="0 0 120 50">
        <path d={CLOUD} />
      </svg>
      <svg className="cloud cloud-3" viewBox="0 0 120 50">
        <path d={CLOUD} />
      </svg>
      <SkyDecor world={world} />
      {world === 'racetrack' && <Grandstand />}
      <Meadow behind />
      <svg className="hills" viewBox="0 0 1200 260" preserveAspectRatio="none">
        <path className="hill-back" d="M0 120 C 180 40, 360 60, 520 110 S 860 30, 1200 90 L1200 260 L0 260 Z" />
        <path className="hill-mid" d="M0 170 C 220 110, 420 130, 640 170 S 1000 110, 1200 150 L1200 260 L0 260 Z" />
        <g className="fence">
          {Array.from({ length: 25 }, (_, i) => (
            <rect key={i} x={i * 50 + 10} y="168" width="9" height="46" rx="3" />
          ))}
          <rect x="0" y="178" width="1200" height="8" rx="4" />
          <rect x="0" y="196" width="1200" height="8" rx="4" />
        </g>
        <path className="hill-front" d="M0 215 C 300 190, 600 225, 900 205 S 1150 200, 1200 210 L1200 260 L0 260 Z" />
        <GroundDecor world={world} />
      </svg>
      {world === 'racetrack' && <FinishPost />}
      {world === 'halloween' && <Pumpkins />}
      <Meadow behind={false} />
    </div>
  )
}

function SkyDecor({ world }: { world: WorldId }) {
  if (world === 'space') {
    return (
      <>
        <svg className="planet planet-small" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="16" fill="#58d6c9" />
          <path d="M8 16 Q 20 10, 32 18 M7 25 Q 20 21, 33 27" fill="none" stroke="#2fa89c" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <svg className="planet planet-tiny" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="16" fill="#ffb347" />
          <circle cx="14" cy="15" r="4" fill="#e8892a" />
          <circle cx="25" cy="25" r="3" fill="#e8892a" />
        </svg>
        <svg className="rocket" viewBox="0 0 40 80">
          <path d="M20 2 C 30 14, 32 34, 30 52 L10 52 C 8 34, 10 14, 20 2 Z" fill="#f4f1ff" />
          <circle cx="20" cy="26" r="6" fill="#5ec8ff" stroke="#a8b4d6" strokeWidth="2.5" />
          <path d="M10 40 L2 58 L10 54 Z M30 40 L38 58 L30 54 Z" fill="#ff5a5f" />
          <path d="M20 2 C 24 6, 27 10, 28 14 L12 14 C 13 10, 16 6, 20 2 Z" fill="#ff5a5f" />
          <path className="rocket-flame" d="M12 52 Q 20 80, 28 52 Z" fill="#ffd23f" />
          <path className="rocket-flame" d="M15 52 Q 20 70, 25 52 Z" fill="#ff9f1c" />
        </svg>
        <span className="shooting-star shooting-star-1" />
        <span className="shooting-star shooting-star-2" />
      </>
    )
  }
  if (world === 'halloween') {
    return (
      <>
        {[1, 2, 3].map((i) => (
          <svg key={i} className={`bat bat-${i}`} viewBox="0 0 28 12">
            <path d={BAT} />
          </svg>
        ))}
        <svg className="spook" viewBox="0 0 40 48">
          <path d="M4 44 L4 20 C 4 8, 12 2, 20 2 C 28 2, 36 8, 36 20 L36 44 L30 39 L25 45 L20 39 L15 45 L10 39 Z" fill="#ffffff" />
          <ellipse cx="14" cy="20" rx="3" ry="4" fill="#2b2250" />
          <ellipse cx="26" cy="20" rx="3" ry="4" fill="#2b2250" />
          <ellipse cx="20" cy="29" rx="3.5" ry="4" fill="#2b2250" />
          <ellipse cx="9" cy="26" rx="2.5" ry="1.5" fill="#ffb3c6" />
          <ellipse cx="31" cy="26" rx="2.5" ry="1.5" fill="#ffb3c6" />
        </svg>
      </>
    )
  }
  if (world === 'racetrack') {
    const colors = ['#ff5a5f', '#ffd23f', '#1cb0f6', '#58cc02', '#a560f0', '#ff9f1c']
    return (
      <svg className="bunting" viewBox="0 0 1200 60" preserveAspectRatio="none">
        <path d="M0 6 Q 300 34, 600 10 T 1200 8" fill="none" stroke="#ffffff" strokeWidth="2" />
        {Array.from({ length: 24 }, (_, i) => {
          const x = i * 50 + 10
          const y = 8 + Math.sin((i / 23) * Math.PI * 2) * -10 + 12
          return <path key={i} d={`M${x} ${y - 4} L${x + 30} ${y - 4} L${x + 15} ${y + 22} Z`} fill={colors[i % colors.length]} />
        })}
      </svg>
    )
  }
  return null
}

function Grandstand() {
  const crowd = ['#ff5a5f', '#ffd23f', '#1cb0f6', '#ffffff', '#a560f0', '#58cc02', '#ff7eb6', '#ff9f1c']
  return (
    <svg className="grandstand" viewBox="400 0 480 140">
      <rect x="430" y="58" width="420" height="80" rx="6" fill="#f4f1ff" />
      <path d="M410 62 L870 62 L850 40 L430 40 Z" fill="#ff5a5f" />
      {Array.from({ length: 12 }, (_, i) => (
        <path key={i} d={`M${430 + i * 35} 40 L${447 + i * 35} 40 L${443 + i * 35} 62 L${426 + i * 35} 62 Z`} fill="#ffffff" />
      ))}
      {Array.from({ length: 3 }, (_, row) =>
        Array.from({ length: 20 }, (_, i) => (
          <circle key={`${row}-${i}`} cx={448 + i * 20 + (row % 2) * 10} cy={78 + row * 16} r="6" fill={crowd[(i * 3 + row) % crowd.length]} />
        )),
      )}
      {[440, 640, 840].map((x, i) => (
        <g key={x}>
          <rect x={x - 1.5} y="10" width="3" height="32" fill="#ffffff" />
          <path d={`M${x + 1.5} 10 L${x + 26} 16 L${x + 1.5} 22 Z`} fill={['#1cb0f6', '#ffd23f', '#58cc02'][i]} className="pennant" />
        </g>
      ))}
    </svg>
  )
}

function FinishPost() {
  return (
    <svg className="finish-post" viewBox="0 0 40 120">
      <rect x="17" y="20" width="6" height="100" fill="#ffffff" stroke="#d9d3f5" strokeWidth="1" />
      <rect x="2" y="2" width="36" height="24" rx="4" fill="#ffffff" stroke="#2b2250" strokeWidth="2" />
      {Array.from({ length: 4 }, (_, row) =>
        Array.from({ length: 6 }, (_, col) => (row + col) % 2 === 0 && <rect key={`${row}-${col}`} x={4 + col * 5.33} y={4 + row * 5} width="5.33" height="5" fill="#2b2250" />),
      )}
    </svg>
  )
}

/** Separate from the stretched hills so they keep their shape on narrow screens. */
function Pumpkins() {
  return (
    <>
      {[4, 30, 58, 84].map((left, i) => (
        <svg key={left} className="pumpkin" viewBox="-20 -16 40 30" style={{ left: `${left}%`, bottom: `${6 + (i % 2) * 14}px`, width: `${34 + (i % 2) * 8}px` }}>
          <ellipse cx="-7" cy="2" rx="9" ry="10" fill="#e86a10" />
          <ellipse cx="7" cy="2" rx="9" ry="10" fill="#e86a10" />
          <ellipse cx="0" cy="2" rx="9" ry="11" fill="#ff8a3d" />
          <rect x="-2" y="-13" width="4" height="6" rx="1" fill="#46a302" />
          <path d="M-7 -1 L-4 -5 L-1 -1 Z M1 -1 L4 -5 L7 -1 Z M-7 5 Q 0 11, 7 5 L4 6 L2 4 L0 6 L-2 4 L-4 6 Z" fill="#ffd23f" />
        </svg>
      ))}
    </>
  )
}

function GroundDecor({ world }: { world: WorldId }) {
  const spots = [60, 190, 330, 470, 610, 760, 900, 1050, 1150]
  if (world === 'space') {
    return (
      <g className="craters">
        {spots.map((x, i) => (
          <ellipse key={x} cx={x} cy={232 + (i % 3) * 8} rx={14 + (i % 3) * 6} ry={5 + (i % 2) * 2} />
        ))}
      </g>
    )
  }
  if (world === 'halloween') return null
  return (
    <g className="flowers">
      {spots.map((x, i) => (
        <circle key={x} cx={x} cy={232 + (i % 3) * 8} r="6" className={`flower flower-${i % 3}`} />
      ))}
    </g>
  )
}
