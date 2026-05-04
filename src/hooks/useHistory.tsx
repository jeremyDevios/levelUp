import { useEffect, useState, useCallback } from 'react'
import { firestore } from '../lib/firebase'
import type { Session, WeightEntry } from '../types/firestore'
import { getSessionsForUserAndDateRange, getSessionsForUserByMachine } from '../lib/history'
import { getWeightHistory, addWeightEntry as addWeightEntryLib } from '../lib/weights'

export default function useHistory(uid: string | null) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [weights, setWeights] = useState<WeightEntry[]>([])
  const [loading, setLoading] = useState(false)

  const reload = useCallback(async (start?: Date, end?: Date) => {
    if (!uid) return
    setLoading(true)
    try {
      // default: last 30 days
      const e = end || new Date()
      const s = start || new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 30)
      const sRes = await getSessionsForUserAndDateRange(firestore, uid, s, e)
      setSessions(sRes)
      const wRes = await getWeightHistory(firestore, uid, { limit: 200 })
      setWeights(wRes)
    } finally {
      setLoading(false)
    }
  }, [uid])

  useEffect(() => {
    reload()
  }, [uid, reload])

  const addWeightEntry = useCallback(async (payload: { dateISO: string; weightKg: number }) => {
    if (!uid) throw new Error('no uid')
    const id = await addWeightEntryLib(firestore, uid, payload)
    // optimistic reload
    const w = await getWeightHistory(firestore, uid, { limit: 200 })
    setWeights(w)
    return id
  }, [uid])

  return { sessions, weights, loading, reload, addWeightEntry }
}
