import { extrasOf, findItem } from '../game/rewards'
import type { Player, PlayerExtras } from '../game/types'

type AvatarPlayer = Pick<Player, 'avatar' | 'color'> & { extras?: Partial<PlayerExtras> }

/** The player's animal on its background, wearing the hat and buddy bought in the shop. */
export function Avatar({ player, size = 56 }: { player: AvatarPlayer; size?: number }) {
  const { equipped } = extrasOf(player)
  const hat = findItem(equipped.hat)
  const buddy = findItem(equipped.buddy)
  const background = findItem(equipped.background)
  return (
    <span className="avatar" style={{ background: background?.look ?? player.color, width: size, height: size, fontSize: size * 0.55 }}>
      {player.avatar}
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
