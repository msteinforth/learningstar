import type { Player } from '../game/types'
import { horseFor } from '../game/horses'
import { Avatar } from './Avatar'
import { GameIcon } from './GameIcon'
import { HorseSide } from './Horse'

/** Shown instead of the game once today's play time is used up. */
export function TimeUp({ player, minutes, onSwitchPlayer }: { player: Player; minutes: number; onSwitchPlayer: () => void }) {
  return (
    <main className="screen time-up">
      <section className="card panel time-up-card">
        <GameIcon name="moon" size={84} className="time-up-moon" />
        <Avatar player={player} size={84} />
        <h1>Genug geritten für heute!</h1>
        <p>
          Super gemacht, {player.name}! {minutes === 1 ? 'Deine Minute für heute ist' : `Deine ${minutes} Minuten für heute sind`} um. {horseFor(player.avatar).name} ruht sich jetzt im Stall aus – morgen geht's weiter.
        </p>
        <HorseSide horse={horseFor(player.avatar)} width={150} className="time-up-horse" />
        <button className="button primary" onClick={onSwitchPlayer}>
          Zum Stall
        </button>
      </section>
    </main>
  )
}
