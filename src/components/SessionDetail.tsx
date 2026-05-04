import React from 'react'
import type { Session } from '../types/firestore'

export default function SessionDetail({ session, onClose, onEdit, onDelete }: { session: Session | null; onClose: () => void; onEdit?: (s: Session) => void; onDelete?: (s: Session) => void }) {
  if (!session) return null
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-4 rounded max-w-md w-full">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">Session {session.machineId}</h3>
            <div className="text-sm text-gray-600">{session.date}</div>
          </div>
          <div className="space-x-2">
            {onEdit && <button className="px-2 py-1 bg-yellow-200 rounded" onClick={() => onEdit(session)}>Edit</button>}
            {onDelete && <button className="px-2 py-1 bg-red-200 rounded" onClick={() => onDelete(session)}>Delete</button>}
          </div>
        </div>
        <div className="mt-2 space-y-2">
          {session.sets.map((set, idx) => (
            <div key={idx} className="flex justify-between">
              <div>Set {idx + 1}: {set.reps} reps</div>
              <div className="text-sm text-gray-500">{set.weightKg ?? '-'} kg</div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-right">
          <button className="px-3 py-1 bg-gray-200 rounded" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
