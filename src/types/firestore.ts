import type { Timestamp } from 'firebase/firestore'

export interface UserDoc {
  uid: string
  displayName?: string
  email?: string
  photoURL?: string
  weightKg?: number
  preferredUnits?: 'kg' | 'lb'
}

export interface Machine {
  id: string
  name: string
  description?: string
  image?: string
  category?: string
  categoryLabel?: string
  muscles?: string[]
  viewBox?: string
  svgPaths?: string[]
}

export interface SetItem {
  id?: string
  reps?: number          // standard: répétitions
  weightKg?: number      // standard: poids
  durationSec?: number   // planche: durée en secondes
  powerPercent?: number  // climber / marches-infinies: puissance 0-100
  durationMin?: number   // climber / marches-infinies / tapis: durée en minutes
  slope?: number         // tapis-de-course: pente 0-100
  speedKmh?: number      // tapis-de-course: vitesse km/h
  note?: string
  dropped?: boolean
}

/** Détermine le mode de saisie selon la machine */
export type SetInputMode = 'standard' | 'planche' | 'climber' | 'tapis' | 'reps-only'

export function getSetInputMode(machineId: string): SetInputMode {
  if (machineId === 'planche') return 'planche'
  if (machineId === 'climber-cardio' || machineId === 'marches-infinies') return 'climber'
  if (machineId === 'tapis-de-course') return 'tapis'
  if (machineId === 'squats') return 'reps-only'
  return 'standard'
}

export function defaultSet(mode: SetInputMode): SetItem {
  if (mode === 'planche')    return { durationSec: 30 }
  if (mode === 'climber')    return { powerPercent: 0, durationMin: 10 }
  if (mode === 'tapis')      return { slope: 0, speedKmh: 6, durationMin: 20 }
  if (mode === 'reps-only')  return { reps: 10 }
  return { reps: 8 }
}

export interface Session {
  id?: string
  userId: string
  machineId: string
  date: string // ISO date (e.g. 2024-05-01)
  startedAt?: Timestamp | null
  durationSec?: number
  restSeconds?: number
  userWeightKg?: number
  meta?: Record<string, any>
  sets: SetItem[]
  createdAt?: Timestamp | null
}

export interface WeightEntry {
  id?: string
  userId: string
  date: Timestamp
  weightKg: number
  createdAt?: Timestamp | null
}
