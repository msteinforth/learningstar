import type { ReactNode } from 'react'

// Pictures for the spelling quiz ("Wie schreibt man es richtig?") – 48×48 flat style.

const INK = '#2b2250'

const eye = (x: number, y: number, r = 2) => (
  <>
    <circle cx={x} cy={y} r={r} fill={INK} />
    <circle cx={x + 0.6} cy={y - 0.7} r={r * 0.33} fill="#ffffff" />
  </>
)

export const pictureIcons: Record<string, ReactNode> = {
  bike: (
    <>
      <circle cx={11} cy={32} r={8} fill="none" stroke={INK} strokeWidth={3} />
      <circle cx={37} cy={32} r={8} fill="none" stroke={INK} strokeWidth={3} />
      <path d="M11 32 L19 18 L33 18 L37 32 M19 18 L25 32 L33 18 M25 32 L11 32" fill="none" stroke="#ff5a5f" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
      <path d="M17 14 L23 14" stroke={INK} strokeWidth={3} strokeLinecap="round" />
      <path d="M33 18 L31 11 L36 11" fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  school: (
    <>
      <rect x={6} y={20} width={36} height={24} fill="#ffe0a8" />
      <path d="M3 22 L24 10 L45 22 Z" fill="#ff5a5f" />
      <rect x={19} y={4} width={10} height={10} fill="#ffe0a8" />
      <path d="M17 6 L24 1 L31 6 Z" fill="#ff5a5f" />
      <circle cx={24} cy={9} r={2.5} fill="#ffc629" />
      <rect x={20} y={32} width={8} height={12} rx={1} fill="#8b5a3c" />
      {[10, 34].map((x) => (
        <rect key={x} x={x} y={27} width={6} height={6} rx={1} fill="#8fd3ff" />
      ))}
      <rect x={10} y={36} width={6} height={5} rx={1} fill="#8fd3ff" />
      <rect x={32} y={36} width={6} height={5} rx={1} fill="#8fd3ff" />
    </>
  ),
  cheese: (
    <>
      <path d="M4 34 L40 14 L44 18 L44 38 L4 38 Z" fill="#ffc629" />
      <path d="M4 34 L40 14 L44 18 L8 34 Z" fill="#ffe066" />
      <path d="M4 34 L44 34 L44 38 L4 38 Z" fill="#e0a000" opacity={0.5} />
      <circle cx={17} cy={33} r={3} fill="#e0a000" />
      <circle cx={31} cy={31} r={4} fill="#e0a000" />
      <circle cx={39} cy={27} r={2.5} fill="#e0a000" />
      <circle cx={24} cy={29} r={1.5} fill="#e0a000" />
    </>
  ),
  boot: (
    <>
      <path d="M12 4 L28 4 L28 30 L42 34 Q 45 35, 45 39 L45 42 L10 42 L10 6 Q 10 4, 12 4 Z" fill="#8b5a3c" />
      <rect x={10} y={40} width={35} height={5} rx={1.5} fill="#4a3a33" />
      <rect x={10} y={4} width={18} height={6} fill="#a0612f" />
      <path d="M14 16 L24 16 M14 22 L24 22" stroke="#c98a4b" strokeWidth={2} strokeLinecap="round" />
    </>
  ),
  tooth: (
    <>
      <path d="M8 14 C 8 5, 17 4, 24 8 C 31 4, 40 5, 40 14 C 40 22, 36 26, 35 34 C 34 42, 30 45, 28 40 C 27 36, 26 32, 24 32 C 22 32, 21 36, 20 40 C 18 45, 14 42, 13 34 C 12 26, 8 22, 8 14 Z" fill="#ffffff" stroke="#d9d3f5" strokeWidth={2} />
      <path d="M13 12 Q 15 9, 18 10" fill="none" stroke="#e6e0ff" strokeWidth={2.5} strokeLinecap="round" />
      {eye(18, 18)}
      {eye(30, 18)}
      <path d="M20 24 Q 24 27, 28 24" fill="none" stroke={INK} strokeWidth={1.8} strokeLinecap="round" />
    </>
  ),
  clock: (
    <>
      <circle cx={11} cy={10} r={6} fill="#ff5a5f" />
      <circle cx={37} cy={10} r={6} fill="#ff5a5f" />
      <circle cx={24} cy={26} r={17} fill="#ff5a5f" />
      <circle cx={24} cy={26} r={13} fill="#ffffff" />
      <path d="M24 26 L24 17 M24 26 L31 30" stroke={INK} strokeWidth={3} strokeLinecap="round" />
      <circle cx={24} cy={26} r={2} fill={INK} />
      <path d="M12 41 L9 45 M36 41 L39 45" stroke={INK} strokeWidth={3} strokeLinecap="round" />
    </>
  ),
  fox: (
    <>
      <path d="M6 6 L18 16 L10 22 Z" fill="#ff7a1c" />
      <path d="M42 6 L30 16 L38 22 Z" fill="#ff7a1c" />
      <path d="M9 10 L14 16 L11 18 Z M39 10 L34 16 L37 18 Z" fill={INK} />
      <path d="M6 18 C 8 12, 16 12, 24 14 C 32 12, 40 12, 42 18 C 42 28, 32 40, 24 44 C 16 40, 6 28, 6 18 Z" fill="#ff7a1c" />
      <path d="M6 22 C 12 26, 18 30, 24 44 C 30 30, 36 26, 42 22 C 36 32, 30 40, 24 44 C 18 40, 12 32, 6 22 Z" fill="#ffffff" />
      {eye(17, 23, 2.4)}
      {eye(31, 23, 2.4)}
      <ellipse cx={24} cy={39} rx={3} ry={2.2} fill={INK} />
    </>
  ),
  cow: (
    <>
      <path d="M8 12 C 4 8, 4 4, 7 3 C 8 7, 10 9, 13 11 Z M40 12 C 44 8, 44 4, 41 3 C 40 7, 38 9, 35 11 Z" fill="#fff1d6" />
      <ellipse cx={6} cy={18} rx={6} ry={3.5} fill="#ffffff" stroke="#e6e0ff" strokeWidth={1.5} />
      <ellipse cx={42} cy={18} rx={6} ry={3.5} fill="#ffffff" stroke="#e6e0ff" strokeWidth={1.5} />
      <path d="M10 14 C 10 8, 38 8, 38 14 L37 32 L11 32 Z" fill="#ffffff" stroke="#e6e0ff" strokeWidth={1.5} />
      <path d="M12 12 C 16 10, 20 14, 18 20 C 15 22, 11 20, 11 16 Z" fill={INK} />
      <path d="M36 14 C 34 12, 30 14, 31 18 C 33 20, 36 19, 37 17 Z" fill={INK} />
      {eye(18, 22, 2.2)}
      {eye(30, 22, 2.2)}
      <ellipse cx={24} cy={35} rx={14} ry={9} fill="#ffb3c6" />
      <ellipse cx={19} cy={35} rx={2} ry={3} fill="#d9788f" />
      <ellipse cx={29} cy={35} rx={2} ry={3} fill="#d9788f" />
    </>
  ),
  umbrella: (
    <>
      <path d="M4 24 A 20 20 0 0 1 44 24 Q 40 20, 34.7 24 Q 29.3 20, 24 24 Q 18.7 20, 13.3 24 Q 8 20, 4 24 Z" fill="#a560f0" />
      <path d="M24 4 Q 17 12, 13.3 24 Q 18.7 20, 24 24 Q 29.3 20, 34.7 24 Q 31 12, 24 4 Z" fill="#ff7eb6" />
      <path d="M24 24 L24 40 Q 24 45, 19 45 Q 15 45, 15 41" fill="none" stroke="#8b5a3c" strokeWidth={3} strokeLinecap="round" />
      <circle cx={24} cy={4} r={2} fill="#8b5a3c" />
    </>
  ),
  bread: (
    <>
      <path d="M6 22 C 6 10, 42 10, 42 22 C 42 26, 39 27, 38 28 L38 40 Q 38 42, 36 42 L12 42 Q 10 42, 10 40 L10 28 C 9 27, 6 26, 6 22 Z" fill="#e8a54c" />
      <path d="M10 22 C 10 14, 38 14, 38 22 C 38 25, 35 25, 35 27 L35 39 L13 39 L13 27 C 13 25, 10 25, 10 22 Z" fill="#fff1d6" />
      <path d="M17 23 Q 18 26, 20 25 M26 28 Q 27 31, 29 30 M20 33 Q 21 35, 23 34" fill="none" stroke="#e8c68f" strokeWidth={1.8} strokeLinecap="round" />
    </>
  ),
  giraffe: (
    <>
      <path d="M22 18 L30 18 L32 46 L18 46 Z" fill="#ffc629" />
      <ellipse cx={30} cy={13} rx={11} ry={8} fill="#ffc629" />
      <ellipse cx={38} cy={16} rx={5} ry={4} fill="#ffe0a8" />
      <path d="M24 7 L23 1 M31 6 L32 0" stroke="#c98a4b" strokeWidth={2.5} strokeLinecap="round" />
      <circle cx={23} cy={1.5} r={2} fill="#8b5a3c" />
      <circle cx={32} cy={0.8} r={2} fill="#8b5a3c" />
      <ellipse cx={19} cy={9} rx={4} ry={2} fill="#ffc629" transform="rotate(-20 19 9)" />
      {eye(30, 11, 2)}
      {[
        [24, 24, 3],
        [28, 31, 2.5],
        [22, 36, 3],
        [28, 42, 2.5],
        [25, 16, 2],
      ].map(([x, y, r]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="#c98a4b" />
      ))}
      <path d="M22 18 L20 30 M21 22 L19 26" stroke="#8b5a3c" strokeWidth={2} strokeLinecap="round" />
    </>
  ),
  tree: (
    <>
      <rect x={20} y={28} width={8} height={16} rx={2} fill="#8b5a3c" />
      <circle cx={24} cy={16} r={12} fill="#58cc02" />
      <circle cx={13} cy={24} r={9} fill="#46a302" />
      <circle cx={35} cy={24} r={9} fill="#46a302" />
      <circle cx={24} cy={26} r={9} fill="#58cc02" />
      <circle cx={18} cy={14} r={2} fill="#ff5a5f" />
      <circle cx={30} cy={20} r={2} fill="#ff5a5f" />
      <circle cx={14} cy={25} r={2} fill="#ff5a5f" />
    </>
  ),
  fish: (
    <>
      <path d="M36 24 L46 14 L46 34 Z" fill="#ff9f1c" />
      <ellipse cx={22} cy={24} rx={18} ry={12} fill="#1cb0f6" />
      <path d="M20 12 Q 24 6, 30 13 Z" fill="#0e8fd0" />
      <path d="M14 18 Q 17 24, 14 30 M22 16 Q 25 24, 22 32" fill="none" stroke="#8fd3ff" strokeWidth={2} strokeLinecap="round" />
      {eye(10, 22, 2.4)}
      <path d="M4 27 Q 6 28, 8 27" fill="none" stroke={INK} strokeWidth={1.5} strokeLinecap="round" />
    </>
  ),
}
