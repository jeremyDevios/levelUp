import React from 'react'
import type { SetItem } from '../types/firestore'
import SetRow from './SetRow'

export default function SessionTable({ sets, onChangeSet, onAddSet, onRemoveSet }: {
  sets: SetItem[]
  onChangeSet: (index: number, partial: Partial<SetItem>) => void
  onAddSet: () => void
  onRemoveSet: (index: number) => void
}) {
  return (
    <div>
      <table className="min-w-full">
        <thead>
          <tr>
            <th>#</th>
            <th>Reps</th>
            <th>Weight (kg)</th>
            <th>Note</th>
            <th>Drop</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sets.map((s, i) => (
            <SetRow
              key={s.id || i}
              index={i}
              set={s}
              onChange={(partial) => onChangeSet(i, partial)}
              onRemove={() => onRemoveSet(i)}
            />
          ))}
        </tbody>
      </table>
      <button className="mt-2 p-2 bg-gray-200" onClick={onAddSet}>
        Add Set
      </button>
    </div>
  )
}
