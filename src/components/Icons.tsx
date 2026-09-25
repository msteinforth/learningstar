export function Horseshoe({ size = 20 }: { size?: number }) {
  return (
    <svg className="horseshoe" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5 21 L5 12 A7 7 0 0 1 19 12 L19 21"
        fill="none"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <g fill="var(--bg-card)">
        <circle cx="5" cy="17" r="0.9" />
        <circle cx="19" cy="17" r="0.9" />
        <circle cx="6.2" cy="10" r="0.9" />
        <circle cx="17.8" cy="10" r="0.9" />
      </g>
    </svg>
  )
}

const ROSETTE_COLORS = ['var(--bronze)', 'var(--silver)', 'var(--gold)']

/** Show-jumping rosette. `level` 1–3 picks bronze, silver or gold; 0 draws an empty slot. */
export function Rosette({ level, size = 36 }: { level: number; size?: number }) {
  const color = level > 0 ? ROSETTE_COLORS[level - 1] : 'var(--empty)'
  const petals = Array.from({ length: 12 }, (_, i) => i * 30)
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 40 52" aria-hidden="true">
      <path d="M13 28 L8 50 L15 45 L19 51 L20 30 Z" fill={color} opacity="0.75" />
      <path d="M27 28 L32 50 L25 45 L21 51 L20 30 Z" fill={color} opacity="0.75" />
      {petals.map((angle) => (
        <ellipse key={angle} cx="20" cy="8" rx="4" ry="7" fill={color} transform={`rotate(${angle} 20 20)`} />
      ))}
      <circle cx="20" cy="20" r="9" fill="var(--bg-card)" />
      <circle cx="20" cy="20" r="6.5" fill={color} />
    </svg>
  )
}

export function Rosettes({ count, size }: { count: number; size?: number }) {
  return (
    <span className="rosettes" aria-label={`${count} von 3 Schleifen`}>
      {[1, 2, 3].map((slot) => (
        <Rosette key={slot} level={slot <= count ? slot : 0} size={size} />
      ))}
    </span>
  )
}

export function Points({ value }: { value: number }) {
  return (
    <span className="points" aria-label={`${value} Hufeisen`}>
      <Horseshoe /> {value}
    </span>
  )
}
