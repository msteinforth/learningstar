import type { CSSProperties } from 'react'
import { extrasOf, findItem } from '../game/rewards'
import type { Player, PlayerExtras } from '../game/types'
import { horseFor } from '../game/horses'
import { HorseHead, HorseSide } from './Horse'

type AvatarPlayer = Pick<Player, 'avatar' | 'color'> & { extras?: Partial<PlayerExtras> }

/** The player's horse on its background, wearing the hat and buddy bought in the shop. */
export function Avatar({ player, size = 56 }: { player: AvatarPlayer; size?: number }) {
  const { equipped } = extrasOf(player)
  const hat = findItem(equipped.hat)
  const buddy = findItem(equipped.buddy)
  const background = findItem(equipped.background)
  const horse = horseFor(player.avatar)
  return (
    <span className="avatar" style={{ background: background?.look ?? player.color, width: size, height: size, fontSize: size * 0.55 }}>
      {horse ? (
        <span className="avatar-art">
          <HorseHead horse={horse} size="100%" />
        </span>
      ) : (
        player.avatar
      )}
      {hat && (
        <span className="avatar-hat" style={{ fontSize: size * 0.4 }}>
          {hat.look}
        </span>
      )}
      {buddy && (
        <span className="avatar-buddy" style={{ fontSize: size * 0.34 }}>
          {buddy.look}
        </span>
      )}
    </span>
  )
}

/** The player's horse from the side (e.g. jumping the hurdles); other animals stay emojis. */
export function PlayerHorse({ avatar, width, running, className, style }: { avatar: string; width: number; running?: boolean; className?: string; style?: CSSProperties }) {
  const horse = horseFor(avatar)
  if (horse) return <HorseSide horse={horse} width={width} running={running} className={className} style={style} />
  return (
    <span className={`${className ?? ''} emoji-figure`} style={{ ...style, fontSize: width * 0.7 }}>
      {avatar}
    </span>
  )
}
