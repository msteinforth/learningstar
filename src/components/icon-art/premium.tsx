import type { ReactNode } from 'react'

// Expensive shop items (hats and buddies) – same 48×48 flat style as rewards.tsx.

const GOLD = '#ffc629'
const GOLD_DARK = '#e0a000'
const INK = '#2b2250'

const eyes = (lx: number, rx: number, y: number, r = 2.2) => (
  <>
    <circle cx={lx} cy={y} r={r} fill={INK} />
    <circle cx={rx} cy={y} r={r} fill={INK} />
    <circle cx={lx + 0.7} cy={y - 0.8} r={r * 0.32} fill="#ffffff" />
    <circle cx={rx + 0.7} cy={y - 0.8} r={r * 0.32} fill="#ffffff" />
  </>
)

export const premiumIcons: Record<string, ReactNode> = {
  // --- Kopfschmuck ---
  'riding-helmet': (
    <>
      <path d="M6 32 C 6 14, 42 14, 42 32 Z" fill="#2b2250" />
      <path d="M11 26 C 14 18, 22 16, 26 16" fill="none" stroke="#4a4180" strokeWidth={3} strokeLinecap="round" />
      <path d="M24 16 L24 32" stroke="#4a4180" strokeWidth={2} />
      <path d="M4 32 L44 32 Q 44 36, 40 36 L8 36 Q 4 36, 4 32 Z" fill="#1a1433" />
      <path d="M34 32 L46 34 Q 46 38, 42 37 L32 36 Z" fill="#1a1433" />
      <circle cx={24} cy={15} r={3} fill="#ff5a5f" />
    </>
  ),
  'cowboy-hat': (
    <>
      <path d="M2 30 C 6 38, 42 38, 46 30 C 40 33, 8 33, 2 30 Z" fill="#a0612f" />
      <path d="M13 31 C 12 20, 14 12, 18 12 C 21 12, 22 15, 24 15 C 26 15, 27 12, 30 12 C 34 12, 36 20, 35 31 Z" fill="#c98a4b" />
      <path d="M13 27 C 20 29, 28 29, 35 27 L35 31 C 28 33, 20 33, 13 31 Z" fill="#ff5a5f" />
      <path d="M22 17 Q 24 20, 26 17" fill="none" stroke="#a0612f" strokeWidth={2} strokeLinecap="round" />
      <path d="M31 28 L33 25 L35 28 L33 31 Z" fill={GOLD} />
    </>
  ),
  tiara: (
    <>
      <path d="M4 36 C 12 30, 36 30, 44 36 L42 40 C 34 35, 14 35, 6 40 Z" fill={GOLD} stroke={GOLD_DARK} strokeWidth={1.2} />
      <path d="M10 34 L13 22 L18 31 L24 12 L30 31 L35 22 L38 34 Z" fill={GOLD} stroke={GOLD_DARK} strokeWidth={1.2} strokeLinejoin="round" />
      <path d="M24 16 L27 22 L24 28 L21 22 Z" fill="#8fd3ff" stroke="#ffffff" strokeWidth={1} />
      <circle cx={13} cy={22} r={2.4} fill="#ff7eb6" />
      <circle cx={35} cy={22} r={2.4} fill="#ff7eb6" />
      <circle cx={17} cy={35} r={1.6} fill="#ffffff" />
      <circle cx={31} cy={35} r={1.6} fill="#ffffff" />
      <path d="M40 10 L41 13 L44 14 L41 15 L40 18 L39 15 L36 14 L39 13 Z" fill="#ffffff" />
    </>
  ),
  'wizard-hat': (
    <>
      <path d="M4 40 C 10 34, 38 34, 44 40 C 38 43, 10 43, 4 40 Z" fill="#5b3fb5" />
      <path d="M11 38 L22 6 Q 24 3, 27 6 L32 12 Q 28 12, 29 17 L37 38 Z" fill="#7c5cff" />
      <path d="M12 34 C 20 36, 28 36, 36 34 L37 38 C 28 40, 20 40, 11 38 Z" fill={GOLD} />
      <path d="M20 22 L21.5 25 L25 25.5 L22.5 27.5 L23.2 31 L20 29.3 L16.8 31 L17.5 27.5 L15 25.5 L18.5 25 Z" fill={GOLD} />
      <path d="M29 19 A 3.5 3.5 0 1 0 31 25 A 2.8 2.8 0 1 1 29 19 Z" fill="#fff3b0" />
      <circle cx={25} cy={12} r={1.2} fill="#ffffff" />
    </>
  ),
  'viking-helmet': (
    <>
      <path d="M10 26 C 4 24, 2 14, 5 8 C 7 14, 10 18, 15 20 Z" fill="#fff1d6" stroke="#e8c68f" strokeWidth={1.2} />
      <path d="M38 26 C 44 24, 46 14, 43 8 C 41 14, 38 18, 33 20 Z" fill="#fff1d6" stroke="#e8c68f" strokeWidth={1.2} />
      <path d="M9 34 C 9 18, 39 18, 39 34 Z" fill="#b8c2d6" />
      <path d="M14 30 C 15 23, 20 20, 24 20" fill="none" stroke="#e6ebf5" strokeWidth={3} strokeLinecap="round" />
      <rect x={7} y={32} width={34} height={6} rx={2} fill="#8b5a3c" />
      <path d="M22 20 L26 20 L26 38 L22 38 Z" fill="#8b5a3c" />
      {[12, 18, 30, 36].map((x) => (
        <circle key={x} cx={x} cy={35} r={1.3} fill={GOLD} />
      ))}
    </>
  ),
  'unicorn-horn': (
    <>
      <path d="M17 42 L24 3 L31 42 Z" fill="#fff3b0" stroke={GOLD_DARK} strokeWidth={1.2} strokeLinejoin="round" />
      <path d="M18.5 34 L29.5 31 M19.8 26 L28.2 23.5 M21.2 18 L26.8 16.5 M22.5 10.5 L25.5 9.8" stroke="#ff7eb6" strokeWidth={2.4} strokeLinecap="round" />
      <path d="M12 40 C 16 36, 32 36, 36 40 C 32 44, 16 44, 12 40 Z" fill="#a560f0" />
      <circle cx={16} cy={40} r={2.4} fill="#ff7eb6" />
      <circle cx={24} cy={41.5} r={2.4} fill="#8fd3ff" />
      <circle cx={32} cy={40} r={2.4} fill="#ffe066" />
      <path d="M38 8 L39 11 L42 12 L39 13 L38 16 L37 13 L34 12 L37 11 Z" fill="#ffffff" stroke="#e6e0ff" strokeWidth={0.6} />
      <path d="M9 16 L9.8 18 L12 18.8 L9.8 19.6 L9 22 L8.2 19.6 L6 18.8 L8.2 18 Z" fill="#ffe066" />
    </>
  ),

  // --- Freunde ---
  bunny: (
    <>
      <ellipse cx={17} cy={13} rx={4.5} ry={11} fill="#f4f1ff" transform="rotate(-10 17 13)" />
      <ellipse cx={31} cy={13} rx={4.5} ry={11} fill="#f4f1ff" transform="rotate(10 31 13)" />
      <ellipse cx={17} cy={13} rx={2.2} ry={8} fill="#ffc2dd" transform="rotate(-10 17 13)" />
      <ellipse cx={31} cy={13} rx={2.2} ry={8} fill="#ffc2dd" transform="rotate(10 31 13)" />
      <ellipse cx={24} cy={32} rx={15} ry={13} fill="#f4f1ff" stroke="#e6e0ff" strokeWidth={1.5} />
      {eyes(18.5, 29.5, 30, 2.4)}
      <path d="M22.5 34 L25.5 34 L24 36 Z" fill="#ff7eb6" />
      <path d="M24 36 L24 38 M24 38 Q 22 40, 20.5 38.5 M24 38 Q 26 40, 27.5 38.5" fill="none" stroke={INK} strokeWidth={1.2} strokeLinecap="round" />
      <ellipse cx={14} cy={36} rx={3} ry={1.8} fill="#ffb3c6" opacity={0.7} />
      <ellipse cx={34} cy={36} rx={3} ry={1.8} fill="#ffb3c6" opacity={0.7} />
    </>
  ),
  hedgehog: (
    <>
      <path
        d="M6 34 L4 26 L9 27 L8 19 L13 22 L14 14 L19 18 L22 10 L26 16 L30 10 L32 18 L37 14 L38 22 L43 20 L41 28 L45 30 L40 36 Z"
        fill="#8b5a3c"
        stroke="#6b4228"
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
      <ellipse cx={24} cy={32} rx={15} ry={11} fill="#e8c68f" />
      {eyes(18, 30, 29, 2.4)}
      <ellipse cx={24} cy={35} rx={3.2} ry={2.4} fill={INK} />
      <path d="M20 39 Q 24 41.5, 28 39" fill="none" stroke={INK} strokeWidth={1.3} strokeLinecap="round" />
      <ellipse cx={13} cy={34} rx={2.6} ry={1.6} fill="#ff9fb3" opacity={0.7} />
      <ellipse cx={35} cy={34} rx={2.6} ry={1.6} fill="#ff9fb3" opacity={0.7} />
      <circle cx={34} cy={13} r={2.6} fill="#ff5a5f" />
      <path d="M34 10.4 Q 35 8.5, 36.5 9" fill="none" stroke="#58cc02" strokeWidth={1.4} strokeLinecap="round" />
    </>
  ),
  owl: (
    <>
      <path d="M10 10 L15 16 L9 18 Z M38 10 L33 16 L39 18 Z" fill="#8b5a3c" />
      <ellipse cx={24} cy={27} rx={16} ry={17} fill="#a0612f" />
      <ellipse cx={24} cy={33} rx={10} ry={10} fill="#e8c68f" />
      <path d="M19 31 Q 21 33, 23 31 M25 31 Q 27 33, 29 31 M21 36 Q 23 38, 25 36 M25 36 Q 27 38, 29 36" fill="none" stroke="#c98a4b" strokeWidth={1.2} strokeLinecap="round" />
      <circle cx={17} cy={21} r={6.5} fill="#ffffff" />
      <circle cx={31} cy={21} r={6.5} fill="#ffffff" />
      {eyes(17, 31, 21, 3.4)}
      <path d="M22 24 L26 24 L24 28 Z" fill="#ff9f1c" />
      <path d="M8 26 C 4 32, 6 38, 11 40 M40 26 C 44 32, 42 38, 37 40" fill="none" stroke="#8b5a3c" strokeWidth={3} strokeLinecap="round" />
    </>
  ),
  penguin: (
    <>
      <ellipse cx={24} cy={27} rx={15} ry={18} fill="#2b2250" />
      <path d="M8 26 C 3 30, 4 36, 9 36 Z M40 26 C 45 30, 44 36, 39 36 Z" fill="#2b2250" />
      <path d="M24 13 C 34 13, 36 24, 34 32 C 32 40, 28 43, 24 43 C 20 43, 16 40, 14 32 C 12 24, 14 13, 24 13 Z" fill="#ffffff" />
      {eyes(19, 29, 22, 2.4)}
      <path d="M21 26 L27 26 L24 30 Z" fill="#ff9f1c" />
      <ellipse cx={17} cy={45} rx={4.5} ry={2} fill="#ff9f1c" />
      <ellipse cx={31} cy={45} rx={4.5} ry={2} fill="#ff9f1c" />
      <path d="M13 11 C 18 6, 30 6, 35 11 L33 14 C 28 11, 20 11, 15 14 Z" fill="#ff5a5f" />
      <circle cx={24} cy={5.5} r={2.6} fill="#ffffff" />
      <ellipse cx={15} cy={29} rx={2.4} ry={1.5} fill="#ffb3c6" opacity={0.8} />
      <ellipse cx={33} cy={29} rx={2.4} ry={1.5} fill="#ffb3c6" opacity={0.8} />
    </>
  ),
  dragon: (
    <>
      <path d="M8 20 C 2 14, 4 6, 12 6 C 11 11, 13 14, 16 16 Z" fill="#46a302" />
      <path d="M40 20 C 46 14, 44 6, 36 6 C 37 11, 35 14, 32 16 Z" fill="#46a302" />
      <path d="M16 12 L18 4 L21 11 Z M27 11 L30 4 L32 12 Z" fill={GOLD} />
      <ellipse cx={24} cy={26} rx={16} ry={14} fill="#58cc02" />
      <path d="M17 13 L19 9 L21 13 M23 12 L24 8 L25 12 M27 13 L29 9 L31 13" fill="#ff9f1c" />
      <ellipse cx={24} cy={33} rx={10} ry={7} fill="#b8f28b" />
      {eyes(17, 31, 23, 2.8)}
      <circle cx={21} cy={32} r={1.2} fill="#2f6b00" />
      <circle cx={27} cy={32} r={1.2} fill="#2f6b00" />
      <path d="M19 36 Q 24 39, 29 36" fill="none" stroke="#2f6b00" strokeWidth={1.4} strokeLinecap="round" />
      <path d="M22 37 L23 39.5 L24 37 M25 37 L26 39.5 L27 37" fill="#ffffff" />
      <path d="M40 38 C 44 36, 46 40, 44 43 C 42 41, 40 42, 38 43" fill="#ff5a5f" opacity={0.9} />
      <path d="M41 39 C 43 38.5, 44 40.5, 43 42" fill="none" stroke={GOLD} strokeWidth={1.4} strokeLinecap="round" />
    </>
  ),
}
