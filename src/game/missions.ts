import missionData from '../data/missions.json'
import type { Mission } from './types'

export const missions = missionData as Mission[]

export const tracks = [
  { id: 'math', title: 'Rechen-Parcours', icon: '🧮', tagline: 'Spring über die 1×1-Hürden!' },
  { id: 'english', title: 'Englisch-Ausritt', icon: '🇬🇧', tagline: 'Reite durch die englischen Wörter!' },
] as const

export function findMission(id: string): Mission | undefined {
  return missions.find((mission) => mission.id === id)
}
