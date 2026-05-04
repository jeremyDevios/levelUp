import React, { useState } from 'react'

export default function WeightForm({ onSubmit, initial }: { onSubmit: (p: { dateISO: string; weightKg: number }) => Promise<void>; initial?: { dateISO?: string; weightKg?: number } }) {
  const [dateISO, setDateISO] = useState(initial?.dateISO ?? new Date().toISOString().slice(0,10))
  const [weight, setWeight] = useState(initial?.weightKg?.toString() ?? '')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit({ dateISO, weightKg: Number(weight) })
      setWeight('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <div>
        <label className="block text-sm">Date</label>
        <input type="date" value={dateISO} onChange={(e) => setDateISO(e.target.value)} className="mt-1 w-full p-2 border rounded" />
      </div>
      <div>
        <label className="block text-sm">Weight (kg)</label>
        <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} className="mt-1 w-full p-2 border rounded" />
      </div>
      <div className="text-right">
        <button type="submit" className="px-3 py-1 bg-primary text-white rounded" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
      </div>
    </form>
  )
}
