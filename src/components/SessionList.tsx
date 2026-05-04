import React from 'react'
import type { Session } from '../types/firestore'

export default function SessionList({ sessions, onSelect }: { sessions: Session[]; onSelect?: (s: Session) => void }) {
  if (!sessions || sessions.length === 0) return <div className="p-4 text-sm text-gray-500">No sessions</div>
  return (
    <ul className="space-y-2">
      {sessions.map((s) => (
        <li key={s.id} className="p-3 bg-white rounded shadow-sm flex justify-between items-center">
          <div>
            <div className="font-medium">{s.machineId}</div>
            <div className="text-xs text-gray-500">{s.date}</div>
          </div>
          <div>
            <button className="text-sm text-primary" onClick={() => onSelect?.(s)}>Details</button>
          </div>
        </li>
      ))}
    </ul>
  )
}
