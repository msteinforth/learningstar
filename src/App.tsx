import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { Badges } from './components/Badges'
import { Duels } from './components/Duels'
import { BottomNav, type NavTarget } from './components/BottomNav'
import { FamilySettings } from './components/FamilySettings'
import { Leaderboard } from './components/Leaderboard'
import { MissionMap } from './components/MissionMap'
import { MissionPlay } from './components/MissionPlay'
import { type DuelPlay, type DuelSaveState, MissionResultView, type SaveState } from './components/MissionResultView'
import { ParentArea } from './components/ParentArea'
import { PlayerSelect } from './components/PlayerSelect'
import { Shop } from './components/Shop'
import { backendConfigured, lazyRpc } from './game/backend'
import { type ContentStore, FamilyContentStore, LocalContentStore, type ParentContent } from './game/content'
import { createFamily, type Family, joinFamily, moveIntoFamily, readFamily, writeFamily } from './game/family'
import { missions } from './game/missions'
import { createPlayer } from './game/progress'
import { type DuelStore, duelWins, FamilyDuelStore, LocalDuelStore, newSeed, openChallenges, toDuelResult } from './game/duels'
import { awardBadges, buyItem, equipItem, extrasOf, newBadges } from './game/rewards'
import { playSound } from './game/sound'
import { FamilyPlayerStore, LocalPlayerStore, type PlayerStore } from './game/storage'
import type { Duel, Mission, MissionResult, Player } from './game/types'

type Screen =
  | { name: 'players' }
  | { name: NavTarget }
  | { name: 'family' }
  | { name: 'parents' }
  | { name: 'play'; mission: Mission; run: number; duel?: DuelPlay }
  | { name: 'result'; mission: Mission; result: MissionResult; firstPass: boolean; save: SaveState; duel?: DuelPlay; duelSave?: DuelSaveState }

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
  const [tournamentId, setTournamentId] = useState<string | null>(null)

  const contentStore: ContentStore = useMemo(() => (family ? new FamilyContentStore(lazyRpc, family.code) : new LocalContentStore()), [family])
  const [content, setContent] = useState<ParentContent>({ hasPin: false, missions: [] })

  const duelStore: DuelStore = useMemo(() => (family ? new FamilyDuelStore(lazyRpc, family.code) : new LocalDuelStore()), [family])
  const [duels, setDuels] = useState<Duel[]>([])
  const [duelError, setDuelError] = useState<string | null>(null)

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
    // The parents' missions are a bonus: without them the built-in tournaments still work.
    contentStore.load().then(
      (loaded) => active && setContent(loaded),
      () => undefined,
    )
    duelStore.list().then(
      (loaded) => {
        if (!active) return
        setDuels(loaded)
        setDuelError(null)
      },
      (error: Error) => active && setDuelError(error.message),
    )
    return () => {
      active = false
    }
  }, [store, localStore, contentStore, duelStore, reloads])

  // Every new screen (and every tournament) starts at the top.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [screen.name, tournamentId])

  // A soft "plop" for every button; answers, purchases etc. add their own sounds.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const button = (event.target as Element | null)?.closest?.('button')
      if (button && !button.disabled && !button.classList.contains('choice')) playSound('click')
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

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

  // Duel wins live in the duel list; mirror them into the player so duel badges get awarded.
  const wins = player ? duelWins(duels, player.id) : 0
  useEffect(() => {
    if (!player || (extrasOf(player).duelWins ?? 0) === wins) return
    store
      .updateExtras(player.id, (current) => awardBadges({ ...current, extras: { ...extrasOf(current), duelWins: wins } }, new Date()))
      .then(replacePlayer, () => undefined)
  }, [player, wins, store])

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

  const start = (mission: Mission, duel?: DuelPlay) => {
    if (!duel) setTournamentId(mission.track)
    setScreen({ name: 'play', mission, run: Date.now(), duel })
  }

  const saveDuel = async (duel: DuelPlay, result: MissionResult) => {
    const setDuelSave = (state: DuelSaveState) =>
      setScreen((current) => (current.name === 'result' && current.result === result ? { ...current, duelSave: state } : current))
    setDuelSave({ status: 'saving' })
    try {
      const outcome = toDuelResult(result)
      const saved =
        duel.kind === 'answer'
          ? await duelStore.answer(duel.duel.id, duel.duel.opponentId, outcome)
          : await duelStore.create({
              id: crypto.randomUUID(),
              mission: duel.mission,
              seed: duel.seed,
              challengerId: duel.challengerId,
              opponentId: duel.opponent.id,
              createdAt: new Date().toISOString(),
              challengerResult: outcome,
              opponentResult: null,
            })
      setDuels((current) => [saved, ...current.filter((existing) => existing.id !== saved.id)])
      setDuelSave({ status: 'saved', duel: saved })
    } catch (error) {
      setDuelSave({ status: 'error', message: error instanceof Error ? error.message : String(error) })
    }
  }

  const save = async (before: Player, result: MissionResult) => {
    const setSave = (state: SaveState) =>
      setScreen((current) => (current.name === 'result' && current.result === result ? { ...current, save: state } : current))
    setSave({ status: 'saving' })
    try {
      const updated = await store.recordResult(before.id, result)
      replacePlayer(updated)
      const badges = newBadges(before, updated)
      if (badges.length > 0) setTimeout(() => playSound('badge'), 1200)
      setSave({ status: 'saved', badges })
    } catch (error) {
      setSave({ status: 'error', message: error instanceof Error ? error.message : String(error) })
    }
  }

  const finish = (mission: Mission, result: MissionResult, duel?: DuelPlay) => {
    if (!player) return
    // Duels earn horseshoes but don't change the tournament path (no unlocking by duel).
    const recorded = duel ? { ...result, missionId: `duel:${mission.id}` } : result
    const firstPass = !duel && result.passed && !player.missions[mission.id]?.passed
    setScreen({ name: 'result', mission, result: recorded, firstPass, save: { status: 'saving' }, duel, duelSave: duel ? { status: 'saving' } : undefined })
    playSound(result.passed ? 'finish' : 'wrong')
    save(player, recorded)
    if (duel) saveDuel(duel, recorded)
  }

  const updateExtras = async (update: (current: Player) => Player) => {
    if (!player) return
    replacePlayer(await store.updateExtras(player.id, update))
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

  if (screen.name === 'parents') {
    return (
      <ParentArea
        store={contentStore}
        hasPin={content.hasPin}
        customMissions={content.missions}
        players={players ?? []}
        onMissionsChanged={(missions) => setContent((current) => ({ ...current, missions }))}
        onPinSet={() => setContent((current) => ({ ...current, hasPin: true }))}
        onOpenFamily={backendConfigured ? () => setScreen({ name: 'family' }) : undefined}
        onBack={() => setScreen({ name: 'players' })}
      />
    )
  }

  if (!player || screen.name === 'players') {
    return (
      <PlayerSelect
        onOpenParents={() => setScreen({ name: 'parents' })}
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

  const withNav = (active: NavTarget, content: ReactNode) => (
    <>
      {content}
      <BottomNav
        active={active}
        onNavigate={(target) => {
          // Duels depend on what siblings did on other devices, so fetch fresh data.
          if (target === 'duels') load()
          setScreen({ name: target })
        }}
        hints={{ duels: openChallenges(duels, player.id).length }}
      />
    </>
  )

  switch (screen.name) {
    case 'map':
      return withNav(
        'map',
        <MissionMap
          player={player}
          customMissions={content.missions}
          tournamentId={tournamentId}
          onSelectTournament={setTournamentId}
          onStart={start}
          onSwitchPlayer={() => {
            writeActivePlayerId(null)
            setScreen({ name: 'players' })
            load()
          }}
        />,
      )
    case 'shop':
      return withNav(
        'shop',
        <Shop
          player={player}
          onBuy={async (item) => {
            await updateExtras((current) => buyItem(current, item.id))
            playSound('coin')
          }}
          onEquip={(slot, itemId) => updateExtras((current) => equipItem(current, slot, itemId))}
        />,
      )
    case 'badges':
      return withNav('badges', <Badges player={player} />)
    case 'leaderboard':
      return withNav('leaderboard', <Leaderboard store={store} player={player} familyName={family?.name ?? null} />)
    case 'duels':
      return withNav(
        'duels',
        <Duels
          player={player}
          players={players ?? []}
          duels={duels}
          missions={[...missions, ...content.missions]}
          loadError={duelError}
          onReload={load}
          onChallenge={(opponent, mission) => start(mission, { kind: 'challenge', mission, seed: newSeed(), challengerId: player.id, opponent })}
          onAnswer={(duel) => start(duel.mission, { kind: 'answer', duel, seed: duel.seed })}
        />,
      )
    case 'play':
      return (
        <MissionPlay
          key={screen.run}
          mission={screen.mission}
          player={player}
          seed={screen.duel?.seed}
          onFinish={(result) => finish(screen.mission, result, screen.duel)}
          onCancel={() => setScreen({ name: screen.duel ? 'duels' : 'map' })}
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
          duel={screen.duel}
          duelSave={screen.duelSave}
          players={players ?? []}
          onRetrySave={() => save(player, screen.result)}
          onRetryDuel={() => screen.duel && saveDuel(screen.duel, screen.result)}
          onReplay={() => start(screen.mission)}
          onBack={() => setScreen({ name: screen.duel ? 'duels' : 'map' })}
          onNext={start}
        />
      )
  }
}
