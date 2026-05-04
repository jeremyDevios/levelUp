import type { Firestore } from 'firebase/firestore'
import { collection, query, where, orderBy, limit as limitFn, getDocs } from 'firebase/firestore'
import type { Session } from '../types/firestore'

function readLocalSessions(userId: string): Session[] {
  try {
    const raw = localStorage.getItem(`local:sessions:${userId}`)
    if (!raw) return []
    return JSON.parse(raw) as Session[]
  } catch {
    return []
  }
}

// Returns sessions for a given user between start and end dates (inclusive).
export async function getSessionsForUserAndDateRange(db: Firestore, uid: string, start: Date, end: Date): Promise<Session[]> {
  const startISO = start.toISOString().slice(0, 10)
  const endISO = end.toISOString().slice(0, 10)

  try {
    const sessionsCol = collection(db, 'users', uid, 'sessions')
    const q = query(sessionsCol, where('date', '>=', startISO), where('date', '<=', endISO), orderBy('date', 'asc'))
    const snap = await getDocs(q)
    const out: Session[] = snap.docs.map((d) => {
      const data = d.data() as any
      return {
        id: d.id,
        userId: uid,
        machineId: data.machineId,
        date: data.date,
        startedAt: data.startedAt || null,
        durationSec: data.durationSec,
        restSeconds: data.restSeconds,
        meta: data.meta || {},
        sets: data.sets || [],
        createdAt: data.createdAt || null,
      }
    })
    return out
  } catch (e) {
    console.warn('Firestore history query failed, falling back to localStorage', e)
  }

  return readLocalSessions(uid)
    .filter((s) => s.date >= startISO && s.date <= endISO)
    .sort((a, b) => a.date.localeCompare(b.date))
}

export async function getSessionsForUserByMachine(db: Firestore, uid: string, machineId: string, limit = 50): Promise<Session[]> {
  try {
    const sessionsCol = collection(db, 'users', uid, 'sessions')
    const q = query(sessionsCol, where('machineId', '==', machineId), orderBy('date', 'desc'), limitFn(limit))
    const snap = await getDocs(q)
    return snap.docs.map((d) => {
      const data = d.data() as any
      return {
        id: d.id,
        userId: uid,
        machineId: data.machineId,
        date: data.date,
        startedAt: data.startedAt || null,
        durationSec: data.durationSec,
        restSeconds: data.restSeconds,
        meta: data.meta || {},
        sets: data.sets || [],
        createdAt: data.createdAt || null,
      }
    })
  } catch (e) {
    console.warn('Firestore getSessionsForUserByMachine failed, falling back to localStorage', e)
  }

  return readLocalSessions(uid)
    .filter((s) => s.machineId === machineId)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit)
}

export async function getLatestSessionForMachine(db: Firestore, uid: string, machineId: string): Promise<Session | null> {
  const sessions = await getSessionsForUserByMachine(db, uid, machineId, 1)
  if (!sessions || sessions.length === 0) return null
  return sessions[0]
}
