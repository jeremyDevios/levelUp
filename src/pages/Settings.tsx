import React, { useState, useMemo, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { firestore } from '../lib/firebase'
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore'
import useHistory from '../hooks/useHistory'
import { updateWeightEntry, deleteWeightEntry } from '../lib/weights'
import type { WeightEntry } from '../types/firestore'

// ─── Mini SVG area chart ───────────────────────────────────────────────────
function MiniChart({ data, height = 64 }: { data: { date: string; value: number }[]; height?: number }) {
  if (data.length === 0) return null
  const W = 300, H = height, PAD = 12

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
      <text x={first[0]} y={H - 1} fill="var(--muted)" fontSize={8} textAnchor="start">
        {new Date(data[0].date + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
      </text>
      <text x={last[0]} y={last[1] - 7} fill="var(--color-primary)" fontSize={10} textAnchor="middle" fontWeight="bold">
        {data[data.length - 1].value} kg
      </text>
      <text x={last[0]} y={H - 1} fill="var(--muted)" fontSize={8} textAnchor="end">
        {new Date(data[data.length - 1].date + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
      </text>
    </svg>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl py-8 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)' }}>
      <p className="text-sm" style={{ color: 'var(--muted)' }}>{text}</p>
    </div>
  )
}

// ─── Weight entry row (inline edit) ───────────────────────────────────────
function WeightEntryRow({
  entry, onSave, onDelete,
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
        <input type="date" value={dateVal} max={new Date().toISOString().slice(0, 10)}
          onChange={(e) => setDateVal(e.target.value)}
          className="flex-1 rounded-lg px-2 py-1.5 text-xs font-medium focus:outline-none"
          style={{ background: 'var(--input-bg)', border: '1px solid var(--glass-border)', color: 'var(--text)', colorScheme: 'dark' }} />
        <div className="flex items-center gap-1 rounded-lg px-2 py-1.5" style={{ background: 'var(--input-bg)', border: '1px solid var(--color-primary)' }}>
          <input type="number" inputMode="decimal" value={weightVal} onChange={(e) => setWeightVal(e.target.value)}
            className="w-16 bg-transparent text-center text-sm font-bold focus:outline-none" style={{ color: 'var(--text)' }} />
          <span className="text-xs" style={{ color: 'var(--muted)' }}>kg</span>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(59,126,248,0.15)', color: 'var(--color-primary)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </button>
        <button onClick={() => setEditing(false)}
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'var(--surface-2)', color: 'var(--muted)' }}>
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
          <button onClick={() => setEditing(true)}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'var(--surface-2)', color: 'var(--muted)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button onClick={() => setConfirmDelete(true)}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: '#ef4444' }}>Supprimer ?</span>
          <button onClick={() => onDelete(entry.id!)} className="px-3 py-1 rounded-lg text-xs font-bold text-white" style={{ background: '#ef4444' }}>Oui</button>
          <button onClick={() => setConfirmDelete(false)} className="px-3 py-1 rounded-lg text-xs font-semibold" style={{ background: 'var(--surface-2)', color: 'var(--text)' }}>Non</button>
        </div>
      )}
    </div>
  )
}

// ─── Weight section ────────────────────────────────────────────────────────
function WeightSection({ weights, uid, onReload }: { weights: WeightEntry[]; uid: string | null; onReload: () => Promise<void> }) {
  const today = new Date().toISOString().slice(0, 10)

  const toISO = (entry: WeightEntry): string => {
    try {
      if (typeof (entry.date as any).toDate === 'function') {
        return (entry.date as any).toDate().toISOString().slice(0, 10)
      }
    } catch {}
    return today
  }

  const enriched = useMemo(
    () => weights.map((w) => ({ ...w, dateISO: toISO(w) })).sort((a, b) => b.dateISO.localeCompare(a.dateISO)),
    [weights]
  )

  const chartData = useMemo(
    () => [...enriched].sort((a, b) => a.dateISO.localeCompare(b.dateISO)).map((w) => ({ date: w.dateISO, value: w.weightKg })),
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
      <p className="text-[10px] font-bold tracking-widest mb-2" style={{ color: 'var(--muted)' }}>SUIVI DU POIDS</p>

      {chartData.length >= 1 && (
        <div className="rounded-2xl p-4 mb-3" style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)' }}>
          <div className="flex items-end justify-between mb-3">
            <p className="text-[10px] font-bold tracking-widest" style={{ color: 'var(--muted)' }}>ÉVOLUTION DU POIDS (kg)</p>
            {enriched.length > 0 && (
              <p className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>{enriched[0].weightKg.toFixed(2)} kg</p>
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
            <p className="text-[10px] font-bold tracking-widest" style={{ color: 'var(--muted)' }}>HISTORIQUE DES PESÉES</p>
          </div>
          {enriched.map((entry) => (
            <WeightEntryRow key={entry.id} entry={entry} onSave={handleSave} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function Settings() {
  const { user, signOut } = useAuth()
  const { dark, toggle } = useTheme()
  const uid = user?.uid ?? null
  const { weights, reload } = useHistory(uid)
  const [preferredUnits, setPreferredUnits] = useState<'kg' | 'lb'>('kg')
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    if (!uid) return
    const load = async () => {
      const ref = doc(firestore, 'users', uid)
      const snap = await getDoc(ref)
      const data = snap.exists() ? (snap.data() as any) : {}
      if (data.preferredUnits) setPreferredUnits(data.preferredUnits)
    }
    load()
  }, [uid])

  const saveUnits = async (val: 'kg' | 'lb') => {
    if (!uid) return
    const ref = doc(firestore, 'users', uid)
    try {
      await updateDoc(ref, { preferredUnits: val })
    } catch {
      await setDoc(ref, { preferredUnits: val }, { merge: true })
    }
    setPreferredUnits(val)
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div
        className="sticky top-0 z-30 px-4 pb-3"
        style={{
          background: 'var(--bg)',
          paddingTop: 'max(env(safe-area-inset-top, 0px), 16px)',
          borderBottom: '1px solid var(--glass-border)',
        }}
      >
        <h1 className="text-base font-bold tracking-widest" style={{ color: 'var(--text)' }}>
          PROFIL
        </h1>
      </div>

      <div className="px-4 pt-6 pb-6 space-y-4">
        {/* Profile card */}
        {user && (
          <div
            className="rounded-2xl p-4 flex items-center gap-4"
            style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)' }}
          >
            {user.photoURL ? (
              <img src={user.photoURL} alt="avatar" className="w-16 h-16 rounded-full border-2" style={{ borderColor: 'var(--color-primary)' }} />
            ) : (
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
                style={{ background: 'var(--color-primary)', color: '#fff' }}
              >
                {user.displayName?.[0]?.toUpperCase() ?? 'U'}
              </div>
            )}
            <div>
              <p className="font-bold text-base" style={{ color: 'var(--text)' }}>{user.displayName ?? '—'}</p>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>{user.email ?? '—'}</p>
              <div className="mt-1 flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-xs" style={{ color: 'var(--muted)' }}>Connecté avec Google</span>
              </div>
            </div>
          </div>
        )}

        {/* Settings list */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)' }}
        >
          <p className="px-4 pt-3 pb-2 text-[10px] font-bold tracking-widest" style={{ color: 'var(--muted)' }}>
            PRÉFÉRENCES
          </p>

          {/* Dark mode toggle */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderTop: '1px solid var(--glass-border)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{ background: 'var(--surface-2)' }}>
                {dark ? '🌙' : '☀️'}
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Mode {dark ? 'sombre' : 'clair'}</p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>Thème de l'application</p>
              </div>
            </div>
            {/* Toggle switch */}
            <button
              onClick={toggle}
              className="relative w-12 h-6 rounded-full transition-colors duration-200"
              style={{ background: dark ? 'var(--color-primary)' : 'var(--surface-2)' }}
            >
              <div
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200"
                style={{ left: dark ? 'calc(100% - 22px)' : '2px' }}
              />
            </button>
          </div>

          {/* Units */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderTop: '1px solid var(--glass-border)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{ background: 'var(--surface-2)' }}>
                ⚖️
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Unités</p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>Poids affiché</p>
              </div>
            </div>
            <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--glass-border)' }}>
              {(['kg', 'lb'] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => saveUnits(u)}
                  className="px-3 py-1 text-sm font-semibold transition-colors"
                  style={{
                    background: preferredUnits === u ? 'var(--color-primary)' : 'transparent',
                    color: preferredUnits === u ? '#fff' : 'var(--muted)',
                  }}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Weight history */}
        <WeightSection weights={weights} uid={uid} onReload={reload} />

        {/* Sign out */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)' }}
        >
          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="w-full flex items-center gap-3 px-4 py-3"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.12)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth={2} className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <span className="text-sm font-medium" style={{ color: '#ef4444' }}>Se déconnecter</span>
            </button>
          ) : (
            <div className="px-4 py-3">
              <p className="text-sm mb-3" style={{ color: 'var(--text)' }}>Confirmer la déconnexion ?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold"
                  style={{ background: 'var(--surface-2)', color: 'var(--text)' }}
                >
                  Annuler
                </button>
                <button
                  onClick={() => signOut()}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold text-white"
                  style={{ background: '#ef4444' }}
                >
                  Déconnecter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
