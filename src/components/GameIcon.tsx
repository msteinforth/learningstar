import { HORSES } from '../game/horses'
import { HorseHead } from './Horse'
import { iconArt } from './icon-art'

interface Props {
  name: string
  size?: number | string
  className?: string
  /** Spoken name for screen readers; without it the icon is decorative. */
  title?: string
}

/** A drawn icon from the game's own icon set (used instead of emojis). */
export function GameIcon({ name, size = 24, className, title }: Props) {
  if (name === 'horse') {
    return (
      <span className={`game-icon ${className ?? ''}`} style={{ width: size, height: size }} aria-hidden={!title}>
        <HorseHead horse={HORSES[0]} size="100%" />
      </span>
    )
  }
  return (
    <svg
      className={`game-icon ${className ?? ''}`}
      viewBox="0 0 48 48"
      width={size}
      height={size}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {iconArt[name] ?? iconArt.star}
    </svg>
  )
}
