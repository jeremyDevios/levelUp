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
  reps: number
  weightKg?: number
  note?: string
  dropped?: boolean
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
