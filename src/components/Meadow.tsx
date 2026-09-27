import { type CSSProperties, useEffect, useState } from 'react'
import { HORSES, type HorseStyle } from '../game/horses'
import { HorseSide } from './Horse'

interface Route {
  horse: HorseStyle
  width: number
  /** Distance from the bottom of the screen, as a share of the hills' height. */
  level: number
  direction: 'right' | 'left'
  /** Screen width per second while galloping. */
  speed: number
  /** Where the horse stops for a while (0–1 of the screen width); none = runs straight through. */
  stops: number[]
  /** Seconds before the first appearance and between two rounds. */
  delay: number
  pause: number
  behind?: boolean
}

const ROUTES: Route[] = [
  { horse: HORSES[1], width: 96, level: 0.3, direction: 'right', speed: 0.09, stops: [0.38, 0.72], delay: 0.5, pause: 6 },
  { horse: HORSES[3], width: 64, level: 0.5, direction: 'left', speed: 0.07, stops: [], delay: 9, pause: 14, behind: true },
  { horse: HORSES[7] ?? HORSES[5], width: 76, level: 0.42, direction: 'right', speed: 0.12, stops: [0.55], delay: 22, pause: 20 },
]

const OFF_LEFT = -0.2
const OFF_RIGHT = 1.08
const STOP_SECONDS = 3.5

type Pose = { x: number; running: boolean; seconds: number }

const sleep = (seconds: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, seconds * 1000)
    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new DOMException('aborted', 'AbortError'))
    })
  })

const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

function MeadowHorse({ route }: { route: Route }) {
  const still = prefersReducedMotion()
  const start = route.direction === 'right' ? OFF_LEFT : OFF_RIGHT
  const end = route.direction === 'right' ? OFF_RIGHT : OFF_LEFT
  const [pose, setPose] = useState<Pose>(() => (still ? { x: route.stops[0] ?? 0.1, running: false, seconds: 0 } : { x: start, running: false, seconds: 0 }))

  useEffect(() => {
    if (still) return
    const controller = new AbortController()
    const { signal } = controller
    const gallopTo = async (from: number, to: number) => {
      const seconds = Math.abs(to - from) / route.speed
      setPose({ x: to, running: true, seconds })
      await sleep(seconds, signal)
    }
    ;(async () => {
      await sleep(route.delay, signal)
      for (;;) {
        let x = start
        for (const stop of route.stops) {
          await gallopTo(x, stop)
          x = stop
          setPose({ x, running: false, seconds: 0 })
          await sleep(STOP_SECONDS, signal)
        }
        await gallopTo(x, end)
        // Back to the start while nobody sees it.
        setPose({ x: start, running: false, seconds: 0 })
        await sleep(route.pause, signal)
      }
    })().catch(() => undefined)
    return () => controller.abort()
  }, [route, start, end, still])

  const style = {
    '--level': route.level,
    transform: `translateX(${pose.x * 100}vw)`,
    transition: pose.seconds > 0 ? `transform ${pose.seconds}s linear` : 'none',
  } as CSSProperties

  return (
    <div className={`meadow-horse ${route.behind ? 'behind' : ''}`} style={style}>
      <HorseSide
        horse={route.horse}
        width={route.width}
        running={pose.running}
        className={`${pose.running ? '' : 'standing'} ${route.direction === 'left' ? 'facing-left' : ''}`}
      />
    </div>
  )
}

/** Horses galloping across the meadow at the bottom of every screen. */
export function Meadow({ behind }: { behind: boolean }) {
  return (
    <>
      {ROUTES.filter((route) => Boolean(route.behind) === behind).map((route) => (
        <MeadowHorse key={route.horse.id} route={route} />
      ))}
    </>
  )
}
