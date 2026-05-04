import { firestore } from './firebase'
import type { Session } from '../types/firestore'
import type { Firestore } from 'firebase/firestore'
import { collection, query, where, orderBy, limit as limitFn, getDocs, addDoc, serverTimestamp, doc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore'

function localKey(userId: string) {
  return `local:sessions:${userId}`
}

function readLocalSessions(userId: string): Session[] {
  try {
    const raw = localStorage.getItem(localKey(userId))
    if (!raw) return []
    return JSON.parse(raw) as Session[]
  } catch (e) {
    console.error('Failed to read local sessions', e)
    return []
  }
}

function writeLocalSessions(userId: string, sessions: Session[]) {
  try {
    localStorage.setItem(localKey(userId), JSON.stringify(sessions))
  } catch (e) {
    console.error('Failed to write local sessions', e)
  }
}

// No compound query (avoids requiring a composite index).
// Fetches the last 50 sessions for the machine and sorts client-side.
export async function getLastSessionForUserAndMachine(userId: string, machineId: string): Promise<Session | null> {
  try {
    const sessionsCol = collection(firestore, 'users', userId, 'sessions')
    const q = query(sessionsCol, where('machineId', '==', machineId), limitFn(50))
    const snap = await getDocs(q)
    if (snap.empty) return null
    const docs = snap.docs.map((d) => {
      const data = d.data() as any
      return {
        id: d.id,
        userId,
        machineId: data.machineId,
        date: data.date as string,
        sets: data.sets || [],
        createdAt: data.createdAt || null,
        restSeconds: data.restSeconds ?? undefined,
        userWeightKg: data.userWeightKg ?? undefined,
        meta: data.meta || undefined,
      } as Session
    })
    // sort by date desc client-side
    docs.sort((a, b) => b.date.localeCompare(a.date))
    return docs[0]
  } catch (e: any) {
    console.warn('[levelUp] Firestore getLastSession failed:', e?.code, e?.message)
  }

  const sessions = readLocalSessions(userId)
  const filtered = sessions.filter((s) => s.machineId === machineId)
  if (filtered.length === 0) return null
  filtered.sort((a, b) => b.date.localeCompare(a.date))
  return filtered[0]
}

// Always saves to localStorage as a local backup, then tries Firestore.
// Throws a SyncError if Firestore fails so the caller can show a warning.
export async function saveSession(userId: string, session: Omit<Session, 'id' | 'createdAt'>): Promise<string> {
  // 1. Save to localStorage immediately (offline backup)
  const localId = `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
  const localPayload: Session = {
    id: localId,
    userId,
    machineId: session.machineId,
    date: session.date,
    sets: session.sets,
    restSeconds: session.restSeconds,
    userWeightKg: session.userWeightKg,
    meta: session.meta ?? {},
    createdAt: new Date().toISOString() as any,
  }
  const localSessions = readLocalSessions(userId)
  localSessions.push(localPayload)
  writeLocalSessions(userId, localSessions)

  // 2. Try Firestore — propagate error to caller so UI can react
  try {
    const sessionsCol = collection(firestore, 'users', userId, 'sessions')
    const ref = await addDoc(sessionsCol, { ...session, createdAt: serverTimestamp() })
    // Replace local entry with Firestore ID so later reads don't duplicate
    const updated = readLocalSessions(userId).filter((s) => s.id !== localId)
    writeLocalSessions(userId, updated)
    return ref.id
  } catch (e: any) {
    console.error('[levelUp] Firestore saveSession FAILED — code:', e?.code, '— message:', e?.message)
    // Throw so Dashboard can display an error banner
    const err = new Error(e?.message ?? 'Firestore write failed')
    ;(err as any).code = e?.code
    ;(err as any).localId = localId
    throw err
  }
}

export async function listSessionsForUser(userId: string): Promise<Session[]> {
  try {
    const sessionsCol = collection(firestore, 'users', userId, 'sessions')
    const q = query(sessionsCol, orderBy('date', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map((d) => ({ id: d.id, userId, ...(d.data() as any) })) as Session[]
  } catch (e: any) {
    console.warn('[levelUp] Firestore listSessions failed:', e?.code, e?.message)
  }
  return readLocalSessions(userId)
}

export async function updateSession(db: Firestore, userId: string, sessionId: string, patch: Partial<Session>): Promise<void> {
  try {
    const ref = doc(db, 'users', userId, 'sessions', sessionId)
    await updateDoc(ref, patch as any)
    return
  } catch (e: any) {
    console.warn('[levelUp] Firestore updateSession failed:', e?.code, e?.message)
  }
  const sessions = readLocalSessions(userId)
  const idx = sessions.findIndex((s) => s.id === sessionId)
  if (idx !== -1) {
    sessions[idx] = { ...sessions[idx], ...patch }
    writeLocalSessions(userId, sessions)
  }
}

export async function deleteSession(db: Firestore, userId: string, sessionId: string): Promise<void> {
  try {
    const ref = doc(db, 'users', userId, 'sessions', sessionId)
    await deleteDoc(ref)
    return
  } catch (e: any) {
    console.warn('[levelUp] Firestore deleteSession failed:', e?.code, e?.message)
  }
  writeLocalSessions(userId, readLocalSessions(userId).filter((s) => s.id !== sessionId))
}

export async function updateUserWeight(userId: string, weightKg: number): Promise<void> {
  try {
    const userDoc = doc(firestore, 'users', userId)
    try {
      await updateDoc(userDoc, { weightKg })
    } catch {
      await setDoc(userDoc, { weightKg }, { merge: true })
    }
    return
  } catch (e: any) {
    console.warn('[levelUp] Firestore updateUserWeight failed:', e?.code, e?.message)
  }
  try {
    const key = `local:user:${userId}`
    const cur = JSON.parse(localStorage.getItem(key) ?? '{}')
    cur.weightKg = weightKg
    localStorage.setItem(key, JSON.stringify(cur))
  } catch {}
}
