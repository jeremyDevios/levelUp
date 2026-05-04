import React, { useState, useMemo } from 'react'
import { useAuth } from '../hooks/useAuth'
import useHistory from '../hooks/useHistory'
import CalendarView from '../components/CalendarView'
import { updateSession, deleteSession } from '../lib/sessions'
import { firestore } from '../lib/firebase'
import { updateWeightEntry, deleteWeightEntry } from '../lib/weights'
import useMachines from '../hooks/useMachines'
import type { Session, SetItem, WeightEntry } from '../types/firestore'
import { getSetInputMode } from '../types/firestore'

/** Résumé d'une série selon le mode de saisie */
function formatSetSummary(s: SetItem, machineId: string): string {
  const mode = getSetInputMode(machineId)
  if (mode === 'planche')  return s.durationSec !== undefined ? `${s.durationSec}s` : '—'
  if (mode === 'climber')  return [s.powerPercent !== undefined ? `${s.powerPercent}%` : null, s.durationMin !== undefined ? `${s.durationMin}min` : null].filter(Boolean).join(' · ') || '—'
  if (mode === 'tapis')    return [s.slope !== undefined ? `${s.slope}%` : null, s.speedKmh !== undefined ? `${s.speedKmh}km/h` : null, s.durationMin !== undefined ? `${s.durationMin}min` : null].filter(Boolean).join(' · ') || '—'
  return `${s.reps ?? 0}r${s.weightKg ? ` × ${s.weightKg}kg` : ''}`
}

// ─── Mini SVG area chart ───────────────────────────────────────────────────
function MiniChart({ data, height = 64 }: { data: { date: string; value: number }[]; height?: number }) {
  if (data.length === 0) return null
  const W = 300, H = height, PAD = 12

  // Single point: show centered dot with label
  if (data.length === 1) {
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
        <circle cx={W / 2} cy={H / 2} r={5} fill="var(--color-primary)" />
        <text x={W / 2} y={H / 2 - 12} fill="var(--color-primary)" fontSize={10} textAnchor="middle" fontWeight="bold">
          {data[0].value} kg
        </text>
        <text x={W / 2} y={H / 2 + 16} fill="var(--muted)" fontSize={8} textAnchor="middle">
          {new Date(data[0].date + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
        </text>
      </svg>
    )
  }

  const vals = data.map((d) => d.value)
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const range = max - min || 1
  const pts = data.map((d, i): [number, number] => [
    PAD + (i / (data.length - 1)) * (W - PAD * 2),
    H - PAD - ((d.value - min) / range) * (H - PAD * 2 - 14),
  ])
  const polyline = pts.map(([x, y]) => `${x},${y}`).join(' ')
  const area = [`M${pts[0][0]},${H}`, ...pts.map(([x, y]) => `L${x},${y}`), `L${pts[pts.length - 1][0]},${H}`, 'Z'].join(' ')
  const first = pts[0]
  const last = pts[pts.length - 1]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={`cg-${H}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.25} />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#cg-${H})`} />
      <polyline points={polyline} fill="none" stroke="var(--color-primary)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === pts.length - 1 ? 4 : 2.5} fill="var(--color-primary)" />
      ))}
      {/* First label */}
      <text x={first[0]} y={H - 1} fill="var(--muted)" fontSize={8} textAnchor="start">
        {new Date(data[0].date + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
      </text>
      {/* Last value label */}
      <text x={last[0]} y={last[1] - 7} fill="var(--color-primary)" fontSize={10} textAnchor="middle" fontWeight="bold">
        {data[data.length - 1].value} kg
      </text>
      {/* Last date label */}
      <text x={last[0]} y={H - 1} fill="var(--muted)" fontSize={8} textAnchor="end">
        {new Date(data[data.length - 1].date + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
      </text>
    </svg>
  )
}

// ─── Helpers ───────────────────────────────────────────────────────────────
function StatTile({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-xl p-3" style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)' }}>
      <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>{value}</p>
      <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{label}</p>
    </div>
  )
}

function Spinner() {
  return (
    <div className="flex justify-center py-8">
      <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--color-primary)' }} />
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl py-8 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)' }}>
      <p className="text-sm" style={{ color: 'var(--muted)' }}>{text}</p>
    </div>
  )
}

// ─── Reusable edit cell ────────────────────────────────────────────────────────
function EditCell({ value, unit, inputMode, onChange, primary, placeholder, min, max }: {
  value?: number; unit: string; inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  onChange: (v: number | undefined) => void; primary?: boolean; placeholder?: string; min?: number; max?: number
}) {
  return (
    <div className="flex items-center gap-1 rounded-lg px-2 py-1.5"
      style={{ background: 'var(--input-bg)', border: `1px solid ${primary ? 'var(--color-primary)' : 'var(--glass-border)'}` }}>
      <input type="number" inputMode={inputMode} value={value ?? ''} min={min} max={max}
        onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
        placeholder={placeholder ?? '0'}
        className="w-full bg-transparent text-center text-sm font-semibold focus:outline-none" style={{ color: 'var(--text)' }} />
      <span className="text-xs flex-shrink-0" style={{ color: 'var(--muted)' }}>{unit}</span>
    </div>
  )
}

// ─── Session card ──────────────────────────────────────────────────────────
function SessionCard({
  session, machineName, showDate, progressionData, onSelect,
}: {
  session: Session
  machineName: string
  showDate?: boolean
  progressionData?: { date: string; value: number }[]
  onSelect: () => void
}) {
  const totalSets = session.sets?.length ?? 0
  const maxWeight = Math.max(0, ...(session.sets?.map((s) => s.weightKg ?? 0) ?? [0]))
  const mode = getSetInputMode(session.machineId)
  const subtitle = mode === 'standard'
    ? `${totalSets} série${totalSets > 1 ? 's' : ''}${maxWeight > 0 ? ` · max ${maxWeight} kg` : ''}`
    : `${totalSets} série${totalSets > 1 ? 's' : ''}`
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)' }}>
      <button onClick={onSelect} className="w-full flex items-center justify-between px-4 py-3 text-left active:opacity-70">
        <div className="flex-1 min-w-0">
          {showDate && (
            <p className="text-xs mb-0.5" style={{ color: 'var(--muted)' }}>
              {new Date(session.date + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}
          <p className="font-semibold text-sm truncate" style={{ color: 'var(--text)' }}>{machineName}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{subtitle}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
          <div className="text-right">
            {session.sets?.slice(0, 3).map((s, i) => (
              <p key={i} className="text-xs leading-tight" style={{ color: 'var(--muted)' }}>
                {formatSetSummary(s, session.machineId)}
              </p>
            ))}
            {(session.sets?.length ?? 0) > 3 && (
              <p className="text-xs" style={{ color: 'var(--muted)' }}>+{(session.sets?.length ?? 0) - 3}</p>
            )}
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4" style={{ color: 'var(--muted)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </button>
      {progressionData && progressionData.length >= 1 && (
        <div className="px-4 pb-3 pt-1" style={{ borderTop: '1px solid var(--glass-border)' }}>
          <p className="text-[9px] font-bold tracking-widest mb-1" style={{ color: 'var(--muted)' }}>PROGRESSION — CHARGE MAX</p>
          <MiniChart data={progressionData} height={56} />
        </div>
      )}
    </div>
  )
}

// ─── Session edit / delete popup ───────────────────────────────────────────
function SessionEditPopup({
  session, machineName, onClose, onSave, onDelete,
}: {
  session: Session
  machineName: string
  onClose: () => void
  onSave: (s: Session, sets: SetItem[], restSeconds: number) => Promise<void>
  onDelete: (s: Session) => Promise<void>
}) {
  const [sets, setSets] = useState<SetItem[]>([...session.sets])
  const [restSeconds] = useState(session.restSeconds ?? 60)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const updateSet = (i: number, patch: Partial<SetItem>) =>
    setSets((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)))

  const handleSave = async () => {
    setSaving(true)
    try { await onSave(session, sets, restSeconds) } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ background: 'rgba(0,0,0,0.65)' }} onClick={onClose}>
      <div
        className="rounded-t-2xl overflow-hidden flex flex-col"
        style={{ background: 'var(--surface)', maxHeight: '85vh', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--glass-border)' }} />
        </div>
        <div className="px-5 pt-1 pb-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--glass-border)' }}>
          <div>
            <h3 className="font-bold text-base" style={{ color: 'var(--text)' }}>{machineName}</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
              {new Date(session.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--surface-2)', color: 'var(--muted)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3">
          {(() => {
            const mode = getSetInputMode(session.machineId)
            const isPlanche = mode === 'planche'
            const isClimber = mode === 'climber'
            const isTapis   = mode === 'tapis'
            const gridCols  = isTapis ? '56px 1fr 1fr 1fr 36px' : isClimber ? '56px 1fr 1fr 36px' : isPlanche ? '56px 1fr 36px' : '56px 1fr 1fr 36px'
            const headers   = isTapis
              ? ['SÉRIE', 'PENTE', 'VITESSE', 'DURÉE', '']
              : isClimber ? ['SÉRIE', 'PUIS.', 'DURÉE', '']
              : isPlanche ? ['SÉRIE', 'DURÉE', '']
              : ['SÉRIE', 'REPS', 'POIDS', '']

            return (<>
              {/* Column headers */}
              <div className="grid text-[10px] font-bold tracking-widest pb-2"
                style={{ gridTemplateColumns: gridCols, color: 'var(--muted)', borderBottom: '1px solid var(--glass-border)' }}>
                {headers.map((h, i) => <span key={i} className={i > 0 ? 'text-center' : ''}>{h}</span>)}
              </div>

              {sets.map((set, i) => (
                <div key={i} className="grid items-center gap-1" style={{ gridTemplateColumns: gridCols }}>
                  <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>Série {i + 1}</span>

                  {isPlanche && (
                    <EditCell value={set.durationSec} unit="sec" inputMode="numeric"
                      onChange={(v) => updateSet(i, { durationSec: v })} primary />
                  )}
                  {isClimber && (<>
                    <EditCell value={set.powerPercent} unit="%" inputMode="numeric" min={0} max={100}
                      onChange={(v) => updateSet(i, { powerPercent: v })} primary />
                    <EditCell value={set.durationMin} unit="min" inputMode="decimal"
                      onChange={(v) => updateSet(i, { durationMin: v })} />
                  </>)}
                  {isTapis && (<>
                    <EditCell value={set.slope} unit="%" inputMode="numeric" min={0} max={100}
                      onChange={(v) => updateSet(i, { slope: v })} primary />
                    <EditCell value={set.speedKmh} unit="km/h" inputMode="decimal"
                      onChange={(v) => updateSet(i, { speedKmh: v })} />
                    <EditCell value={set.durationMin} unit="min" inputMode="decimal"
                      onChange={(v) => updateSet(i, { durationMin: v })} />
                  </>)}
                  {!isPlanche && !isClimber && !isTapis && (<>
                    <EditCell value={set.reps} unit="r" inputMode="numeric"
                      onChange={(v) => updateSet(i, { reps: v })} primary />
                    <EditCell value={set.weightKg} unit="kg" inputMode="decimal" placeholder="—"
                      onChange={(v) => updateSet(i, { weightKg: v })} />
                  </>)}

                  <button
                    onClick={() => setSets((prev) => prev.filter((_, idx) => idx !== i))}
                    disabled={sets.length <= 1}
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ color: sets.length <= 1 ? 'var(--glass-border)' : '#ef4444', background: sets.length <= 1 ? 'transparent' : 'rgba(239,68,68,0.1)' }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </>)
          })()}

          <button onClick={() => setSets((prev) => [...prev, { ...(prev[prev.length - 1] ?? { reps: 8 }) }])}
            className="w-full py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1"
            style={{ background: 'var(--surface-2)', color: 'var(--color-primary)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Ajouter une série
          </button>
          <button onClick={handleSave} disabled={saving}
            className="w-full py-3 rounded-xl text-sm font-bold text-white"
            style={{ background: 'var(--gradient-primary)', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Enregistrement...' : 'Sauvegarder les modifications'}
          </button>

          {!confirmDelete ? (
            <button onClick={() => setConfirmDelete(true)}
              className="w-full py-3 rounded-xl text-sm font-semibold"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
              Supprimer cette séance
            </button>
          ) : (
            <div className="rounded-xl p-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <p className="text-sm mb-3 text-center font-medium" style={{ color: '#ef4444' }}>Confirmer la suppression ?</p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmDelete(false)} className="flex-1 py-2 rounded-xl text-sm font-semibold" style={{ background: 'var(--surface-2)', color: 'var(--text)' }}>Annuler</button>
                <button onClick={() => onDelete(session)} className="flex-1 py-2 rounded-xl text-sm font-bold text-white" style={{ background: '#ef4444' }}>Supprimer</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Weight entry row (inline edit) ───────────────────────────────────────
function WeightEntryRow({
  entry,
  onSave,
  onDelete,
}: {
  entry: WeightEntry & { dateISO: string }
  onSave: (id: string, weightKg: number, dateISO: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [weightVal, setWeightVal] = useState(entry.weightKg.toFixed(2))
  const [dateVal, setDateVal] = useState(entry.dateISO)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleSave = async () => {
    const kg = parseFloat(weightVal)
    if (isNaN(kg) || kg <= 0) return
    setSaving(true)
    try { await onSave(entry.id!, kg, dateVal) } finally { setSaving(false) }
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2 px-4 py-3" style={{ borderTop: '1px solid var(--glass-border)' }}>
        <input
          type="date"
          value={dateVal}
          max={new Date().toISOString().slice(0, 10)}
          onChange={(e) => setDateVal(e.target.value)}
          className="flex-1 rounded-lg px-2 py-1.5 text-xs font-medium focus:outline-none"
          style={{ background: 'var(--input-bg)', border: '1px solid var(--glass-border)', color: 'var(--text)', colorScheme: 'dark' }}
        />
        <div className="flex items-center gap-1 rounded-lg px-2 py-1.5" style={{ background: 'var(--input-bg)', border: '1px solid var(--color-primary)' }}>
          <input
            type="number"
            inputMode="decimal"
            value={weightVal}
            onChange={(e) => setWeightVal(e.target.value)}
            className="w-16 bg-transparent text-center text-sm font-bold focus:outline-none"
            style={{ color: 'var(--text)' }}
          />
          <span className="text-xs" style={{ color: 'var(--muted)' }}>kg</span>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(59,126,248,0.15)', color: 'var(--color-primary)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </button>
        <button
          onClick={() => setEditing(false)}
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'var(--surface-2)', color: 'var(--muted)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid var(--glass-border)' }}>
      <div>
        <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
          {entry.weightKg.toFixed(2)} <span className="font-normal text-xs" style={{ color: 'var(--muted)' }}>kg</span>
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
          {new Date(entry.dateISO + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>
      {!confirmDelete ? (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditing(true)}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'var(--surface-2)', color: 'var(--muted)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: '#ef4444' }}>Supprimer ?</span>
          <button
            onClick={() => onDelete(entry.id!)}
            className="px-3 py-1 rounded-lg text-xs font-bold text-white"
            style={{ background: '#ef4444' }}
          >
            Oui
          </button>
          <button
            onClick={() => setConfirmDelete(false)}
            className="px-3 py-1 rounded-lg text-xs font-semibold"
            style={{ background: 'var(--surface-2)', color: 'var(--text)' }}
          >
            Non
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Weight section ────────────────────────────────────────────────────────
function WeightSection({
  weights,
  uid,
  onReload,
}: {
  weights: WeightEntry[]
  uid: string | null
  onReload: () => Promise<void>
}) {
  const today = new Date().toISOString().slice(0, 10)

  // Convert Timestamp to ISO date string
  const toISO = (entry: WeightEntry): string => {
    try {
      if (typeof (entry.date as any).toDate === 'function') {
        return (entry.date as any).toDate().toISOString().slice(0, 10)
      }
    } catch {}
    return today
  }

  const enriched = useMemo(
    () =>
      weights.map((w) => ({ ...w, dateISO: toISO(w) })).sort((a, b) => b.dateISO.localeCompare(a.dateISO)),
    [weights]
  )

  const chartData = useMemo(
    () =>
      [...enriched]
        .sort((a, b) => a.dateISO.localeCompare(b.dateISO))
        .map((w) => ({ date: w.dateISO, value: w.weightKg })),
    [enriched]
  )

  const handleSave = async (id: string, weightKg: number, dateISO: string) => {
    if (!uid) return
    await updateWeightEntry(firestore, uid, id, { weightKg, dateISO })
    await onReload()
  }

  const handleDelete = async (id: string) => {
    if (!uid) return
    await deleteWeightEntry(firestore, uid, id)
    await onReload()
  }

  return (
    <div>
      <p className="text-[10px] font-bold tracking-widest mb-2" style={{ color: 'var(--muted)' }}>
        SUIVI DU POIDS
      </p>

      {chartData.length >= 1 && (
        <div className="rounded-2xl p-4 mb-3" style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)' }}>
          <div className="flex items-end justify-between mb-3">
            <p className="text-[10px] font-bold tracking-widest" style={{ color: 'var(--muted)' }}>
              ÉVOLUTION DU POIDS (kg)
            </p>
            {enriched.length > 0 && (
              <p className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>
                {enriched[0].weightKg.toFixed(2)} kg
              </p>
            )}
          </div>
          <MiniChart data={chartData} height={96} />
        </div>
      )}

      {enriched.length === 0 ? (
        <EmptyState text="Aucune pesée enregistrée" />
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)' }}>
          <div className="px-4 py-2" style={{ borderBottom: '1px solid var(--glass-border)' }}>
            <p className="text-[10px] font-bold tracking-widest" style={{ color: 'var(--muted)' }}>
              HISTORIQUE DES PESÉES
            </p>
          </div>
          {enriched.map((entry) => (
            <WeightEntryRow
              key={entry.id}
              entry={entry}
              onSave={handleSave}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────
export default function History() {
  const { user } = useAuth()
  const uid = user?.uid ?? null
  const { sessions, weights, loading, reload } = useHistory(uid)
  const { machines } = useMachines()

  const [view, setView] = useState<'date' | 'machine'>('date')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)

  const totalSets = useMemo(() => sessions.reduce((acc, s) => acc + (s.sets?.length ?? 0), 0), [sessions])
  const uniqueMachines = useMemo(() => new Set(sessions.map((s) => s.machineId)).size, [sessions])
  const latestWeight = weights.length > 0 ? weights[0].weightKg : null

  const markedDates = useMemo(() => sessions.map((s) => new Date(s.date + 'T12:00:00')), [sessions])
  const sessionsForDay = useMemo(() => {
    const day = selectedDate.toISOString().slice(0, 10)
    return sessions.filter((s) => s.date === day)
  }, [sessions, selectedDate])

  const machineList = useMemo(() => {
    const map = new Map<string, { lastDate: string; sessionCount: number; maxWeight: number }>()
    sessions.forEach((s) => {
      const maxW = Math.max(0, ...s.sets.map((set) => set.weightKg ?? 0))
      const ex = map.get(s.machineId)
      map.set(s.machineId, {
        lastDate: !ex || s.date > ex.lastDate ? s.date : ex.lastDate,
        sessionCount: (ex?.sessionCount ?? 0) + 1,
        maxWeight: Math.max(ex?.maxWeight ?? 0, maxW),
      })
    })
    return Array.from(map.entries())
      .map(([id, stats]) => ({ id, name: machines.find((m) => m.id === id)?.name ?? id, ...stats }))
      .sort((a, b) => b.lastDate.localeCompare(a.lastDate))
  }, [sessions, machines])

  const sessionsForMachine = useMemo(() => {
    if (!selectedMachineId) return []
    return sessions.filter((s) => s.machineId === selectedMachineId).sort((a, b) => b.date.localeCompare(a.date))
  }, [sessions, selectedMachineId])

  const getProgressionData = (machineId: string) =>
    sessions
      .filter((s) => s.machineId === machineId)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((s) => ({ date: s.date, value: Math.max(0, ...s.sets.map((set) => set.weightKg ?? 0)) }))
      .filter((d) => d.value > 0)

  const handleSaveEdit = async (s: Session, sets: SetItem[], restSeconds: number) => {
    await updateSession(firestore, s.userId, s.id!, { sets, restSeconds })
    await reload()
    setSelectedSession(null)
  }

  const handleDelete = async (s: Session) => {
    await deleteSession(firestore, s.userId, s.id!)
    await reload()
    setSelectedSession(null)
  }

  const machineName = (id: string) => machines.find((m) => m.id === id)?.name ?? id

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="sticky top-0 z-30 px-4 pb-3" style={{ background: 'var(--bg)', paddingTop: 'max(env(safe-area-inset-top, 0px), 16px)', borderBottom: '1px solid var(--glass-border)' }}>
        <h1 className="text-base font-bold tracking-widest" style={{ color: 'var(--text)' }}>HISTORIQUE</h1>
      </div>

      <div className="px-4 pt-4 space-y-4 pb-6">
        {/* Stats tiles */}
        <div className="grid grid-cols-2 gap-3">
          <StatTile value={sessions.length} label="Sessions (30 jours)" />
          <StatTile value={uniqueMachines} label="Machines différentes" />
          <StatTile value={totalSets} label="Séries au total" />
          <StatTile value={latestWeight !== null ? `${latestWeight.toFixed(2)} kg` : '—'} label="Mon poids" />
        </div>

        {/* View toggle */}
        <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--glass-border)', background: 'var(--surface)' }}>
          {(['date', 'machine'] as const).map((v) => (
            <button key={v} onClick={() => { setView(v); setSelectedMachineId(null) }}
              className="flex-1 py-2.5 text-sm font-semibold transition-colors"
              style={{ background: view === v ? 'var(--color-primary)' : 'transparent', color: view === v ? '#fff' : 'var(--muted)' }}>
              {v === 'date' ? 'Par date' : 'Par machine'}
            </button>
          ))}
        </div>

        {/* ── DATE VIEW ── */}
        {view === 'date' && (
          <>
            <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)' }}>
              <div className="px-4 pt-3 pb-1">
                <p className="text-[10px] font-bold tracking-widest" style={{ color: 'var(--muted)' }}>CALENDRIER DES SÉANCES</p>
              </div>
              <CalendarView markedDates={markedDates} selectedDate={selectedDate} onDayClick={(d) => setSelectedDate(d)} />
            </div>

            <div>
              <p className="text-[10px] font-bold tracking-widest mb-2" style={{ color: 'var(--muted)' }}>
                SÉANCES DU {selectedDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }).toUpperCase()}
              </p>
              {loading ? <Spinner /> : sessionsForDay.length === 0 ? (
                <EmptyState text="Aucune séance ce jour" />
              ) : (
                <div className="space-y-2">
                  {sessionsForDay.map((s) => (
                    <SessionCard key={s.id} session={s} machineName={machineName(s.machineId)}
                      progressionData={getProgressionData(s.machineId)} onSelect={() => setSelectedSession(s)} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── MACHINE VIEW ── */}
        {view === 'machine' && (
          <>
            {selectedMachineId ? (
              <>
                <div>
                  <button onClick={() => setSelectedMachineId(null)} className="flex items-center gap-1 text-sm mb-3" style={{ color: 'var(--color-primary)' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Toutes les machines
                  </button>
                  <p className="font-bold tracking-wider text-sm" style={{ color: 'var(--text)' }}>
                    {machineName(selectedMachineId).toUpperCase()}
                  </p>
                </div>

                {getProgressionData(selectedMachineId).length >= 1 && (
                  <div className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)' }}>
                    <p className="text-[10px] font-bold tracking-widest mb-3" style={{ color: 'var(--muted)' }}>PROGRESSION — CHARGE MAXIMALE (kg)</p>
                    <MiniChart data={getProgressionData(selectedMachineId)} height={80} />
                  </div>
                )}

                {loading ? <Spinner /> : sessionsForMachine.length === 0 ? (
                  <EmptyState text="Aucune séance enregistrée" />
                ) : (
                  <div className="space-y-2">
                    {sessionsForMachine.map((s) => (
                      <SessionCard key={s.id} session={s} machineName={machineName(s.machineId)} showDate onSelect={() => setSelectedSession(s)} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-2">
                {loading ? <Spinner /> : machineList.length === 0 ? (
                  <EmptyState text="Aucune session enregistrée" />
                ) : (
                  machineList.map((m) => (
                    <button key={m.id} onClick={() => setSelectedMachineId(m.id)}
                      className="w-full flex items-center justify-between p-4 rounded-xl text-left active:opacity-70"
                      style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)' }}>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{m.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                          Dernière séance :{' '}
                          {new Date(m.lastDate + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                          {' · '}{m.sessionCount} séance{m.sessionCount > 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                        {m.maxWeight > 0 && <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>{m.maxWeight} kg</span>}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4" style={{ color: 'var(--muted)' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </>
        )}

        {/* ── WEIGHT TRACKING ── */}
        <WeightSection weights={weights} uid={uid} onReload={reload} />
      </div>

      {selectedSession && (
        <SessionEditPopup
          session={selectedSession}
          machineName={machineName(selectedSession.machineId)}
          onClose={() => setSelectedSession(null)}
          onSave={handleSaveEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
