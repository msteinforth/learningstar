import type { ReactNode } from 'react'

// Badges and shop items (hats and buddies) – same 48×48 flat style.

const GOLD = '#ffc629'
const GOLD_DARK = '#e0a000'
const INK = '#2b2250'

const eyes = (lx: number, rx: number, y: number, r = 2.2) => (
  <>
    <circle cx={lx} cy={y} r={r} fill={INK} />
    <circle cx={rx} cy={y} r={r} fill={INK} />
    <circle cx={lx + 0.7} cy={y - 0.8} r={0.7} fill="#ffffff" />
    <circle cx={rx + 0.7} cy={y - 0.8} r={0.7} fill="#ffffff" />
  </>
)

export const rewardIcons: Record<string, ReactNode> = {
  chick: (
    <>
      <circle cx={24} cy={22} r={13} fill="#ffe066" />
      <path d="M20 21 L28 21 L24 26 Z" fill="#ff9f1c" />
      {eyes(19, 29, 17)}
      <path d="M7 28 L12 25 L17 29 L22 25 L27 29 L32 25 L37 29 L41 26 L39 38 Q 38 44, 32 44 L16 44 Q 10 44, 9 38 Z" fill="#ffffff" stroke="#e6e0ff" strokeWidth={1.5} />
      <path d="M20 6 Q 23 2, 26 6" fill="none" stroke="#ffe066" strokeWidth={3} strokeLinecap="round" />
    </>
  ),
  bow: (
    <>
      <path d="M24 24 C 16 12, 4 12, 5 22 C 6 32, 16 30, 24 24 Z" fill="#ff7eb6" />
      <path d="M24 24 C 32 12, 44 12, 43 22 C 42 32, 32 30, 24 24 Z" fill="#ff7eb6" />
      <path d="M22 26 L15 43 L20 40 L23 45 L24 27 Z" fill="#ff5a9f" />
      <path d="M26 26 L33 43 L28 40 L25 45 L24 27 Z" fill="#ff5a9f" />
      <circle cx={24} cy={24} r={5} fill="#ff5a9f" />
      <path d="M10 20 Q 14 17, 18 21" fill="none" stroke="#ffc2dd" strokeWidth={2} strokeLinecap="round" />
    </>
  ),
  sparkles: (
    <>
      <path d="M20 6 Q 22 18, 34 20 Q 22 22, 20 34 Q 18 22, 6 20 Q 18 18, 20 6 Z" fill={GOLD} />
      <path d="M36 26 Q 37 33, 44 34 Q 37 35, 36 42 Q 35 35, 28 34 Q 35 33, 36 26 Z" fill="#ff9f1c" />
      <path d="M37 4 Q 38 9, 43 10 Q 38 11, 37 16 Q 36 11, 31 10 Q 36 9, 37 4 Z" fill="#ffe066" />
    </>
  ),
  lightning: (
    <>
      <path d="M28 3 L9 27 L22 27 L18 45 L39 18 L26 18 Z" fill={GOLD} stroke={GOLD_DARK} strokeWidth={2} strokeLinejoin="round" />
    </>
  ),
  'star-shine': (
    <>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <rect key={angle} x={22.5} y={1} width={3} height={7} rx={1.5} fill="#ffe066" transform={`rotate(${angle} 24 24)`} />
      ))}
      <path d="M24 9 l4.6 9.6 10.5 1.3 -7.7 7.2 2 10.4 -9.4 -5.2 -9.4 5.2 2 -10.4 -7.7 -7.2 10.5 -1.3 Z" fill={GOLD} stroke={GOLD_DARK} strokeWidth={1.5} strokeLinejoin="round" />
    </>
  ),
  treasure: (
    <>
      <path d="M6 20 Q 6 8, 24 8 Q 42 8, 42 20 Z" fill="#a0612f" />
      <rect x={6} y={20} width={36} height={22} rx={3} fill="#8b5a3c" />
      <rect x={6} y={19} width={36} height={4} fill={GOLD_DARK} />
      <rect x={21} y={17} width={6} height={9} rx={1.5} fill={GOLD} />
      <circle cx={14} cy={15} r={3} fill={GOLD} />
      <circle cx={20} cy={12} r={3} fill={GOLD} />
      <circle cx={31} cy={13} r={3} fill={GOLD} />
      <circle cx={36} cy={16} r={2.5} fill={GOLD} />
    </>
  ),
  'guard-hat': (
    <>
      <path d="M12 38 C 8 14, 16 4, 24 4 C 32 4, 40 14, 36 38 Z" fill={INK} />
      <path d="M17 12 Q 20 8, 24 8" fill="none" stroke="#4a4178" strokeWidth={2} strokeLinecap="round" />
      <rect x={10} y={33} width={28} height={6} rx={2} fill="#e2233b" />
      <path d="M13 39 Q 24 46, 35 39" fill="none" stroke={GOLD} strokeWidth={2.5} strokeLinecap="round" />
    </>
  ),
  croissant: (
    <>
      <path d="M5 30 C 6 16, 17 10, 24 10 C 31 10, 42 16, 43 30 C 38 26, 34 26, 31 28 C 29 24, 19 24, 17 28 C 14 26, 10 26, 5 30 Z" fill="#e8a54c" />
      <path d="M16 13 Q 18 22, 17 28 M24 10 Q 25 18, 24 25 M32 13 Q 30 22, 31 28" fill="none" stroke="#b86f1f" strokeWidth={2} strokeLinecap="round" />
      <path d="M5 30 Q 7 34, 11 33 M43 30 Q 41 34, 37 33" stroke="#e8a54c" strokeWidth={4} strokeLinecap="round" fill="none" />
    </>
  ),
  fan: (
    <>
      <path d="M24 40 L4 20 A 28 28 0 0 1 44 20 Z" fill="#e2233b" />
      {[-45, -30, -15, 0, 15, 30, 45].map((angle) => (
        <line key={angle} x1={24} y1={40} x2={24} y2={13} stroke="#8b1020" strokeWidth={1.5} transform={`rotate(${angle} 24 40)`} />
      ))}
      <path d="M8 18 A 23 23 0 0 1 40 18" fill="none" stroke={GOLD} strokeWidth={2.5} />
      <circle cx={24} cy={40} r={3.5} fill={GOLD} />
    </>
  ),
  shield: (
    <>
      <path d="M24 4 L41 10 L41 22 C 41 33, 33 41, 24 45 C 15 41, 7 33, 7 22 L7 10 Z" fill="#1cb0f6" stroke="#0e8fd0" strokeWidth={2} strokeLinejoin="round" />
      <path d="M24 4 L24 45 C 15 41, 7 33, 7 22 L7 10 Z" fill="#46c2ff" />
      <path d="M24 14 l3.2 6.5 7.1 1 -5.2 5 1.2 7 -6.3 -3.3 -6.3 3.3 1.2 -7 -5.2 -5 7.1 -1 Z" fill={GOLD} />
    </>
  ),
  carousel: (
    <>
      <path d="M4 18 L24 4 L44 18 Z" fill="#ff5a5f" />
      <path d="M11 18 L24 4 L17 18 Z M24 4 L31 18 L37 18 Z" fill="#ffffff" />
      <rect x={4} y={17} width={40} height={4} rx={2} fill={GOLD} />
      <rect x={12} y={21} width={2.5} height={18} fill={GOLD_DARK} />
      <rect x={34} y={21} width={2.5} height={18} fill={GOLD_DARK} />
      <rect x={23} y={21} width={2.5} height={18} fill={GOLD_DARK} />
      <ellipse cx={13} cy={31} rx={5} ry={3} fill="#ffffff" />
      <ellipse cx={35} cy={28} rx={5} ry={3} fill="#ff7eb6" />
      <rect x={4} y={39} width={40} height={5} rx={2.5} fill="#a560f0" />
    </>
  ),
  // --- Hats ----------------------------------------------------------------------------
  cap: (
    <>
      <path d="M8 30 C 8 16, 16 9, 26 9 C 36 9, 40 18, 40 30 Z" fill="#1cb0f6" />
      <path d="M26 9 C 22 14, 21 22, 22 30" fill="none" stroke="#0e8fd0" strokeWidth={2} />
      <path d="M4 30 L46 30 Q 46 36, 38 36 L8 36 Q 4 36, 4 30 Z" fill="#0e8fd0" />
      <circle cx={26} cy={9} r={2.5} fill="#ff5a5f" />
    </>
  ),
  flowers: (
    <>
      <ellipse cx={24} cy={30} rx={20} ry={10} fill="none" stroke="#58cc02" strokeWidth={4} />
      {[
        [6, 28, '#ff7eb6'],
        [14, 22, '#ffe066'],
        [24, 20, '#ff7eb6'],
        [34, 22, '#a560f0'],
        [42, 28, '#ffe066'],
        [34, 38, '#ff7eb6'],
        [14, 38, '#a560f0'],
      ].map(([x, y, color]) => (
        <g key={`${x}-${y}`}>
          {[0, 72, 144, 216, 288].map((angle) => (
            <circle key={angle} cx={Number(x)} cy={Number(y) - 3.2} r={2.6} fill={String(color)} transform={`rotate(${angle} ${x} ${y})`} />
          ))}
          <circle cx={Number(x)} cy={Number(y)} r={2} fill="#ffffff" />
        </g>
      ))}
    </>
  ),
  'top-hat': (
    <>
      <rect x={12} y={6} width={24} height={28} rx={3} fill={INK} />
      <rect x={12} y={26} width={24} height={5} fill="#ff5a5f" />
      <ellipse cx={24} cy={35} rx={20} ry={5} fill={INK} />
      <path d="M16 10 L16 22" stroke="#4a4178" strokeWidth={2.5} strokeLinecap="round" />
    </>
  ),
  'party-hat': (
    <>
      <path d="M24 5 L39 42 L9 42 Z" fill="#a560f0" />
      <path d="M17.5 24 L30.5 24 L33 30 L15 30 Z" fill="#ffe066" />
      <path d="M12.6 36 L35.4 36 L37 40 L11 40 Z" fill="#58cc02" />
      <circle cx={24} cy={5} r={4.5} fill="#ff7eb6" />
      <ellipse cx={24} cy={43} rx={16} ry={3} fill="#8440cf" />
    </>
  ),
  'grad-cap': (
    <>
      <path d="M14 22 L14 32 Q 24 38, 34 32 L34 22 Z" fill={INK} />
      <path d="M2 18 L24 8 L46 18 L24 28 Z" fill="#3b3170" />
      <path d="M24 18 L40 23 L40 34" fill="none" stroke={GOLD} strokeWidth={2} />
      <circle cx={40} cy={36} r={3} fill={GOLD} />
      <circle cx={24} cy={18} r={2.5} fill={GOLD} />
    </>
  ),
  // --- Buddies -----------------------------------------------------------------------------
  carrot: (
    <>
      <path d="M26 16 C 34 16, 36 22, 34 26 L14 45 Q 11 47, 10 44 L22 19 C 23 17, 24 16, 26 16 Z" fill="#ff9f1c" />
      <path d="M18 30 L22 32 M16 36 L19 37 M24 24 L28 26" stroke="#e07f00" strokeWidth={2} strokeLinecap="round" />
      <path d="M28 17 C 26 10, 28 4, 32 3 C 32 9, 31 12, 30 16 Z" fill="#58cc02" />
      <path d="M30 18 C 34 12, 40 11, 44 13 C 40 16, 36 18, 32 19 Z" fill="#46a302" />
      <path d="M29 17 C 33 9, 38 6, 41 6 C 39 10, 35 14, 31 18 Z" fill="#58cc02" />
    </>
  ),
  apple: (
    <>
      <path d="M24 14 C 18 9, 6 11, 7 25 C 8 37, 16 45, 24 41 C 32 45, 40 37, 41 25 C 42 11, 30 9, 24 14 Z" fill="#ff5a5f" />
      <path d="M13 18 Q 11 23, 13 28" fill="none" stroke="#ffb3b5" strokeWidth={3} strokeLinecap="round" />
      <path d="M24 14 Q 23 8, 26 4" fill="none" stroke="#8b5a3c" strokeWidth={3} strokeLinecap="round" />
      <path d="M26 9 C 30 3, 37 3, 39 5 C 36 10, 31 11, 26 9 Z" fill="#58cc02" />
    </>
  ),
  butterfly: (
    <>
      <path d="M24 22 C 18 6, 3 6, 5 18 C 6 26, 16 26, 24 24 Z" fill="#a560f0" />
      <path d="M24 22 C 30 6, 45 6, 43 18 C 42 26, 32 26, 24 24 Z" fill="#a560f0" />
      <path d="M24 26 C 16 26, 7 32, 11 39 C 15 44, 22 36, 24 28 Z" fill="#ff7eb6" />
      <path d="M24 26 C 32 26, 41 32, 37 39 C 33 44, 26 36, 24 28 Z" fill="#ff7eb6" />
      <circle cx={13} cy={15} r={3} fill="#ffe066" />
      <circle cx={35} cy={15} r={3} fill="#ffe066" />
      <rect x={22.5} y={16} width={3} height={22} rx={1.5} fill={INK} />
      <path d="M23 17 Q 20 10, 17 9 M25 17 Q 28 10, 31 9" fill="none" stroke={INK} strokeWidth={1.5} strokeLinecap="round" />
    </>
  ),
  bird: (
    <>
      <ellipse cx={22} cy={28} rx={16} ry={13} fill="#1cb0f6" />
      <circle cx={30} cy={18} r={10} fill="#1cb0f6" />
      <path d="M38 17 L46 20 L38 22 Z" fill="#ff9f1c" />
      <path d="M8 28 C 4 22, 4 18, 6 16 C 10 20, 13 24, 14 28 Z" fill="#0e8fd0" />
      <path d="M14 26 C 18 32, 26 34, 32 30 C 28 38, 18 38, 14 26 Z" fill="#0e8fd0" />
      <ellipse cx={24} cy={33} rx={8} ry={6} fill="#8fd3ff" />
      {eyes(33, 33, 16)}
      <path d="M18 40 L16 45 M26 40 L28 45" stroke="#ff9f1c" strokeWidth={2} strokeLinecap="round" />
    </>
  ),
  cat: (
    <>
      <path d="M8 20 L10 4 L20 13 Z" fill="#ff9f1c" />
      <path d="M40 20 L38 4 L28 13 Z" fill="#ff9f1c" />
      <path d="M11 17 L12 9 L17 14 Z M37 17 L36 9 L31 14 Z" fill="#ffc2dd" />
      <ellipse cx={24} cy={26} rx={18} ry={16} fill="#ff9f1c" />
      <path d="M16 14 L18 20 M24 12 L24 18 M32 14 L30 20" stroke="#e07f00" strokeWidth={2.5} strokeLinecap="round" />
      <ellipse cx={24} cy={33} rx={9} ry={6.5} fill="#fff1d6" />
      {eyes(17, 31, 26, 2.6)}
      <path d="M22 30 L26 30 L24 32.5 Z" fill="#ff7eb6" />
      <path d="M24 32.5 Q 22 35, 20 34 M24 32.5 Q 26 35, 28 34" fill="none" stroke={INK} strokeWidth={1.3} strokeLinecap="round" />
      <path d="M6 30 L14 31 M6 35 L14 33 M42 30 L34 31 M42 35 L34 33" stroke="#e07f00" strokeWidth={1.3} strokeLinecap="round" />
    </>
  ),
  dog: (
    <>
      <ellipse cx={24} cy={25} rx={16} ry={16} fill="#c98a4b" />
      <path d="M9 12 C 3 14, 2 28, 7 32 C 11 30, 12 20, 13 14 Z" fill="#8b5a3c" />
      <path d="M39 12 C 45 14, 46 28, 41 32 C 37 30, 36 20, 35 14 Z" fill="#8b5a3c" />
      <ellipse cx={30} cy={20} rx={6} ry={5} fill="#fff1d6" />
      <ellipse cx={24} cy={33} rx={10} ry={8} fill="#fff1d6" />
      {eyes(18, 30, 22, 2.6)}
      <ellipse cx={24} cy={30} rx={4} ry={3} fill={INK} />
      <path d="M24 33 L24 36 M24 36 Q 21 38, 19 36 M24 36 Q 27 38, 29 36" fill="none" stroke={INK} strokeWidth={1.4} strokeLinecap="round" />
      <path d="M22 38 Q 24 43, 26 38 Z" fill="#ff7eb6" />
    </>
  ),
  paw: (
    <>
      <ellipse cx={24} cy={32} rx={11} ry={9} fill="#8b5a3c" />
      <ellipse cx={11} cy={21} rx={4.5} ry={6} fill="#8b5a3c" transform="rotate(-20 11 21)" />
      <ellipse cx={19} cy={13} rx={4.5} ry={6} fill="#8b5a3c" />
      <ellipse cx={29} cy={13} rx={4.5} ry={6} fill="#8b5a3c" />
      <ellipse cx={37} cy={21} rx={4.5} ry={6} fill="#8b5a3c" transform="rotate(20 37 21)" />
    </>
  ),
}
