import { useEffect, useMemo, useState } from 'react'
import { MissionMap } from './components/MissionMap'
import { MissionPlay } from './components/MissionPlay'
import { MissionResultView } from './components/MissionResultView'
import { PlayerSelect } from './components/PlayerSelect'
import { applyResult, createPlayer } from './game/progress'
import { LocalPlayerStore } from './game/storage'
import type { Mission, MissionResult, Player } from './game/types'

type Screen =
  | { name: 'players' }
  | { name: 'map' }
  | { name: 'play'; mission: Mission; run: number }
  | { name: 'result'; mission: Mission; result: MissionResult; firstPass: boolean }

const ACTIVE_PLAYER_KEY = 'learningstar.activePlayer'

function readActivePlayerId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_PLAYER_KEY)
  } catch {
    return null
  }
}

function writeActivePlayerId(id: string | null) {
  try {
    if (id) localStorage.setItem(ACTIVE_PLAYER_KEY, id)
    else localStorage.removeItem(ACTIVE_PLAYER_KEY)
  } catch {
    // Remembering the last player is only a convenience.
  }
}

export default function App() {
  const store = useMemo(() => new LocalPlayerStore(), [])
  const [players, setPlayers] = useState<Player[] | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [screen, setScreen] = useState<Screen>({ name: 'players' })

  useEffect(() => {
    store.list().then((loaded) => {
      setPlayers(loaded)
      const remembered = readActivePlayerId()
      if (remembered && loaded.some((player) => player.id === remembered)) {
        setActiveId(remembered)
        setScreen({ name: 'map' })
      }
    })
  }, [store])

  const player = players?.find((candidate) => candidate.id === activeId)

  const selectPlayer = (selected: Player) => {
    setActiveId(selected.id)
    writeActivePlayerId(selected.id)
    setScreen({ name: 'map' })
  }

  const savePlayer = async (updated: Player) => {
    await store.save(updated)
    setPlayers((current) => [...(current ?? []).filter((existing) => existing.id !== updated.id), updated])
  }

  const create = async (name: string, avatar: string, color: string) => {
    const created = createPlayer(name, avatar, color)
    await savePlayer(created)
    selectPlayer(created)
  }

  const start = (mission: Mission) => setScreen({ name: 'play', mission, run: Date.now() })

  const finish = async (mission: Mission, result: MissionResult) => {
    if (!player) return
    const firstPass = result.passed && !player.missions[mission.id]?.passed
    await savePlayer(applyResult(player, result))
    setScreen({ name: 'result', mission, result, firstPass })
  }

  if (players === null) return null

  if (!player || screen.name === 'players') {
    return <PlayerSelect players={players} onSelect={selectPlayer} onCreate={create} />
  }

  switch (screen.name) {
    case 'map':
      return (
        <MissionMap
          player={player}
          onStart={start}
          onSwitchPlayer={() => {
            writeActivePlayerId(null)
            setScreen({ name: 'players' })
          }}
        />
      )
    case 'play':
      return (
        <MissionPlay
          key={screen.run}
          mission={screen.mission}
          player={player}
          onFinish={(result) => finish(screen.mission, result)}
          onCancel={() => setScreen({ name: 'map' })}
        />
      )
    case 'result':
      return (
        <MissionResultView
          mission={screen.mission}
          result={screen.result}
          player={player}
          firstPass={screen.firstPass}
          onReplay={() => start(screen.mission)}
          onBack={() => setScreen({ name: 'map' })}
          onNext={start}
        />
      )
  }
}
