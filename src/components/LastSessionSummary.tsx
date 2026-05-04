import React from 'react'
import type { Session } from '../types/firestore'

export default function LastSessionSummary({ session }: { session: Session | null }) {
  if (!session) return null
  return (
    <div className="p-2 border rounded">
      <div>Last session: {new Date(session.date).toLocaleString()}</div>
      <div>Sets: {session.sets.length}</div>
    </div>
  )
}
