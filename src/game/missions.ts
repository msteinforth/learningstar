import missionData from '../data/missions.json'
import type { Mission } from './types'

export const missions = missionData as Mission[]

/** Each school subject is its own riding tournament with a path of missions. */
export const tracks = [
  { id: 'math', title: 'Mathe-Springturnier', subject: 'Mathe', icon: 'abacus', tagline: 'Spring über die 1×1-Hürden!' },
  { id: 'german', title: 'Deutsch-Dressur', subject: 'Deutsch', icon: 'book', tagline: 'Artikel, Mehrzahl & Rechtschreibung' },
  { id: 'english', title: 'Englisch-Geländeritt', subject: 'Englisch', icon: 'flag-gb', tagline: 'Galoppiere durch englische Wörter!' },
  { id: 'french', title: 'Grand Prix de Paris', subject: 'Französisch', icon: 'flag-fr', tagline: 'Bonjour! Französisch im Sattel' },
  { id: 'spanish', title: 'Spanische Hofreitschule', subject: 'Spanisch', icon: 'flag-es', tagline: '¡Hola! Spanisch mit Stil' },
] as const

export type Track = (typeof tracks)[number]

export function findTrack(id: string): Track | undefined {
  return tracks.find((track) => track.id === id)
}

export function findMission(id: string): Mission | undefined {
  return missions.find((mission) => mission.id === id)
}
