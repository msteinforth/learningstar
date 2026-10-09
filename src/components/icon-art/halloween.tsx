import type { ReactNode } from 'react'

// Halloween shop items – same 48×48 flat style as rewards.tsx.

const INK = '#2b2250'
const ORANGE = '#ff8a3d'
const ORANGE_DARK = '#e86a10'
const NIGHT = '#2a1538'

const cuteEyes = (lx: number, rx: number, y: number, r = 2.2, color = INK) => (
  <>
    <circle cx={lx} cy={y} r={r} fill={color} />
    <circle cx={rx} cy={y} r={r} fill={color} />
    <circle cx={lx + 0.7} cy={y - 0.8} r={r * 0.32} fill="#ffffff" />
    <circle cx={rx + 0.7} cy={y - 0.8} r={r * 0.32} fill="#ffffff" />
  </>
)

export const halloweenIcons: Record<string, ReactNode> = {
  // --- Kopfschmuck ---
  'witch-hat': (
    <>
      <path d="M3 40 C 10 34, 38 34, 45 40 C 38 44, 10 44, 3 40 Z" fill={NIGHT} />
      <path d="M11 38 L20 8 Q 22 3, 27 5 L35 9 Q 30 11, 31 16 L37 38 Z" fill="#3d1f55" />
      <path d="M12 33 C 20 35, 28 35, 36 33 L37 38 C 28 40, 20 40, 11 38 Z" fill={ORANGE} />
      <rect x={20} y={32} width={8} height={7} rx={1.5} fill="none" stroke="#ffd23f" strokeWidth={2} />
      <circle cx={27} cy={6} r={2} fill="#a560f0" />
      <path d="M17 22 L18 24.5 L20.5 25 L18.5 26.5 L19 29 L17 27.6 L15 29 L15.5 26.5 L13.5 25 L16 24.5 Z" fill="#ffd23f" />
    </>
  ),
  'pumpkin-hat': (
    <>
      <ellipse cx={15} cy={30} rx={11} ry={12} fill={ORANGE_DARK} />
      <ellipse cx={33} cy={30} rx={11} ry={12} fill={ORANGE_DARK} />
      <ellipse cx={24} cy={30} rx={11} ry={14} fill={ORANGE} />
      <path d="M24 16 Q 22 10, 26 6" fill="none" stroke="#46a302" strokeWidth={4} strokeLinecap="round" />
      <path d="M26 10 Q 34 4, 37 10 Q 31 12, 26 10 Z" fill="#58cc02" />
      <path d="M17 26 L20 22 L23 26 Z M25 26 L28 22 L31 26 Z" fill="#ffd23f" />
      <path d="M15 33 Q 24 41, 33 33 L30 34 L28 32 L26 35 L24 32 L22 35 L20 32 L18 34 Z" fill="#ffd23f" />
    </>
  ),
  'devil-horns': (
    <>
      <path d="M4 38 C 12 32, 36 32, 44 38" fill="none" stroke="#e5383b" strokeWidth={4} strokeLinecap="round" />
      <path d="M11 34 C 6 26, 7 15, 13 8 C 14 17, 17 24, 20 32 Z" fill="#ff5a5f" stroke="#d93d42" strokeWidth={1.5} strokeLinejoin="round" />
      <path d="M37 34 C 42 26, 41 15, 35 8 C 34 17, 31 24, 28 32 Z" fill="#ff5a5f" stroke="#d93d42" strokeWidth={1.5} strokeLinejoin="round" />
      <path d="M12 26 C 10 22, 11 17, 13 14" fill="none" stroke="#ffb3b5" strokeWidth={1.8} strokeLinecap="round" />
      <path d="M36 26 C 38 22, 37 17, 35 14" fill="none" stroke="#ffb3b5" strokeWidth={1.8} strokeLinecap="round" />
    </>
  ),
  'bat-ears': (
    <>
      <path d="M4 38 C 12 31, 36 31, 44 38" fill="none" stroke={NIGHT} strokeWidth={4} strokeLinecap="round" />
      <path d="M24 32 C 20 26, 14 24, 6 26 C 9 22, 9 18, 7 14 C 11 16, 15 15, 17 12 C 18 16, 21 18, 24 18 C 27 18, 30 16, 31 12 C 33 15, 37 16, 41 14 C 39 18, 39 22, 42 26 C 34 24, 28 26, 24 32 Z" fill={NIGHT} />
      <circle cx={24} cy={24} r={5} fill="#3d1f55" />
      <path d="M21 21 L20 17 L23 20 Z M27 21 L28 17 L25 20 Z" fill="#3d1f55" />
      {cuteEyes(22, 26, 24, 1.2, '#ffd23f')}
    </>
  ),

  // --- Freunde ---
  'jack-o-lantern': (
    <>
      <ellipse cx={14} cy={28} rx={11} ry={14} fill={ORANGE_DARK} />
      <ellipse cx={34} cy={28} rx={11} ry={14} fill={ORANGE_DARK} />
      <ellipse cx={24} cy={28} rx={12} ry={16} fill={ORANGE} />
      <path d="M22 13 Q 21 7, 25 4 L28 6 Q 25 9, 26 13 Z" fill="#46a302" />
      <path d="M14 23 L19 17 L23 23 Z M25 23 L29 17 L34 23 Z" fill="#ffd23f" />
      <path d="M13 31 Q 24 42, 35 31 L32 32 L30 30 L27 34 L24 30 L21 34 L18 30 L16 32 Z" fill="#ffd23f" />
      <path d="M8 22 Q 7 30, 9 36" fill="none" stroke="#ffb066" strokeWidth={1.8} strokeLinecap="round" opacity={0.7} />
    </>
  ),
  'bat-buddy': (
    <>
      <path d="M24 26 C 18 16, 10 14, 2 18 C 6 21, 6 25, 4 30 C 8 27, 12 28, 14 31 C 15 28, 18 27, 21 29 Z" fill="#3d1f55" />
      <path d="M24 26 C 30 16, 38 14, 46 18 C 42 21, 42 25, 44 30 C 40 27, 36 28, 34 31 C 33 28, 30 27, 27 29 Z" fill="#3d1f55" />
      <ellipse cx={24} cy={26} rx={8} ry={9} fill={NIGHT} />
      <path d="M18 19 L17 11 L22 17 Z M30 19 L31 11 L26 17 Z" fill={NIGHT} />
      {cuteEyes(21, 27, 24, 2, '#ffd23f')}
      <path d="M21.5 29 L22.5 31 L23.5 29 M24.5 29 L25.5 31 L26.5 29" fill="#ffffff" />
      <ellipse cx={18.5} cy={28} rx={1.6} ry={1} fill="#ff7eb6" />
      <ellipse cx={29.5} cy={28} rx={1.6} ry={1} fill="#ff7eb6" />
    </>
  ),
  'ghost-buddy': (
    <>
      <path d="M8 44 L8 22 C 8 10, 15 4, 24 4 C 33 4, 40 10, 40 22 L40 44 L34 39 L29 45 L24 39 L19 45 L14 39 Z" fill="#ffffff" stroke="#e6e0ff" strokeWidth={1.5} />
      <ellipse cx={18} cy={21} rx={3} ry={4} fill={INK} />
      <ellipse cx={30} cy={21} rx={3} ry={4} fill={INK} />
      <circle cx={19} cy={19.5} r={1} fill="#ffffff" />
      <circle cx={31} cy={19.5} r={1} fill="#ffffff" />
      <ellipse cx={24} cy={30} rx={3} ry={3.5} fill={INK} />
      <ellipse cx={13} cy={27} rx={2.6} ry={1.6} fill="#ffb3c6" />
      <ellipse cx={35} cy={27} rx={2.6} ry={1.6} fill="#ffb3c6" />
      <path d="M8 26 C 3 24, 2 30, 6 31" fill="#ffffff" stroke="#e6e0ff" strokeWidth={1.5} />
    </>
  ),
  'black-cat': (
    <>
      <path d="M8 20 L10 4 L20 13 Z" fill={NIGHT} />
      <path d="M40 20 L38 4 L28 13 Z" fill={NIGHT} />
      <path d="M11 16 L12 9 L17 14 Z M37 16 L36 9 L31 14 Z" fill="#a560f0" />
      <ellipse cx={24} cy={26} rx={18} ry={16} fill={NIGHT} />
      <ellipse cx={17} cy={25} rx={4.5} ry={5} fill="#c6f26b" />
      <ellipse cx={31} cy={25} rx={4.5} ry={5} fill="#c6f26b" />
      <ellipse cx={17} cy={25} rx={1.6} ry={4} fill={INK} />
      <ellipse cx={31} cy={25} rx={1.6} ry={4} fill={INK} />
      <path d="M22 31 L26 31 L24 33.5 Z" fill="#ff7eb6" />
      <path d="M24 33.5 Q 22 36, 20 35 M24 33.5 Q 26 36, 28 35" fill="none" stroke="#6b5a80" strokeWidth={1.3} strokeLinecap="round" />
      <path d="M6 30 L14 31 M6 35 L14 33 M42 30 L34 31 M42 35 L34 33" stroke="#6b5a80" strokeWidth={1.3} strokeLinecap="round" />
      <path d="M17 41 Q 24 44, 31 41" fill="none" stroke={ORANGE} strokeWidth={3} strokeLinecap="round" />
    </>
  ),
  spider: (
    <>
      <path d="M24 0 L24 12" stroke="#d9d3f5" strokeWidth={1.5} />
      {[-1, 1].map((side) => (
        <g key={side} fill="none" stroke={NIGHT} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
          <path d={`M${24 + side * 8} 22 L${24 + side * 16} 14 L${24 + side * 21} 20`} />
          <path d={`M${24 + side * 9} 26 L${24 + side * 19} 22 L${24 + side * 22} 30`} />
          <path d={`M${24 + side * 9} 30 L${24 + side * 18} 32 L${24 + side * 20} 41`} />
          <path d={`M${24 + side * 7} 33 L${24 + side * 13} 38 L${24 + side * 13} 46`} />
        </g>
      ))}
      <circle cx={24} cy={27} r={11} fill="#3d1f55" />
      <circle cx={24} cy={16} r={6} fill="#3d1f55" />
      {cuteEyes(20.5, 27.5, 26, 2.6)}
      <circle cx={20.5} cy={26} r={3.6} fill="#ffffff" />
      <circle cx={27.5} cy={26} r={3.6} fill="#ffffff" />
      {cuteEyes(21, 28, 26.5, 1.8)}
      <path d="M21 32 Q 24 34.5, 27 32" fill="none" stroke="#ffffff" strokeWidth={1.4} strokeLinecap="round" />
    </>
  ),
  candy: (
    <>
      <g transform="rotate(-25 18 22)">
        <path d="M2 22 L8 16 L8 28 Z M34 22 L28 16 L28 28 Z" fill="#a560f0" />
        <ellipse cx={18} cy={22} rx={11} ry={8} fill="#ff7eb6" />
        <path d="M11 16 Q 14 22, 11 28 M18 14 Q 21 22, 18 30 M25 16 Q 28 22, 25 28" fill="none" stroke="#ffffff" strokeWidth={2} strokeLinecap="round" />
      </g>
      <path d="M24 46 L32 30 L40 46 Z" fill="#ffffff" />
      <path d="M26.5 41 L37.5 41 L40 46 L24 46 Z" fill="#ffd23f" />
      <path d="M28.5 37 L35.5 37 L37.5 41 L26.5 41 Z" fill={ORANGE} />
      <circle cx={38} cy={12} r={6} fill="#58cc02" />
      <path d="M33 12 L29 9 L29 15 Z M43 12 L47 9 L47 15 Z" fill="#46a302" />
      <path d="M35 9 Q 38 12, 35 15 M41 9 Q 38 12, 41 15" fill="none" stroke="#c6f26b" strokeWidth={1.4} />
    </>
  ),
}
