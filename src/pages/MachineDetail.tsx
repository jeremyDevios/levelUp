import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import type { Session } from '../types/firestore'
import { getSessionsForUserByMachine } from '../lib/history'
import HistoryChart from '../components/HistoryChart'
import { firestore } from '../lib/firebase'

export default function MachineDetail() {
  const { user } = useAuth()
  const uid = user?.uid ?? null
  const { machineId } = useParams()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!uid || !machineId) return
    setLoading(true)
    getSessionsForUserByMachine(firestore, uid, machineId, 50).then((res) => {
      setSessions(res)
    }).finally(() => setLoading(false))
  }, [uid, machineId])

  // prepare simple data: volume per session (sum reps*weight)
  const data = sessions.map(s => {
    const volume = s.sets.reduce((acc, st) => acc + (st.reps * (st.weightKg || 0)), 0)
    return { date: s.date, volume }
  }).reverse()

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Machine {machineId}</h2>
      {loading ? <div>Loading...</div> : <HistoryChart data={data} />}
    </div>
  )
}
