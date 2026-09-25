import missionData from '../data/missions.json'
import type { Mission } from './types'

export const missions = missionData as Mission[]

export const tracks = [
  { id: 'math', title: 'Rechen-Parcours', icon: '🧮' },
  { id: 'english', title: 'Englisch-Ausritt', icon: '🇬🇧' },
] as const

export function findMission(id: string): Mission | undefined {
  return missions.find((mission) => mission.id === id)
}
