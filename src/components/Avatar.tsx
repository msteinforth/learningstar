import type { Player } from '../game/types'

export function Avatar({ player, size = 56 }: { player: Pick<Player, 'avatar' | 'color'>; size?: number }) {
  return (
    <span className="avatar" style={{ background: player.color, width: size, height: size, fontSize: size * 0.55 }}>
      {player.avatar}
    </span>
  )
}
