import type { Firestore } from 'firebase/firestore'
import { collection, addDoc, getDocs, query, orderBy, limit as limitFn, doc, updateDoc, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore'
import type { WeightEntry } from '../types/firestore'

const weightKey = (uid: string) => `local:weights:${uid}`

function readLocalWeights(uid: string): Array<{ id: string; weightKg: number; dateMs: number }> {
  try {
    const raw = localStorage.getItem(weightKey(uid))
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function writeLocalWeights(uid: string, entries: Array<{ id: string; weightKg: number; dateMs: number }>) {
  try {
    localStorage.setItem(weightKey(uid), JSON.stringify(entries))
  } catch {}
}

export async function addWeightEntry(db: Firestore, uid: string, payload: { dateISO: string; weightKg: number }): Promise<string> {
  try {
    const weightsCol = collection(db, 'users', uid, 'weights')
    const dateObj = new Date(payload.dateISO)
    const docRef = await addDoc(weightsCol, {
      userId: uid,
      date: Timestamp.fromDate(dateObj),
      weightKg: payload.weightKg,
      createdAt: serverTimestamp(),
    })
    return docRef.id
  } catch (e) {
    console.warn('Firestore addWeightEntry failed, falling back to localStorage', e)
  }
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  const entries = readLocalWeights(uid)
  entries.push({ id, weightKg: payload.weightKg, dateMs: new Date(payload.dateISO).getTime() })
  entries.sort((a, b) => b.dateMs - a.dateMs)
  writeLocalWeights(uid, entries)
  return id
}

export async function getWeightHistory(db: Firestore, uid: string, opts: { limit?: number } = {}): Promise<WeightEntry[]> {
  const l = opts.limit ?? 100
  try {
    const weightsCol = collection(db, 'users', uid, 'weights')
    const q = query(weightsCol, orderBy('date', 'desc'), limitFn(l))
    const snap = await getDocs(q)
    return snap.docs.map((d) => {
      const data = d.data() as any
      return {
        id: d.id,
        userId: data.userId || uid,
        date: data.date,
        weightKg: data.weightKg,
        createdAt: data.createdAt || null,
      } as WeightEntry
    })
  } catch (e) {
    console.warn('Firestore getWeightHistory failed, falling back to localStorage', e)
  }
  return readLocalWeights(uid)
    .slice(0, l)
    .map((e) => ({
      id: e.id,
      userId: uid,
      date: Timestamp.fromMillis(e.dateMs),
      weightKg: e.weightKg,
      createdAt: null,
    }))
}

export async function updateWeightEntry(db: Firestore, uid: string, id: string, patch: Partial<{ dateISO: string; weightKg: number }>): Promise<void> {
  try {
    const ref = doc(db, 'users', uid, 'weights', id)
    const payload: any = {}
    if (patch.dateISO) payload.date = Timestamp.fromDate(new Date(patch.dateISO))
    if (typeof patch.weightKg === 'number') payload.weightKg = patch.weightKg
    await updateDoc(ref, payload)
    return
  } catch (e: any) {
    console.warn('Firestore updateWeightEntry failed, falling back to localStorage', e?.code)
  }
  const entries = readLocalWeights(uid)
  const idx = entries.findIndex((e) => e.id === id)
  if (idx !== -1) {
    if (typeof patch.weightKg === 'number') entries[idx].weightKg = patch.weightKg
    if (patch.dateISO) entries[idx].dateMs = new Date(patch.dateISO).getTime()
    writeLocalWeights(uid, entries)
  }
}

export async function deleteWeightEntry(db: Firestore, uid: string, id: string): Promise<void> {
  try {
    const ref = doc(db, 'users', uid, 'weights', id)
    await deleteDoc(ref)
    return
  } catch (e: any) {
    console.warn('Firestore deleteWeightEntry failed, falling back to localStorage', e?.code)
  }
  writeLocalWeights(uid, readLocalWeights(uid).filter((e) => e.id !== id))
}
