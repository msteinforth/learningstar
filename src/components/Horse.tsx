import type { CSSProperties } from 'react'
import { type HorseStyle, RAINBOW } from '../game/horses'

const EYE = '#2b1a24'

function Eye({ x, flip }: { x: number; flip?: boolean }) {
  const d = flip ? -1 : 1
  return (
    <g>
      <ellipse cx={x} cy={48} rx={7.2} ry={8.2} fill="#ffffff" />
      <ellipse cx={x + d * 1.2} cy={49.2} rx={4.8} ry={5.8} fill={EYE} />
      <circle cx={x + d * 2.6} cy={46.6} r={1.9} fill="#ffffff" />
      <circle cx={x - d * 0.4} cy={51.6} r={0.9} fill="#ffffff" />
      <path d={`M${x - d * 6} ${42.5} l${-d * 3} ${-2.5}`} stroke={EYE} strokeWidth={1.6} strokeLinecap="round" />
    </g>
  )
}

/** Front view of a friendly horse's head, used for avatars. */
export function HorseHead({ horse, size, className }: { horse: HorseStyle; size?: number | string; className?: string }) {
  const maneColors = horse.unicorn ? RAINBOW : [horse.mane, horse.mane, horse.mane]
  return (
    <svg className={className} viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={horse.name}>
      {/* Neck and mane behind the head */}
      <path d="M29 100 L33 70 Q50 63 67 70 L71 100 Z" fill={horse.shade} />
      <path d="M27 34 Q12 50 19 76 Q23 63 31 60 Z" fill={maneColors[0]} />
      <path d="M73 34 Q88 50 81 76 Q77 63 69 60 Z" fill={maneColors[horse.unicorn ? 4 : 1]} />
      {horse.unicorn && (
        <>
          <path d="M25 42 Q15 56 22 72 Q24 62 30 58 Z" fill={RAINBOW[2]} />
          <path d="M75 42 Q85 56 78 72 Q76 62 70 58 Z" fill={RAINBOW[5]} />
        </>
      )}
      {/* Ears */}
      <path d="M31 31 Q23 11 33 5 Q43 15 41 29 Z" fill={horse.coat} />
      <path d="M32.5 26 Q28 14 33.5 10.5 Q38.5 18 37.5 26 Z" fill="#f3a3b5" />
      <path d="M69 31 Q77 11 67 5 Q57 15 59 29 Z" fill={horse.coat} />
      <path d="M67.5 26 Q72 14 66.5 10.5 Q61.5 18 62.5 26 Z" fill="#f3a3b5" />
      {/* Horn */}
      {horse.unicorn && (
        <g>
          <path d="M50 0 L56 21 L44 21 Z" fill="#ffd45c" />
          <path d="M46.5 16 L54.5 13 M47.7 10.5 L53.2 8.3 M48.8 5.5 L51.8 4.3" stroke="#f0a91f" strokeWidth={1.6} strokeLinecap="round" />
        </g>
      )}
      {/* Head */}
      <path d="M50 17 C 71 17, 77 32, 75 50 C 73 62, 69 70, 65 77 L 35 77 C 31 70, 27 62, 25 50 C 23 32, 29 17, 50 17 Z" fill={horse.coat} />
      {horse.patches && (
        <>
          <path d="M25.5 44 Q29 33 41 37 Q37 51 27.5 58 Q25 52 25.5 44 Z" fill={horse.patches} />
          <path d="M67 20 Q76 26 75 40 Q66 38 61 24 Z" fill={horse.patches} />
          <path d="M60 80 Q66 84 68 100 L56 100 Q55 88 60 80 Z" fill={horse.patches} />
        </>
      )}
      {horse.blaze && <path d="M50 24 C 54.5 34, 54.5 52, 55.5 66 L 44.5 66 C 45.5 52, 45.5 34, 50 24 Z" fill="#fffaf2" />}
      {/* Muzzle */}
      <ellipse cx={50} cy={78} rx={19.5} ry={15} fill={horse.muzzle} />
      <ellipse cx={43} cy={78.5} rx={2.6} ry={3.8} fill="#00000055" transform="rotate(-18 43 78.5)" />
      <ellipse cx={57} cy={78.5} rx={2.6} ry={3.8} fill="#00000055" transform="rotate(18 57 78.5)" />
      <path d="M44 86 Q50 90.5 56 86" stroke="#00000066" strokeWidth={1.9} fill="none" strokeLinecap="round" />
      {/* Cheeks and eyes */}
      <ellipse cx={30} cy={62} rx={5} ry={3.2} fill="#ff7f9e" opacity={0.45} />
      <ellipse cx={70} cy={62} rx={5} ry={3.2} fill="#ff7f9e" opacity={0.45} />
      <Eye x={37} />
      <Eye x={63} flip />
      {/* Forelock */}
      {horse.fluffy ? (
        <path d="M33 26 Q36 8 50 11 Q64 6 68 26 Q63 22 60 33 Q55 24 50 34 Q45 24 40 33 Q37 22 33 26 Z" fill={horse.mane} />
      ) : horse.unicorn ? (
        <g>
          <path d="M38 24 Q41 14 47 16 Q46 24 43 32 Q41 25 38 24 Z" fill={RAINBOW[0]} />
          <path d="M45 18 Q50 12 55 18 Q53 26 50 33 Q47 26 45 18 Z" fill={RAINBOW[1]} />
          <path d="M53 16 Q59 14 62 24 Q59 25 57 32 Q55 24 53 16 Z" fill={RAINBOW[4]} />
        </g>
      ) : (
        <path d="M38 23 Q43 11 51 14 Q59 9 63 23 Q58 21 55 31 Q50 23 46 32 Q42 23 38 23 Z" fill={horse.mane} />
      )}
    </svg>
  )
}

function Leg({ x, y, color, hoof, className }: { x: number; y: number; color: string; hoof: string; className: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={`horse-leg ${className}`}>
        <rect x={-4.2} y={-2} width={8.4} height={29} rx={4.2} fill={color} />
        <rect x={-4.8} y={23} width={9.6} height={7} rx={2.5} fill={hoof} />
      </g>
    </g>
  )
}

/**
 * Side view of a horse (facing right). With `running` the legs gallop, the
 * mane flutters and the body bobs; otherwise it stands in a jumping pose.
 */
export function HorseSide({ horse, width, running, className, style }: { horse: HorseStyle; width?: number | string; running?: boolean; className?: string; style?: CSSProperties }) {
  const hoof = '#4a3a33'
  const tailColors = horse.unicorn ? RAINBOW : [horse.mane]
  return (
    <svg
      className={`horse-side ${running ? 'running' : ''} ${className ?? ''}`}
      viewBox="0 0 124 96"
      width={width}
      style={style}
      role="img"
      aria-label={horse.name}
    >
      <g className="horse-body">
        {/* Tail */}
        {tailColors.map((color, i) => (
          <path
            key={color}
            className="horse-tail"
            d={`M27 ${40 + i * 1.5} C ${10 - i} ${38 + i * 2}, ${4 + i} ${56 + i * 2}, ${10 + i * 1.5} ${73 - i}  C ${14 + i} ${61}, ${19} ${54}, 27 ${50 + i}  Z`}
            fill={color}
          />
        ))}
        {/* Far legs */}
        <Leg x={36} y={58} color={horse.shade} hoof={hoof} className="leg-back-far" />
        <Leg x={72} y={58} color={horse.shade} hoof={hoof} className="leg-front-far" />
        {/* Body with a round chest and a soft belly shadow */}
        <ellipse cx={54} cy={50} rx={29} ry={16.5} fill={horse.coat} />
        <ellipse cx={74} cy={52} rx={11} ry={12} fill={horse.coat} />
        <path d="M34 58 Q54 70 76 60 Q56 66 34 58 Z" fill={horse.shade} opacity={0.6} />
        {horse.patches && (
          <>
            <path d="M40 36 Q52 34 56 44 Q50 56 38 54 Q32 46 40 36 Z" fill={horse.patches} />
            <ellipse cx={72} cy={54} rx={6} ry={5} fill={horse.patches} />
          </>
        )}
        {/* Neck */}
        <path d="M68 44 C 71 31, 78 20, 87 14 L 99 23 C 93 30, 89 40, 84 55 Z" fill={horse.coat} />
        {/* Head (slightly enlarged for a cuter look) */}
        <g transform="translate(90 22) scale(1.14) translate(-90 -22)">
        <path d="M85 14 C 91 6, 103 7, 110 16 C 115 23, 115 30, 108 32.5 C 101 34, 94 30, 87 25 Z" fill={horse.coat} />
        <ellipse cx={107.5} cy={27.5} rx={6.5} ry={5.8} fill={horse.muzzle} />
        <ellipse cx={110.5} cy={26} rx={1.3} ry={1.9} fill="#00000066" />
        <path d="M104 31 Q107 32.5 110 31" stroke="#00000055" strokeWidth={1.3} fill="none" strokeLinecap="round" />
        {horse.blaze && <path d="M98 10.5 Q106 13 110 21 L106.5 22 Q103 16 97.5 13.5 Z" fill="#fffaf2" />}
        {/* Ear and horn */}
        <path d="M88 13 L89.5 2 L96 11 Z" fill={horse.coat} />
        <path d="M89.6 10.5 L90.3 5 L93.6 10 Z" fill="#f3a3b5" />
        {horse.unicorn && (
          <g>
            <path d="M96 9 L109 -3 L101 12 Z" fill="#ffd45c" />
            <path d="M99.5 8.2 L102.5 9.8 M102.6 5.2 L105 6.6" stroke="#f0a91f" strokeWidth={1.3} strokeLinecap="round" />
          </g>
        )}
        {/* Eye */}
        <ellipse cx={96.5} cy={17.5} rx={3.6} ry={4} fill="#ffffff" />
        <ellipse cx={97.3} cy={18} rx={2.4} ry={2.9} fill={EYE} />
        <circle cx={98} cy={16.8} r={0.9} fill="#ffffff" />
        <ellipse cx={100} cy={24} rx={2.6} ry={1.6} fill="#ff7f9e" opacity={0.45} />
        </g>
        {/* Mane */}
        <g className="horse-mane">
          {(horse.unicorn ? RAINBOW.slice(0, 4) : [horse.mane, horse.mane]).map((color, i) => (
            <path
              key={i}
              d={`M${87 - i * 3} ${11 + i * 5} C ${79 - i * 3} ${13 + i * 5}, ${73 - i * 2} ${24 + i * 5}, ${69 - i} ${40 + i * 3} C ${74 - i} ${34 + i * 3}, ${76 - i * 2} ${30 + i * 4}, ${79 - i * 2} ${27 + i * 4} C ${78 - i * 2} ${22 + i * 4}, ${82 - i * 2} ${17 + i * 4}, ${87 - i * 3} ${11 + i * 5} Z`}
              fill={color}
            />
          ))}
          <path d={horse.fluffy ? 'M86 12 Q93 3 99 9 Q95 13 91 12 Q89 16 86 12 Z' : 'M87 12 Q92 6 97 9 Q93 12 87 12 Z'} fill={horse.unicorn ? RAINBOW[0] : horse.mane} />
        </g>
        {/* Near legs */}
        <Leg x={40} y={60} color={horse.coat} hoof={hoof} className="leg-back-near" />
        <Leg x={76} y={60} color={horse.coat} hoof={hoof} className="leg-front-near" />
      </g>
    </svg>
  )
}
