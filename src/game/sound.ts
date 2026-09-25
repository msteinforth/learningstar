/**
 * Small synthesizer for game sounds (Web Audio), so no audio files are needed.
 * The audio context is created on the first sound, which always follows a tap.
 */

export type SoundName = 'click' | 'correct' | 'retry' | 'wrong' | 'coin' | 'badge' | 'finish'

const MUTE_KEY = 'learningstar.muted'

let context: AudioContext | null = null
let muted = readMuted()
const listeners = new Set<() => void>()

function readMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === '1'
  } catch {
    return false
  }
}

export function isMuted(): boolean {
  return muted
}

export function setMuted(value: boolean): void {
  muted = value
  try {
    localStorage.setItem(MUTE_KEY, value ? '1' : '0')
  } catch {
    // Only a convenience – the setting then lasts until the page is reloaded.
  }
  listeners.forEach((listener) => listener())
}

export function subscribeMuted(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function audio(): AudioContext | null {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return null
  context ??= new AudioContext()
  if (context.state === 'suspended') void context.resume()
  return context
}

interface Note {
  /** Frequency in Hz; a second value slides the pitch. */
  freq: number | [number, number]
  /** Start offset in seconds. */
  at: number
  duration: number
  type?: OscillatorType
  volume?: number
}

function playNotes(notes: Note[]): void {
  const ctx = audio()
  if (!ctx) return
  const start = ctx.currentTime + 0.01
  for (const note of notes) {
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    const begin = start + note.at
    const end = begin + note.duration
    const [from, to] = Array.isArray(note.freq) ? note.freq : [note.freq, note.freq]
    oscillator.type = note.type ?? 'triangle'
    oscillator.frequency.setValueAtTime(from, begin)
    if (to !== from) oscillator.frequency.exponentialRampToValueAtTime(to, end)
    // Short attack and a soft fade so nothing clicks or hurts.
    gain.gain.setValueAtTime(0.0001, begin)
    gain.gain.exponentialRampToValueAtTime(note.volume ?? 0.18, begin + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.0001, end)
    oscillator.connect(gain).connect(ctx.destination)
    oscillator.start(begin)
    oscillator.stop(end + 0.02)
  }
}

const C5 = 523.25
const E5 = 659.25
const G5 = 783.99
const C6 = 1046.5

const SOUNDS: Record<SoundName, Note[]> = {
  click: [{ freq: [620, 340], at: 0, duration: 0.07, type: 'sine', volume: 0.12 }],
  correct: [
    { freq: C5, at: 0, duration: 0.14 },
    { freq: E5, at: 0.08, duration: 0.14 },
    { freq: G5, at: 0.16, duration: 0.14 },
    { freq: C6, at: 0.24, duration: 0.3, volume: 0.16 },
  ],
  retry: [
    { freq: [440, 380], at: 0, duration: 0.16, type: 'sine', volume: 0.15 },
    { freq: [440, 380], at: 0.2, duration: 0.16, type: 'sine', volume: 0.12 },
  ],
  wrong: [
    { freq: [392, 330], at: 0, duration: 0.2, type: 'sine', volume: 0.16 },
    { freq: [330, 247], at: 0.2, duration: 0.35, type: 'sine', volume: 0.16 },
  ],
  coin: [
    { freq: 988, at: 0, duration: 0.08, type: 'square', volume: 0.07 },
    { freq: 1319, at: 0.08, duration: 0.3, type: 'square', volume: 0.07 },
  ],
  badge: [
    { freq: G5, at: 0, duration: 0.12 },
    { freq: C6, at: 0.12, duration: 0.12 },
    { freq: E5 * 2, at: 0.24, duration: 0.12 },
    { freq: G5 * 2, at: 0.36, duration: 0.45, volume: 0.14 },
  ],
  finish: [
    { freq: C5, at: 0, duration: 0.15 },
    { freq: C5, at: 0.15, duration: 0.1 },
    { freq: C5, at: 0.25, duration: 0.1 },
    { freq: G5, at: 0.35, duration: 0.3 },
    { freq: E5, at: 0.65, duration: 0.15 },
    { freq: G5, at: 0.8, duration: 0.15 },
    { freq: C6, at: 0.95, duration: 0.6, volume: 0.16 },
  ],
}

export function playSound(name: SoundName): void {
  if (muted) return
  try {
    playNotes(SOUNDS[name])
  } catch {
    // Sound is a bonus – never let it break the game.
  }
}
