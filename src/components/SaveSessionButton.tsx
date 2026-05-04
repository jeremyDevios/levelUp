import React, { useState } from 'react'

export default function SaveSessionButton({ onSave }: { onSave: () => Promise<void> }) {
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async () => {
    setSaving(true)
    setSuccess(null)
    setError(null)
    try {
      await onSave()
      setSuccess('Saved')
    } catch (e: any) {
      setError(e?.message || 'Failed to save')
    } finally {
      setSaving(false)
      setTimeout(() => setSuccess(null), 2000)
    }
  }

  return (
    <div>
      <button onClick={handleClick} disabled={saving} className="px-4 py-2 bg-blue-500 text-white">
        {saving ? 'Saving...' : 'Save Session'}
      </button>
      {success && <div className="text-green-600">{success}</div>}
      {error && <div className="text-red-600">{error}</div>}
    </div>
  )
}
