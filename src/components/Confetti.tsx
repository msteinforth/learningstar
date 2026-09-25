const COLORS = ['var(--red)', 'var(--orange)', 'var(--yellow)', 'var(--green)', 'var(--blue)', 'var(--purple)', 'var(--pink)']

/** Falling confetti; positions are derived from the index so renders stay stable. */
export function Confetti({ pieces = 60 }: { pieces?: number }) {
  return (
    <div className="confetti" aria-hidden="true">
      {Array.from({ length: pieces }, (_, i) => (
        <span
          key={i}
          style={{
            left: `${(i * 37) % 100}%`,
            background: COLORS[i % COLORS.length],
            animationDelay: `${((i * 53) % 100) / 60}s`,
            animationDuration: `${2.4 + ((i * 29) % 100) / 60}s`,
            width: `${8 + (i % 3) * 4}px`,
            height: `${12 + (i % 4) * 3}px`,
            borderRadius: i % 4 === 0 ? '50%' : '3px',
          }}
        />
      ))}
    </div>
  )
}
