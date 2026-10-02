import type { ReactNode } from 'react'

// Snacks and drinks for the shop ("Freunde" slot) – same 48×48 flat style as rewards.tsx.

const INK = '#2b2250'

const face = (cx: number, cy: number) => (
  <>
    <circle cx={cx - 4} cy={cy} r={1.7} fill={INK} />
    <circle cx={cx + 4} cy={cy} r={1.7} fill={INK} />
    <path d={`M${cx - 2.5} ${cy + 3} Q ${cx} ${cy + 5.5}, ${cx + 2.5} ${cy + 3}`} fill="none" stroke={INK} strokeWidth={1.4} strokeLinecap="round" />
  </>
)

export const snackIcons: Record<string, ReactNode> = {
  cocoa: (
    <>
      <path d="M17 10 Q 14 6, 17 3 M24 10 Q 21 6, 24 2 M31 10 Q 28 6, 31 3" fill="none" stroke="#d9d3f5" strokeWidth={2.2} strokeLinecap="round" />
      <path d="M36 20 C 45 20, 45 33, 35 33" fill="none" stroke="#ff7eb6" strokeWidth={4} strokeLinecap="round" />
      <path d="M9 14 L39 14 L36 40 Q 35.5 44, 31 44 L17 44 Q 12.5 44, 12 40 Z" fill="#ff7eb6" />
      <ellipse cx={24} cy={15} rx={15} ry={3.5} fill="#7a4a2e" />
      <rect x={15} y={12} width={6} height={5} rx={1.5} fill="#ffffff" transform="rotate(-12 18 14)" />
      <rect x={24} y={11.5} width={6} height={5} rx={1.5} fill="#fff1d6" transform="rotate(10 27 14)" />
      <circle cx={18} cy={30} r={2.4} fill="#ffffff" opacity={0.85} />
      <circle cx={24} cy={27} r={1.6} fill="#ffffff" opacity={0.85} />
      <circle cx={30} cy={31} r={2} fill="#ffffff" opacity={0.85} />
    </>
  ),
  cola: (
    <>
      <path d="M20 3 L28 3 L28 9 C 28 13, 33 15, 33 22 L33 41 Q 33 45, 29 45 L19 45 Q 15 45, 15 41 L15 22 C 15 15, 20 13, 20 9 Z" fill="#5a2e1a" />
      <rect x={19.5} y={1.5} width={9} height={4} rx={1.2} fill="#ff5a5f" />
      <path d="M15 25 L33 25 L33 33 L15 33 Z" fill="#ff5a5f" />
      <path d="M17 29 Q 21 26, 24 29 T 31 29" fill="none" stroke="#ffffff" strokeWidth={1.8} strokeLinecap="round" />
      <path d="M18.5 15 C 18 18, 18 21, 18.5 23" fill="none" stroke="#ffffff" strokeWidth={1.6} strokeLinecap="round" opacity={0.5} />
      <circle cx={21} cy={38} r={1.2} fill="#c98a4b" />
      <circle cx={26} cy={40} r={1} fill="#c98a4b" />
      <circle cx={24} cy={36} r={0.8} fill="#c98a4b" />
      <circle cx={37} cy={10} r={1.6} fill="none" stroke="#8fd3ff" strokeWidth={1.2} />
      <circle cx={40} cy={16} r={1.1} fill="none" stroke="#8fd3ff" strokeWidth={1.2} />
      <circle cx={35} cy={4} r={1} fill="none" stroke="#8fd3ff" strokeWidth={1.2} />
    </>
  ),
  pizza: (
    <>
      <path d="M24 44 L6 10 Q 24 2, 42 10 Z" fill="#ffd23f" />
      <path d="M6 10 Q 24 2, 42 10 L40 14 Q 24 7, 8 14 Z" fill="#e8a54c" />
      <circle cx={18} cy={18} r={3.6} fill="#e5383b" />
      <circle cx={29} cy={21} r={3.6} fill="#e5383b" />
      <circle cx={23} cy={31} r={3} fill="#e5383b" />
      <circle cx={17.2} cy={17.2} r={0.8} fill="#ff8a8c" />
      <circle cx={28.2} cy={20.2} r={0.8} fill="#ff8a8c" />
      <path d="M33 14 L35 16 M21 24 L22 26.5 M14 13 L15.5 14.5" stroke="#58cc02" strokeWidth={1.8} strokeLinecap="round" />
      <path d="M33 26 Q 34 31, 32 34" fill="none" stroke="#ffd23f" strokeWidth={2.4} strokeLinecap="round" />
    </>
  ),
  'ice-cream': (
    <>
      <path d="M14 24 L24 46 L34 24 Z" fill="#e8a54c" />
      <path d="M17 27 L29 39 M22 25 L32 32 M31 27 L19 39 M26 25 L16 32" stroke="#c98a4b" strokeWidth={1.4} />
      <circle cx={19} cy={20} r={7} fill="#ffb3c6" />
      <circle cx={29} cy={20} r={7} fill="#fff1d6" />
      <circle cx={24} cy={12} r={7.5} fill="#8fd3ff" />
      <path d="M12 24 Q 14 28, 17 24 Q 20 28, 24 24 Q 28 28, 31 24 Q 34 28, 36 24" fill="#fff1d6" />
      <circle cx={24} cy={4} r={3} fill="#e5383b" />
      <path d="M24 1 Q 26 -1, 28 0" fill="none" stroke="#58cc02" strokeWidth={1.4} strokeLinecap="round" />
      {[
        [20, 11, '#ff7eb6'],
        [27, 14, '#ffd23f'],
        [22, 16, '#58cc02'],
        [28, 9, '#a560f0'],
      ].map(([x, y, color]) => (
        <rect key={`${x}-${y}`} x={x as number} y={y as number} width={3} height={1.4} rx={0.7} fill={color as string} transform={`rotate(30 ${x} ${y})`} />
      ))}
    </>
  ),
  donut: (
    <>
      <circle cx={24} cy={25} r={19} fill="#e8a54c" />
      <path d="M8 22 C 8 11, 18 6, 24 6 C 32 6, 41 11, 41 21 C 41 27, 38 25, 36 29 C 34 33, 31 29, 28 32 C 25 35, 22 30, 19 33 C 16 36, 13 30, 10 30 C 8 30, 8 26, 8 22 Z" fill="#ff7eb6" />
      <circle cx={24} cy={23} r={6} fill="#ffffff" stroke="#e8a54c" strokeWidth={2} />
      {[
        [14, 14, 30, '#ffd23f'],
        [31, 12, -20, '#8fd3ff'],
        [35, 21, 60, '#58cc02'],
        [13, 23, -40, '#ffffff'],
        [22, 11, 10, '#a560f0'],
        [30, 28, 80, '#ffd23f'],
        [17, 28, 20, '#8fd3ff'],
      ].map(([x, y, angle, color]) => (
        <rect key={`${x}-${y}`} x={x as number} y={y as number} width={4} height={1.6} rx={0.8} fill={color as string} transform={`rotate(${angle} ${x} ${y})`} />
      ))}
    </>
  ),
  lollipop: (
    <>
      <rect x={22.5} y={26} width={3} height={20} rx={1.5} fill="#ffffff" stroke="#d9d3f5" strokeWidth={1} />
      <circle cx={24} cy={17} r={15} fill="#ff7eb6" />
      <path d="M24 17 m0 0 a2 2 0 0 1 2 2 a4 4 0 0 1 -4 4 a6 6 0 0 1 -6 -6 a8 8 0 0 1 8 -8 a10 10 0 0 1 10 10 a12 12 0 0 1 -12 12" fill="none" stroke="#ffffff" strokeWidth={2.6} strokeLinecap="round" />
      <path d="M20 37 Q 24 34, 28 37 L26 40 L22 40 Z" fill="#a560f0" />
      <path d="M13 9 Q 15 6, 18 6" fill="none" stroke="#ffffff" strokeWidth={2} strokeLinecap="round" opacity={0.7} />
    </>
  ),
  popcorn: (
    <>
      {[
        [14, 14, 6],
        [22, 9, 6.5],
        [31, 12, 6],
        [36, 18, 5],
        [11, 19, 5],
        [19, 17, 5],
        [28, 18, 5.5],
      ].map(([x, y, r]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="#fff6d6" stroke="#f0d98a" strokeWidth={1} />
      ))}
      <path d="M8 20 L40 20 L36 46 L12 46 Z" fill="#ffffff" />
      <path d="M11.5 20 L15 46 L20 46 L18 20 Z M24.5 20 L25 46 L30 46 L31 20 Z M37.5 20 L35.3 40 L36 46 L36 46 L40 20 Z" fill="#e5383b" />
      <path d="M8 20 L40 20 L39.5 24 L8.5 24 Z" fill="#ffd23f" />
      {face(24, 32)}
    </>
  ),
  pretzel: (
    <>
      <path
        d="M24 30 C 16 40, 4 38, 5 26 C 6 14, 20 10, 24 20 C 28 10, 42 14, 43 26 C 44 38, 32 40, 24 30 Z M24 30 L14 42 M24 30 L34 42"
        fill="none"
        stroke="#a0612f"
        strokeWidth={6.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M24 30 C 16 40, 4 38, 5 26 C 6 14, 20 10, 24 20 C 28 10, 42 14, 43 26 C 44 38, 32 40, 24 30 Z" fill="none" stroke="#c98a4b" strokeWidth={3} strokeLinecap="round" />
      {[
        [9, 20],
        [16, 15],
        [32, 15],
        [39, 21],
        [11, 33],
        [37, 33],
        [20, 34],
        [28, 34],
      ].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={2} height={2} rx={0.4} fill="#ffffff" />
      ))}
    </>
  ),
}
