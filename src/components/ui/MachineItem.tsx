import React from 'react'

type Machine = {
  id: string
  name: string
  shortDesc?: string
  imageUrl?: string
}

type Props = {
  machine: Machine
  onSelect?: (m: Machine) => void
}

export default function MachineItem({ machine, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(machine)}
      className="flex items-center gap-3 w-full text-left p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-300"
      aria-label={`Select ${machine.name}`}
    >
      <div
        className="w-12 h-12 flex-shrink-0 bg-cover bg-center rounded-[var(--machine-image-radius,12px)] overflow-hidden"
        style={{ backgroundImage: `url(${machine.imageUrl ?? '/images/machine-placeholder.png'})` }}
        aria-hidden
      />

      <div className="flex-1">
        <div className="font-semibold">{machine.name}</div>
        {machine.shortDesc && <div className="text-xs text-muted">{machine.shortDesc}</div>}
      </div>

      <div className="text-muted">›</div>
    </button>
  )
}
