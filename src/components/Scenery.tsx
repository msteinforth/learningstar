/** Paddock backdrop behind every screen: sky, sun, drifting clouds, hills and a fence. */
export function Scenery() {
  return (
    <div className="scenery" aria-hidden="true">
      <div className="sun" />
      <div className="stars" />
      <svg className="cloud cloud-1" viewBox="0 0 120 50">
        <path d="M20 45 a18 18 0 0 1 4-35 a22 22 0 0 1 40-5 a18 18 0 0 1 32 8 a16 16 0 0 1 4 32 z" />
      </svg>
      <svg className="cloud cloud-2" viewBox="0 0 120 50">
        <path d="M20 45 a18 18 0 0 1 4-35 a22 22 0 0 1 40-5 a18 18 0 0 1 32 8 a16 16 0 0 1 4 32 z" />
      </svg>
      <svg className="cloud cloud-3" viewBox="0 0 120 50">
        <path d="M20 45 a18 18 0 0 1 4-35 a22 22 0 0 1 40-5 a18 18 0 0 1 32 8 a16 16 0 0 1 4 32 z" />
      </svg>
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
        <g className="flowers">
          {[60, 190, 330, 470, 610, 760, 900, 1050, 1150].map((x, i) => (
            <circle key={x} cx={x} cy={232 + (i % 3) * 8} r="6" className={`flower flower-${i % 3}`} />
          ))}
        </g>
      </svg>
    </div>
  )
}
