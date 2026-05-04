import React from 'react'
import { Machine } from '../types/firestore'

export default function MachineSelector({
  machines,
  onSelect
}: {
  machines: Machine[]
  onSelect: (id: string) => void
}) {
  const fallback = '/assets/prototypes/IMG_0785.PNG'
  return (
    <div>
      <h3>Machines</h3>
      <ul className="space-y-2">
        {machines.map((m) => (
          <li key={m.id} className="flex items-center space-x-3">
            <img src={m.image || fallback} alt={m.name} className="w-12 h-8 object-cover rounded" />
            <button onClick={() => onSelect(m.id)} className="text-left">{m.name}</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
