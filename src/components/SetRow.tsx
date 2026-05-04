import React from 'react'
import type { SetItem } from '../types/firestore'

export default function SetRow({ index, set, onChange, onRemove }: {
  index: number
  set: SetItem
  onChange: (patch: Partial<SetItem>) => void
  onRemove: () => void
}) {
  return (
    <tr>
      <td>{index + 1}</td>
      <td>
        <input
          type="number"
          value={set.reps}
          onChange={(e) => onChange({ reps: Number(e.target.value) })}
          className="w-20 border"
        />
      </td>
      <td>
        <input
          type="number"
          value={set.weightKg ?? ''}
          onChange={(e) => onChange({ weightKg: e.target.value === '' ? undefined : Number(e.target.value) })}
          className="w-24 border"
        />
      </td>
      <td>
        <input
          type="text"
          value={set.note ?? ''}
          onChange={(e) => onChange({ note: e.target.value })}
          className="border"
        />
      </td>
      <td>
        <input
          type="checkbox"
          checked={!!set.dropped}
          onChange={(e) => onChange({ dropped: e.target.checked })}
        />
      </td>
      <td>
        <button onClick={onRemove} className="text-red-600">Remove</button>
      </td>
    </tr>
  )
}
