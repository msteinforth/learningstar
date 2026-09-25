import { useCallback, useEffect, useMemo, useState } from 'react'
import { FamilySettings } from './components/FamilySettings'
import { Leaderboard } from './components/Leaderboard'
import { MissionMap } from './components/MissionMap'
import { MissionPlay } from './components/MissionPlay'
import { MissionResultView, type SaveState } from './components/MissionResultView'
import { PlayerSelect } from './components/PlayerSelect'
import { backendConfigured, lazyRpc } from './game/backend'
import { createFamily, type Family, joinFamily, moveIntoFamily, readFamily, writeFamily } from './game/family'
import { createPlayer } from './game/progress'
import { FamilyPlayerStore, LocalPlayerStore, type PlayerStore } from './game/storage'
import type { Mission, MissionResult, Player } from './game/types'

type Screen =
  | { name: 'players' }
  | { name: 'map' }
  | { name: 'leaderboard' }
  | { name: 'family' }
  | { name: 'play'; mission: Mission; run: number }
  | { name: 'result'; mission: Mission; result: MissionResult; firstPass: boolean; save: SaveState }

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

function safeReadFamily(): Family | null {
  try {
    return backendConfigured ? readFamily() : null
  } catch {
    return null
  }
}

export default function App() {
  const localStore = useMemo(() => new LocalPlayerStore(), [])
  const [family, setFamily] = useState<Family | null>(safeReadFamily)
  const store: PlayerStore = useMemo(() => (family ? new FamilyPlayerStore(lazyRpc, family.code) : localStore), [family, localStore])

  const [players, setPlayers] = useState<Player[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [localCount, setLocalCount] = useState(0)
  const [activeId, setActiveId] = useState<string | null>(readActivePlayerId)
  const [screen, setScreen] = useState<Screen>({ name: 'map' })

  const [reloads, setReloads] = useState(0)
  const load = useCallback(() => setReloads((count) => count + 1), [])

  useEffect(() => {
    let active = true
    Promise.allSettled([store.list(), localStore.list()]).then(([loaded, local]) => {
      if (!active) return
      if (loaded.status === 'fulfilled') {
        setPlayers(loaded.value)
        setLoadError(null)
      } else {
        setLoadError(loaded.reason instanceof Error ? loaded.reason.message : String(loaded.reason))
      }
      setLocalCount(local.status === 'fulfilled' ? local.value.length : 0)
    })
    return () => {
      active = false
    }
  }, [store, localStore, reloads])

  // Pick up progress made on other devices when the app comes back into view.
  useEffect(() => {
    if (!family) return
    const onVisible = () => document.visibilityState === 'visible' && load()
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [family, load])

  const player = players?.find((candidate) => candidate.id === activeId)

  const replacePlayer = (updated: Player) =>
    setPlayers((current) => [...(current ?? []).filter((existing) => existing.id !== updated.id), updated])

  const selectPlayer = (selected: Player) => {
    setActiveId(selected.id)
    writeActivePlayerId(selected.id)
    setScreen({ name: 'map' })
  }

  const create = async (name: string, avatar: string, color: string) => {
    const created = await store.create(createPlayer(name, avatar, color))
    replacePlayer(created)
    selectPlayer(created)
  }

  const start = (mission: Mission) => setScreen({ name: 'play', mission, run: Date.now() })

  const save = async (playerId: string, result: MissionResult) => {
    const setSave = (state: SaveState) =>
      setScreen((current) => (current.name === 'result' && current.result === result ? { ...current, save: state } : current))
    setSave({ status: 'saving' })
    try {
      replacePlayer(await store.recordResult(playerId, result))
      setSave({ status: 'saved' })
    } catch (error) {
      setSave({ status: 'error', message: error instanceof Error ? error.message : String(error) })
    }
  }

  const finish = (mission: Mission, result: MissionResult) => {
    if (!player) return
    const firstPass = result.passed && !player.missions[mission.id]?.passed
    setScreen({ name: 'result', mission, result, firstPass, save: { status: 'saving' } })
    save(player.id, result)
  }

  const enterFamily = async (joined: Family, takeLocalPlayers: boolean) => {
    if (takeLocalPlayers) {
      await moveIntoFamily(lazyRpc, joined, await localStore.list())
      localStore.clear()
    }
    writeFamily(joined)
    setPlayers(null)
    setFamily(joined)
    setScreen({ name: 'family' })
  }

  const leaveFamily = () => {
    writeFamily(null)
    writeActivePlayerId(null)
    setActiveId(null)
    setPlayers(null)
    setFamily(null)
    setScreen({ name: 'players' })
  }

  if (screen.name === 'family') {
    return (
      <FamilySettings
        family={family}
        localPlayers={localCount}
        onCreate={async (name, take) => enterFamily(await createFamily(lazyRpc, name), take)}
        onJoin={async (code, take) => enterFamily(await joinFamily(lazyRpc, code), take)}
        onLeave={leaveFamily}
        onBack={() => setScreen({ name: 'players' })}
      />
    )
  }

  if (!player || screen.name === 'players') {
    return (
      <PlayerSelect
        players={players}
        loadError={loadError}
        familyName={family?.name ?? null}
        onRetry={load}
        onSelect={selectPlayer}
        onCreate={create}
        onOpenFamily={backendConfigured ? () => setScreen({ name: 'family' }) : undefined}
      />
    )
  }

  switch (screen.name) {
    case 'map':
      return (
        <MissionMap
          player={player}
          onStart={start}
          onLeaderboard={() => setScreen({ name: 'leaderboard' })}
          onSwitchPlayer={() => {
            writeActivePlayerId(null)
            setScreen({ name: 'players' })
            load()
          }}
        />
      )
    case 'leaderboard':
      return <Leaderboard store={store} player={player} familyName={family?.name ?? null} onBack={() => setScreen({ name: 'map' })} />
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
          save={screen.save}
          onRetrySave={() => save(player.id, screen.result)}
          onReplay={() => start(screen.mission)}
          onBack={() => setScreen({ name: 'map' })}
          onNext={start}
        />
      )
  }
}
