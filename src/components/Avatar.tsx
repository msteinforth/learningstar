import type { CSSProperties } from 'react'
import { extrasOf, findItem } from '../game/rewards'
import type { Player, PlayerExtras } from '../game/types'
import { horseFor } from '../game/horses'
import { HorseHead, HorseSide } from './Horse'
import { GameIcon } from './GameIcon'

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
      <span className="avatar-art">
        <HorseHead horse={horse} size="100%" />
      </span>
      {hat && (
        <span className="avatar-hat" style={{ fontSize: size * 0.42 }}>
          <GameIcon name={hat.look} size="1em" />
        </span>
      )}
      {buddy && (
        <span className="avatar-buddy" style={{ fontSize: size * 0.38 }}>
          <GameIcon name={buddy.look} size="1em" />
        </span>
      )}
    </span>
  )
}

/** The player's horse from the side (e.g. jumping the hurdles). */
export function PlayerHorse({ avatar, width, running, className, style }: { avatar: string; width: number; running?: boolean; className?: string; style?: CSSProperties }) {
  return <HorseSide horse={horseFor(avatar)} width={width} running={running} className={className} style={style} />
}
