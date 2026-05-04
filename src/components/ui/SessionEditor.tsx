import React, { useState } from 'react'

type SetItem = {
  id: string
  reps: number
  weight?: number
  note?: string
  drop?: boolean
  restSeconds?: number
}

type SessionEditorProps = {
  initialSets?: SetItem[]
  userWeightKg?: number
  onChange?: (sets: SetItem[]) => void
}

export default function SessionEditor({ initialSets = [], userWeightKg, onChange }: SessionEditorProps) {
  const [sets, setSets] = useState<SetItem[]>(
    initialSets.length > 0
      ? initialSets
      : [
          { id: 's1', reps: 8, weight: 50, note: '', drop: false, restSeconds: 60 },
        ]
  )

  function updateSet(id: string, patch: Partial<SetItem>) {
    const next = sets.map((s) => (s.id === id ? { ...s, ...patch } : s))
    setSets(next)
    onChange?.(next)
  }

  function addSet() {
    const next = [...sets, { id: `s${Date.now()}`, reps: 8, weight: undefined, note: '', drop: false, restSeconds: 60 }]
    setSets(next)
    onChange?.(next)
  }

  function removeSet(id: string) {
    const next = sets.filter((s) => s.id !== id)
    setSets(next)
    onChange?.(next)
  }

  return (
    <section aria-label="Session editor" className="space-y-3">
      {/* Top summary: user weight & controls */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted">Your weight</div>
          <div className="text-xl font-semibold">{typeof userWeightKg === 'number' ? `${userWeightKg} kg` : '— kg'}</div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Add set"
            onClick={addSet}
            className="inline-flex items-center justify-center px-3 py-2 rounded-full bg-gradient-to-r from-[#F4941A] to-[#FFB86B] text-white shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-300"
          >
            + Set
          </button>
        </div>
      </div>

      {/* Mobile: stacked cards. Desktop: table/list */}
      <div className="space-y-3 md:space-y-0 md:block">
        {/* Cards for small screens */}
        <div className="md:hidden space-y-3">
          {sets.map((s, idx) => (
            <article
              key={s.id}
              className="p-3 border border-transparent hover:border-gray-200 dark:hover:border-slate-700 rounded-lg bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm"
              aria-labelledby={`set-${s.id}-label`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div id={`set-${s.id}-label`} className="text-sm text-muted">Set {idx + 1}</div>
                  <div className="mt-1 flex items-center gap-3">
                    <label className="flex-1">
                      <div className="text-xs text-muted">Reps</div>
                      <input
                        aria-label={`Reps for set ${idx + 1}`}
                        type="number"
                        value={s.reps}
                        onChange={(e) => updateSet(s.id, { reps: Math.max(0, Number(e.target.value) || 0) })}
                        className="w-full text-2xl font-semibold py-1 px-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-300"
                      />
                    </label>

                    <label className="w-28">
                      <div className="text-xs text-muted">Weight</div>
                      <div className="relative">
                        <input
                          aria-label={`Weight kg for set ${idx + 1}`}
                          type="number"
                          value={s.weight ?? ''}
                          onChange={(e) => updateSet(s.id, { weight: e.target.value === '' ? undefined : Number(e.target.value) })}
                          className="w-full text-lg py-1 px-2 pr-10 rounded focus:outline-none focus:ring-2 focus:ring-orange-300"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted">kg</span>
                      </div>
                    </label>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <label className="flex-1">
                      <div className="text-xs text-muted">Note</div>
                      <input
                        aria-label={`Note for set ${idx + 1}`}
                        type="text"
                        value={s.note ?? ''}
                        onChange={(e) => updateSet(s.id, { note: e.target.value })}
                        placeholder="small note"
                        className="w-full text-sm py-1 px-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-300"
                      />
                    </label>

                    <button
                      type="button"
                      aria-pressed={s.drop}
                      aria-label={`Toggle drop set for set ${idx + 1}`}
                      onClick={() => updateSet(s.id, { drop: !s.drop })}
                      className={`inline-flex items-center px-2 py-1 rounded-full border ${s.drop ? 'bg-red-50 border-red-200' : 'bg-white/40 border-transparent'} focus:outline-none focus:ring-2 focus:ring-orange-300`}
                    >
                      {s.drop ? 'Drop' : '—'}
                    </button>

                    <div className="flex items-center gap-2">
                      <div className="text-xs text-muted">Rest</div>
                      <div className="text-sm font-medium px-2 py-1 rounded bg-slate-100 dark:bg-slate-700">{s.restSeconds ?? 60}s</div>
                    </div>
                  </div>
                </div>

                <div className="ml-3 flex flex-col items-end gap-2">
                  <button
                    type="button"
                    onClick={() => removeSet(s.id)}
                    aria-label={`Remove set ${idx + 1}`}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-red-50 text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-200"
                  >
                    🗑
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Desktop: compact table */}
        <div className="hidden md:block">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-muted">
                <th className="py-2">#</th>
                <th className="py-2">Reps</th>
                <th className="py-2">Weight</th>
                <th className="py-2">Note</th>
                <th className="py-2">Rest</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sets.map((s, i) => (
                <tr key={s.id} className="align-top border-b last:border-b-0">
                  <td className="py-2">{i + 1}</td>
                  <td className="py-2">
                    <input
                      aria-label={`Reps for set ${i + 1}`}
                      type="number"
                      value={s.reps}
                      onChange={(e) => updateSet(s.id, { reps: Math.max(0, Number(e.target.value) || 0) })}
                      className="w-20 text-lg font-semibold py-1 px-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-300"
                    />
                  </td>
                  <td className="py-2">
                    <div className="flex items-center">
                      <input
                        aria-label={`Weight for set ${i + 1}`}
                        type="number"
                        value={s.weight ?? ''}
                        onChange={(e) => updateSet(s.id, { weight: e.target.value === '' ? undefined : Number(e.target.value) })}
                        className="w-28 py-1 px-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-300"
                      />
                      <span className="ml-2 text-sm text-muted">kg</span>
                    </div>
                  </td>
                  <td className="py-2">
                    <input
                      aria-label={`Note for set ${i + 1}`}
                      type="text"
                      value={s.note ?? ''}
                      onChange={(e) => updateSet(s.id, { note: e.target.value })}
                      className="w-full py-1 px-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-300"
                    />
                  </td>
                  <td className="py-2">
                    <div className="text-sm font-medium px-2 py-1 rounded bg-slate-100 dark:bg-slate-700">{s.restSeconds ?? 60}s</div>
                  </td>
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-pressed={s.drop}
                        aria-label={`Toggle drop set for set ${i + 1}`}
                        onClick={() => updateSet(s.id, { drop: !s.drop })}
                        className={`px-3 py-1 rounded ${s.drop ? 'bg-red-50 border border-red-200' : 'bg-white/40 border'} focus:outline-none focus:ring-2 focus:ring-orange-300`}
                      >
                        {s.drop ? 'Drop' : 'Normal'}
                      </button>

                      <button
                        type="button"
                        onClick={() => removeSet(s.id)}
                        aria-label={`Remove set ${i + 1}`}
                        className="px-3 py-1 rounded bg-red-50 text-red-700 focus:outline-none focus:ring-2 focus:ring-red-200"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* small helper actions */}
      <div className="pt-2 flex items-center justify-between">
        <div className="text-sm text-muted">Tip: tap reps to edit quickly. Keyboard accessible.</div>
        <div>
          <button
            type="button"
            onClick={() => onChange?.(sets)}
            className="text-sm px-3 py-1 rounded bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
            aria-label="Apply sets"
          >
            Apply
          </button>
        </div>
      </div>
    </section>
  )
}
