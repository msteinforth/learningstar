import type { ReactNode } from 'react'
import { pictureIcons } from './pictures'
import { premiumIcons } from './premium'
import { snackIcons } from './snacks'
import { rewardIcons } from './rewards'
import { uiIcons } from './ui'

/** All drawn icons by name; each is the inside of an <svg viewBox="0 0 48 48">. */
export const iconArt: Record<string, ReactNode> = { ...uiIcons, ...rewardIcons, ...premiumIcons, ...snackIcons, ...pictureIcons }

/** "horse" is drawn by the horse illustrations instead. */
export const SPECIAL_ICONS = ['horse']

export function isIconName(name: string): boolean {
  return name in iconArt || SPECIAL_ICONS.includes(name)
}
