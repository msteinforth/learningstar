import type { ReactNode } from 'react'

// Flat, rounded illustrations on a 48×48 grid, in the colours of the game.
// Every entry is the inside of an <svg viewBox="0 0 48 48">.

const GOLD = '#ffc629'
const GOLD_DARK = '#e0a000'
const INK = '#2b2250'

export const uiIcons: Record<string, ReactNode> = {
  map: (
    <>
      <path d="M4 12 L16 7 L32 12 L44 7 L44 38 L32 43 L16 38 L4 43 Z" fill="#f6e7b8" />
      <path d="M16 7 L32 12 L32 43 L16 38 Z" fill="#e9d59a" />
      <path d="M8 34 C 14 26, 20 30, 24 24 S 34 16, 38 14" fill="none" stroke="#ff5a5f" strokeWidth={3} strokeDasharray="3 4" strokeLinecap="round" />
      <circle cx={10} cy={20} r={4} fill="#8fdc6a" />
      <circle cx={33} cy={32} r={5} fill="#8fdc6a" />
      <path d="M35 10 l6 6 M41 10 l-6 6" stroke="#ff5a5f" strokeWidth={3} strokeLinecap="round" />
    </>
  ),
  swords: (
    <>
      <path d="M8 6 L30 28 L27 31 L5 9 Z" fill="#d4dbe8" />
      <path d="M40 6 L18 28 L21 31 L43 9 Z" fill="#b8c4d6" />
      <rect x={24} y={29} width={14} height={5} rx={2.5} fill={GOLD} transform="rotate(45 31 31.5)" />
      <rect x={10} y={29} width={14} height={5} rx={2.5} fill={GOLD} transform="rotate(-45 17 31.5)" />
      <rect x={33} y={34} width={5} height={10} rx={2.5} fill="#8b5a3c" transform="rotate(-45 35.5 39)" />
      <rect x={10} y={34} width={5} height={10} rx={2.5} fill="#8b5a3c" transform="rotate(45 12.5 39)" />
    </>
  ),
  bag: (
    <>
      <path d="M17 16 C 17 6, 31 6, 31 16" fill="none" stroke="#a54a7f" strokeWidth={3.5} strokeLinecap="round" />
      <path d="M9 16 L39 16 L41 42 Q41 44 39 44 L9 44 Q7 44 7 42 Z" fill="#ff7eb6" />
      <path d="M9 16 L39 16 L39.6 22 L8.4 22 Z" fill="#ff5a9f" />
      <path d="M24 28 l2 4 4.5 .6 -3.3 3 .8 4.4 -4 -2.2 -4 2.2 .8 -4.4 -3.3 -3 4.5 -.6 Z" fill="#ffffff" />
    </>
  ),
  medal: (
    <>
      <path d="M14 4 L22 4 L28 20 L20 22 Z" fill="#1cb0f6" />
      <path d="M34 4 L26 4 L20 20 L28 22 Z" fill="#ff5a5f" />
      <circle cx={24} cy={31} r={13} fill={GOLD_DARK} />
      <circle cx={24} cy={30} r={12} fill={GOLD} />
      <path d="M24 22 l2.5 5 5.5 .8 -4 3.9 1 5.5 -5 -2.6 -5 2.6 1 -5.5 -4 -3.9 5.5 -.8 Z" fill="#fff3b0" />
    </>
  ),
  trophy: (
    <>
      <path d="M13 9 C 3 9, 4 24, 16 24" fill="none" stroke={GOLD_DARK} strokeWidth={3.5} />
      <path d="M35 9 C 45 9, 44 24, 32 24" fill="none" stroke={GOLD_DARK} strokeWidth={3.5} />
      <path d="M12 5 L36 5 L36 14 C 36 24, 30 29, 24 29 C 18 29, 12 24, 12 14 Z" fill={GOLD} />
      <path d="M17 8 L20 8 L20 20 C 18 19, 17 16, 17 13 Z" fill="#fff3b0" opacity={0.8} />
      <rect x={21} y={28} width={6} height={7} fill={GOLD_DARK} />
      <rect x={14} y={35} width={20} height={8} rx={2.5} fill="#8b5a3c" />
      <rect x={18} y={37.5} width={12} height={3} rx={1.5} fill={GOLD} />
    </>
  ),
  house: (
    <>
      <path d="M8 22 L24 8 L40 22 L40 42 L8 42 Z" fill="#fff1d6" />
      <path d="M4 24 L24 6 L44 24 L40 27 L24 13 L8 27 Z" fill="#ff5a5f" />
      <rect x={20} y={29} width={9} height={13} rx={2} fill="#8b5a3c" />
      <rect x={11} y={27} width={6} height={6} rx={1} fill="#8fd3ff" />
      <rect x={32} y={27} width={6} height={6} rx={1} fill="#8fd3ff" />
      <rect x={32} y={9} width={5} height={9} fill="#c98a4b" />
    </>
  ),
  family: (
    <>
      <circle cx={14} cy={14} r={6} fill="#f2c39c" />
      <path d="M8 13 Q 8 6, 14 6 Q 20 6, 20 13 Q 17 9, 14 9 Q 11 9, 8 13 Z" fill="#6b3f22" />
      <path d="M5 40 Q 5 22, 14 22 Q 23 22, 23 40 Z" fill="#1cb0f6" />
      <circle cx={34} cy={14} r={6} fill="#e8b08a" />
      <path d="M27 18 Q 26 6, 34 6 Q 42 6, 41 18 Q 40 10, 34 10 Q 28 10, 27 18 Z" fill="#e0a000" />
      <path d="M25 40 Q 25 22, 34 22 Q 43 22, 43 40 Z" fill="#ff7eb6" />
      <circle cx={24} cy={27} r={4.5} fill="#f2c39c" />
      <path d="M17 44 Q 17 32, 24 32 Q 31 32, 31 44 Z" fill="#58cc02" />
    </>
  ),
  gear: (
    <>
      <g fill="#8e98ad">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <rect key={angle} x={20.5} y={3} width={7} height={10} rx={2} transform={`rotate(${angle} 24 24)`} />
        ))}
      </g>
      <circle cx={24} cy={24} r={14} fill="#a9b3c6" />
      <circle cx={24} cy={24} r={6} fill="#ffffff" />
    </>
  ),
  pencil: (
    <>
      <path d="M8 34 L30 12 L36 18 L14 40 L6 42 Z" fill={GOLD} />
      <path d="M30 12 L34 8 Q 36 6, 38 8 L40 10 Q 42 12, 40 14 L36 18 Z" fill="#ff7eb6" />
      <path d="M8 34 L14 40 L6 42 Z" fill="#f2c39c" />
      <path d="M6 42 L8 39.5 L9 40.5 Z" fill={INK} />
      <path d="M11 31 L33 9" stroke={GOLD_DARK} strokeWidth={2} />
    </>
  ),
  chart: (
    <>
      <rect x={6} y={30} width={8} height={12} rx={2} fill="#ff9f1c" />
      <rect x={18} y={22} width={8} height={20} rx={2} fill="#1cb0f6" />
      <rect x={30} y={12} width={8} height={30} rx={2} fill="#58cc02" />
      <path d="M6 22 L18 14 L28 17 L40 6" fill="none" stroke="#ff5a5f" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M34 5 L41 5 L41 12" fill="none" stroke="#ff5a5f" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  trash: (
    <>
      <rect x={18} y={4} width={12} height={5} rx={2} fill="#8e98ad" />
      <rect x={8} y={8} width={32} height={6} rx={3} fill="#a9b3c6" />
      <path d="M11 16 L37 16 L34 43 Q34 44 33 44 L15 44 Q14 44 14 43 Z" fill="#c6cfdd" />
      <path d="M19 21 L19.5 39 M24 21 L24 39 M29 21 L28.5 39" stroke="#8e98ad" strokeWidth={2.5} strokeLinecap="round" />
    </>
  ),
  repeat: (
    <>
      <path d="M10 22 A 14 14 0 0 1 36 16" fill="none" stroke="#1cb0f6" strokeWidth={5} strokeLinecap="round" />
      <path d="M38 26 A 14 14 0 0 1 12 32" fill="none" stroke="#58cc02" strokeWidth={5} strokeLinecap="round" />
      <path d="M30 9 L40 13 L35 22 Z" fill="#1cb0f6" />
      <path d="M18 39 L8 35 L13 26 Z" fill="#58cc02" />
    </>
  ),
  'speaker-on': (
    <>
      <path d="M6 18 L14 18 L24 9 L24 39 L14 30 L6 30 Z" fill="#a560f0" />
      <path d="M30 17 Q 35 24, 30 31" fill="none" stroke="#a560f0" strokeWidth={3.5} strokeLinecap="round" />
      <path d="M35 11 Q 45 24, 35 37" fill="none" stroke="#a560f0" strokeWidth={3.5} strokeLinecap="round" />
    </>
  ),
  'speaker-off': (
    <>
      <path d="M6 18 L14 18 L24 9 L24 39 L14 30 L6 30 Z" fill="#8e98ad" />
      <path d="M31 18 L43 30 M43 18 L31 30" stroke="#ff5a5f" strokeWidth={4} strokeLinecap="round" />
    </>
  ),
  lock: (
    <>
      <path d="M14 22 L14 15 A 10 10 0 0 1 34 15 L34 22" fill="none" stroke="#8e98ad" strokeWidth={5} />
      <rect x={8} y={20} width={32} height={24} rx={6} fill={GOLD} />
      <circle cx={24} cy={30} r={3.5} fill="#8b5a3c" />
      <rect x={22.5} y={31} width={3} height={7} rx={1.5} fill="#8b5a3c" />
    </>
  ),
  'lock-open': (
    <>
      <path d="M14 22 L14 13 A 10 10 0 0 1 33 9" fill="none" stroke="#8e98ad" strokeWidth={5} strokeLinecap="round" />
      <rect x={8} y={20} width={32} height={24} rx={6} fill="#58cc02" />
      <circle cx={24} cy={30} r={3.5} fill="#2f6b00" />
      <rect x={22.5} y={31} width={3} height={7} rx={1.5} fill="#2f6b00" />
    </>
  ),
  fire: (
    <>
      <path d="M24 3 C 30 12, 40 18, 40 30 C 40 39, 33 45, 24 45 C 15 45, 8 39, 8 30 C 8 22, 13 18, 15 12 C 18 17, 19 20, 21 21 C 21 14, 22 8, 24 3 Z" fill="#ff5a3c" />
      <path d="M24 18 C 28 24, 33 27, 33 34 C 33 40, 29 43, 24 43 C 19 43, 15 40, 15 34 C 15 29, 19 27, 20 23 C 22 26, 22 27, 23 28 C 23 24, 23 21, 24 18 Z" fill="#ff9f1c" />
      <path d="M24 30 C 26 33, 28 35, 28 38 C 28 41, 26 42, 24 42 C 22 42, 20 41, 20 38 C 20 35, 23 33, 24 30 Z" fill="#ffe066" />
    </>
  ),
  calendar: (
    <>
      <rect x={6} y={9} width={36} height={34} rx={6} fill="#ffffff" stroke="#e6e0ff" strokeWidth={2} />
      <path d="M6 15 Q 6 9, 12 9 L36 9 Q 42 9, 42 15 L42 19 L6 19 Z" fill="#ff5a5f" />
      <rect x={13} y={4} width={4} height={10} rx={2} fill="#8e98ad" />
      <rect x={31} y={4} width={4} height={10} rx={2} fill="#8e98ad" />
      {[12, 20, 28, 36].map((x) => [25, 32].map((y) => <rect key={`${x}-${y}`} x={x - 2.5} y={y - 2.5} width={5} height={5} rx={1.5} fill={x === 28 && y === 32 ? '#58cc02' : '#d9d3f5'} />))}
    </>
  ),
  star: <path d="M24 3 l6.2 13 14.3 1.8 -10.5 9.8 2.7 14.1 -12.7 -7 -12.7 7 2.7 -14.1 -10.5 -9.8 14.3 -1.8 Z" fill={GOLD} stroke={GOLD_DARK} strokeWidth={2} strokeLinejoin="round" />,
  crown: (
    <>
      <path d="M5 16 L15 24 L24 8 L33 24 L43 16 L39 38 L9 38 Z" fill={GOLD} stroke={GOLD_DARK} strokeWidth={2} strokeLinejoin="round" />
      <rect x={8} y={36} width={32} height={6} rx={2} fill={GOLD_DARK} />
      <circle cx={24} cy={30} r={3.5} fill="#ff5a5f" />
      <circle cx={15} cy={31} r={2.5} fill="#1cb0f6" />
      <circle cx={33} cy={31} r={2.5} fill="#58cc02" />
      <circle cx={5} cy={16} r={3} fill={GOLD} />
      <circle cx={24} cy={8} r={3} fill={GOLD} />
      <circle cx={43} cy={16} r={3} fill={GOLD} />
    </>
  ),
  equal: (
    <>
      <circle cx={24} cy={24} r={20} fill="#1cb0f6" />
      <rect x={13} y={16} width={22} height={5} rx={2.5} fill="#ffffff" />
      <rect x={13} y={27} width={22} height={5} rx={2.5} fill="#ffffff" />
    </>
  ),
  'finish-flag': (
    <>
      <rect x={7} y={4} width={4} height={41} rx={2} fill="#8b5a3c" />
      <path d="M11 6 L41 6 L41 26 L11 26 Z" fill="#ffffff" stroke={INK} strokeWidth={1.5} />
      {[0, 1, 2, 3, 4].map((col) =>
        [0, 1, 2, 3].map((row) =>
          (col + row) % 2 === 0 ? <rect key={`${col}-${row}`} x={11 + col * 6} y={6 + row * 5} width={6} height={5} fill={INK} /> : null,
        ),
      )}
    </>
  ),
  party: (
    <>
      <path d="M6 43 L16 15 L34 33 Z" fill="#a560f0" />
      <path d="M11 29 L13 23 L26 36 L20 38 Z" fill="#ffe066" />
      <circle cx={30} cy={8} r={3} fill="#ff5a5f" />
      <circle cx={40} cy={17} r={3} fill="#1cb0f6" />
      <circle cx={37} cy={6} r={2} fill="#58cc02" />
      <rect x={24} y={13} width={4} height={8} rx={2} fill="#ff9f1c" transform="rotate(30 26 17)" />
      <rect x={32} y={22} width={4} height={8} rx={2} fill="#ff7eb6" transform="rotate(-50 34 26)" />
      <path d="M42 28 l1.5 3 3 .4 -2.2 2 .5 3 -2.8 -1.5 -2.8 1.5 .5 -3 -2.2 -2 3 -.4 Z" fill={GOLD} />
    </>
  ),
  rainbow: (
    <>
      {['#ff5a5f', '#ff9f1c', '#ffe066', '#58cc02', '#1cb0f6', '#a560f0'].map((color, i) => (
        <path key={color} d={`M${4 + i * 3} 36 A ${20 - i * 3} ${20 - i * 3} 0 0 1 ${44 - i * 3} 36`} fill="none" stroke={color} strokeWidth={3.2} />
      ))}
      <ellipse cx={8} cy={37} rx={7} ry={4.5} fill="#ffffff" />
      <ellipse cx={40} cy={37} rx={7} ry={4.5} fill="#ffffff" />
    </>
  ),
  oops: (
    <>
      <circle cx={24} cy={25} r={19} fill="#ffe066" />
      <ellipse cx={17} cy={21} rx={2.5} ry={3.5} fill={INK} />
      <ellipse cx={31} cy={21} rx={2.5} ry={3.5} fill={INK} />
      <ellipse cx={24} cy={33} rx={4} ry={5} fill="#8b3a2c" />
      <path d="M38 8 C 41 13, 43 15, 43 18 C 43 21, 41 22, 39 22 C 37 22, 35 21, 35 18 C 35 15, 37 13, 38 8 Z" fill="#8fd3ff" />
    </>
  ),
  horseshoe: (
    <>
      <path d="M11 40 L11 22 A 13 13 0 0 1 37 22 L37 40" fill="none" stroke="#c98a4b" strokeWidth={9} strokeLinecap="round" />
      <path d="M11 40 L11 22 A 13 13 0 0 1 37 22 L37 40" fill="none" stroke="#e0a867" strokeWidth={4} strokeLinecap="round" />
      {[
        [11, 33],
        [37, 33],
        [13, 17],
        [35, 17],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={1.6} fill="#6b3f22" />
      ))}
    </>
  ),
  // --- Tournaments ---------------------------------------------------------------
  abacus: (
    <>
      <rect x={5} y={5} width={38} height={38} rx={5} fill="#8b5a3c" />
      <rect x={10} y={10} width={28} height={28} rx={2} fill="#fff1d6" />
      {[16, 24, 32].map((y, row) => (
        <g key={y}>
          <rect x={10} y={y - 1} width={28} height={2} fill="#c98a4b" />
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={13 + i * 6 + row * 3} cy={y} r={3} fill={['#ff5a5f', '#1cb0f6', '#58cc02'][row]} />
          ))}
        </g>
      ))}
    </>
  ),
  book: (
    <>
      <path d="M4 10 Q 14 6, 24 11 L24 42 Q 14 37, 4 41 Z" fill="#ffffff" stroke="#ff5a5f" strokeWidth={3} strokeLinejoin="round" />
      <path d="M44 10 Q 34 6, 24 11 L24 42 Q 34 37, 44 41 Z" fill="#ffffff" stroke="#ff5a5f" strokeWidth={3} strokeLinejoin="round" />
      <path d="M9 17 Q 14 15, 19 17 M9 23 Q 14 21, 19 23 M9 29 Q 14 27, 19 29 M29 17 Q 34 15, 39 17 M29 23 Q 34 21, 39 23" stroke="#d9d3f5" strokeWidth={2} fill="none" strokeLinecap="round" />
      <text x={33} y={34} fontSize={11} fontWeight={800} fontFamily="Fredoka, sans-serif" fill="#ff5a5f" textAnchor="middle">
        Aa
      </text>
    </>
  ),
  'flag-gb': (
    <>
      <clipPath id="flag-gb-clip">
        <rect x={3} y={9} width={42} height={30} rx={5} />
      </clipPath>
      <g clipPath="url(#flag-gb-clip)">
        <rect x={3} y={9} width={42} height={30} fill="#1f4aa8" />
        <path d="M3 9 L45 39 M45 9 L3 39" stroke="#ffffff" strokeWidth={7} />
        <path d="M3 9 L45 39 M45 9 L3 39" stroke="#e2233b" strokeWidth={2.5} />
        <path d="M24 9 L24 39 M3 24 L45 24" stroke="#ffffff" strokeWidth={10} />
        <path d="M24 9 L24 39 M3 24 L45 24" stroke="#e2233b" strokeWidth={6} />
      </g>
    </>
  ),
  'flag-fr': (
    <>
      <clipPath id="flag-fr-clip">
        <rect x={3} y={9} width={42} height={30} rx={5} />
      </clipPath>
      <g clipPath="url(#flag-fr-clip)">
        <rect x={3} y={9} width={14} height={30} fill="#1f4aa8" />
        <rect x={17} y={9} width={14} height={30} fill="#ffffff" />
        <rect x={31} y={9} width={14} height={30} fill="#e2233b" />
      </g>
    </>
  ),
  'flag-es': (
    <>
      <clipPath id="flag-es-clip">
        <rect x={3} y={9} width={42} height={30} rx={5} />
      </clipPath>
      <g clipPath="url(#flag-es-clip)">
        <rect x={3} y={9} width={42} height={30} fill="#c8102e" />
        <rect x={3} y={16.5} width={42} height={15} fill="#ffc400" />
        <rect x={11} y={20} width={6} height={8} rx={1.5} fill="#c8102e" opacity={0.8} />
      </g>
    </>
  ),
}
