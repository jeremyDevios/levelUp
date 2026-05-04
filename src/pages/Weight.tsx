import React from 'react'
import { useAuth } from '../hooks/useAuth'
import useHistory from '../hooks/useHistory'
import WeightChart from '../components/WeightChart'
import WeightForm from '../components/WeightForm'

export default function Weight() {
  const { user } = useAuth()
  const uid = user?.uid ?? null
  const { weights, addWeightEntry } = useHistory(uid)

  const chartData = (weights || []).map(w => ({ date: w.date instanceof Date ? w.date.toISOString().slice(0,10) : (w.date?.toDate ? w.date.toDate().toISOString().slice(0,10) : ''), weightKg: w.weightKg }))

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Weight</h2>
      <div className="mb-4">
        <WeightForm onSubmit={async (p) => { await addWeightEntry(p) }} />
      </div>
      <div>
        <WeightChart data={chartData} />
      </div>
    </div>
  )
}
