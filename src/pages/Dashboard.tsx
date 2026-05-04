import React, { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import useMachines from '../hooks/useMachines'
import { getLastSessionForUserAndMachine, saveSession, updateUserWeight } from '../lib/sessions'
import { firestore } from '../lib/firebase'
import { getWeightHistory, addWeightEntry } from '../lib/weights'
import type { Machine, SetItem } from '../types/firestore'
import pkg from '../../package.json'

function getCategoryIcon(category?: string, className?: string): React.ReactElement {
  const p = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: className ?? 'w-7 h-7',
  }
  switch (category) {
    case 'epaules':
      // Barbell raised overhead
      return (
        <svg {...p}>
          <circle cx="12" cy="3" r="1.5" fill="currentColor" stroke="none" />
          <path d="M3 9h18M3 9V7M21 9V7M1 7h4M19 7h4M12 9v12M10 21h4" />
        </svg>
      )
    case 'dos':
      // Lat pulldown bar
      return (
        <svg {...p}>
          <path d="M4 4h16M7 4v7l-3 6M17 4v7l3 6M9 17h6" />
          <circle cx="12" cy="21" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'pectoraux':
      // Chest fly — arms extended to sides
      return (
        <svg {...p}>
          <circle cx="12" cy="4" r="1.5" fill="currentColor" stroke="none" />
          <path d="M12 6v5M5 11H2M19 11h3M5 11l7 2 7-2M5 11l-1 5M19 11l1 5M4 16h4M16 16h4" />
        </svg>
      )
    case 'abdominaux':
      // Ab grid / crunch outline
      return (
        <svg {...p}>
          <rect x="7" y="4" width="10" height="16" rx="2" />
          <line x1="7" y1="9" x2="17" y2="9" />
          <line x1="7" y1="14" x2="17" y2="14" />
          <line x1="12" y1="4" x2="12" y2="20" />
        </svg>
      )
    case 'biceps':
      // Dumbbell curl — arm bent
      return (
        <svg {...p}>
          <circle cx="12" cy="4" r="1.5" fill="currentColor" stroke="none" />
          <path d="M12 6c-3 2-5 5-4 9M8 15l2 1M8 15l-1 2" />
          <line x1="14" y1="9" x2="18" y2="9" />
          <line x1="15" y1="7" x2="15" y2="11" />
          <line x1="17" y1="7" x2="17" y2="11" />
        </svg>
      )
    case 'triceps':
      // Overhead tricep extension
      return (
        <svg {...p}>
          <circle cx="12" cy="3" r="1.5" fill="currentColor" stroke="none" />
          <path d="M12 5v6M9 5h6M12 11c-2 2-2 5 0 7M12 11c2 2 2 5 0 7M10 18h4" />
        </svg>
      )
    case 'fesses':
      // Hip thrust arc
      return (
        <svg {...p}>
          <path d="M3 19h4l1-5a5 5 0 0 0 8 0l1 5h4" />
          <path d="M3 19c0 1.5 1 2 2 2M21 19c0 1.5-1 2-2 2" />
          <circle cx="12" cy="9" r="2" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'cuisses':
      // Squat stance
      return (
        <svg {...p}>
          <circle cx="12" cy="4" r="1.5" fill="currentColor" stroke="none" />
          <path d="M9 7h6M9 7l-3 8-2 6M15 7l3 8 2 6M6 21h4M14 21h4" />
        </svg>
      )
    case 'mollets':
      // Calf raise — standing on ball of foot
      return (
        <svg {...p}>
          <circle cx="12" cy="3" r="1.5" fill="currentColor" stroke="none" />
          <path d="M9 6h6M10 6v10l-2 5M14 6v10l2 5M8 21h4M13 21h4" />
        </svg>
      )
    case 'cardio':
      // ECG / heartbeat
      return (
        <svg {...p}>
          <path d="M2 12h4l2-7 4 14 2-7h8" />
        </svg>
      )
    default:
      // Generic dumbbell
      return (
        <svg {...p}>
          <path d="M6.5 6.5h11M6.5 17.5h11M4 12h16M4 9.5V15M20 9.5V15M1.5 10.5v3M22.5 10.5v3" />
        </svg>
      )
  }
}

function MachineIcon({ machine, className }: { machine: Machine | null; className?: string }) {
  return getCategoryIcon(machine?.category ?? undefined, className)
}


function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export default function Dashboard() {
  const { user } = useAuth()
  const { machines } = useMachines()

  const [showPicker, setShowPicker] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sets, setSets] = useState<SetItem[]>([{ reps: 8, weightKg: undefined }])
  const [restSeconds, setRestSeconds] = useState(60)
  const [sessionDate, setSessionDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [userWeightKg, setUserWeightKg] = useState<number | undefined>()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [weightSaved, setWeightSaved] = useState(false)

  const selectedMachine = machines.find((m) => m.id === selectedId) ?? null

  // Auto-select first machine
  useEffect(() => {
    if (machines.length > 0 && !selectedId) {
      setSelectedId(machines[0].id)
    }
  }, [machines])

  // Load last session for selected machine
  useEffect(() => {
    if (!selectedId || !user) return
    let mounted = true
    ;(async () => {
      const s = await getLastSessionForUserAndMachine(user.uid, selectedId)
      if (!mounted) return
      if (s && s.sets.length > 0) {
        setSets(s.sets)
        if (typeof s.restSeconds === 'number') setRestSeconds(s.restSeconds)
      } else {
        setSets([{ reps: 8, weightKg: undefined }])
      }
    })()
    return () => { mounted = false }
  }, [selectedId, user])

  // Load latest user weight
  useEffect(() => {
    if (!user) return
    getWeightHistory(firestore, user.uid, { limit: 1 })
      .then((entries) => { if (entries.length > 0) setUserWeightKg(entries[0].weightKg) })
      .catch(() => {})
  }, [user])

  const updateSet = (i: number, patch: Partial<SetItem>) =>
    setSets((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)))

  const addSet = () =>
    setSets((prev) => [...prev, { ...(prev[prev.length - 1] ?? { reps: 8 }) }])

  const removeSet = (i: number) =>
    setSets((prev) => prev.filter((_, idx) => idx !== i))

  const handleSave = async () => {
    if (!user || !selectedId || saving) return
    setSaving(true)
    setSaveError(null)
    try {
      await saveSession(user.uid, {
        userId: user.uid,
        machineId: selectedId,
        date: sessionDate,
        sets: sets.map((s, i) => ({
          index: i,
          reps: s.reps || 0,
          weightKg: s.weightKg ?? 0,
          note: s.note ?? '',
          dropped: !!s.dropped,
        })),
        restSeconds,
        userWeightKg,
        meta: { appVersion: (pkg as any).version ?? 'unknown' },
      })
      if (typeof userWeightKg === 'number') {
        await updateUserWeight(user.uid, userWeightKg).catch(() => {})
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e: any) {
      // saveSession throws when Firestore fails (data saved locally as backup)
      const code = e?.code ?? ''
      if (code === 'permission-denied') {
        setSaveError('Accès refusé — vérifiez les règles Firestore dans la console Firebase.')
      } else if (code === 'unavailable' || code === 'failed-precondition') {
        setSaveError('Hors-ligne — séance sauvegardée localement, synchronisation en attente.')
      } else {
        setSaveError(`Erreur cloud (${code || 'inconnue'}) — séance sauvegardée localement.`)
      }
    } finally {
      setSaving(false)
    }
  }

  const handleSaveWeight = async () => {
    if (!user || !userWeightKg) return
    try {
      await addWeightEntry(firestore, user.uid, {
        dateISO: new Date().toISOString().slice(0, 10),
        weightKg: userWeightKg,
      })
      await updateUserWeight(user.uid, userWeightKg).catch(() => {})
      setWeightSaved(true)
      setTimeout(() => setWeightSaved(false), 2500)
    } catch (e) {
      console.error('Failed to save weight', e)
    }
  }

  const today = new Date()
  const dayName = today.toLocaleDateString('fr-FR', { weekday: 'long' }).toUpperCase()
  const dateStr = today.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }).toUpperCase()

  // Group machines by category for picker
  const grouped = machines.reduce<Record<string, Machine[]>>((acc, m) => {
    const cat = (m as any).category ?? 'other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(m)
    return acc
  }, {})

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div
        className="sticky top-0 z-30 px-4 pb-3 flex items-center justify-between"
        style={{
          background: 'var(--bg)',
          paddingTop: 'max(env(safe-area-inset-top, 0px), 16px)',
          borderBottom: '1px solid var(--glass-border)',
        }}
      >
        <div>
          <h1 className="text-base font-bold tracking-widest" style={{ color: 'var(--text)' }}>
            TABLEAU DE BORD
          </h1>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            {dayName}, {dateStr}
          </p>
        </div>
        {user?.photoURL ? (
          <img
            src={user.photoURL}
            alt="avatar"
            className="w-9 h-9 rounded-full border-2"
            style={{ borderColor: 'var(--color-primary)' }}
          />
        ) : (
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: 'var(--color-primary)', color: '#fff' }}
          >
            {user?.displayName?.[0]?.toUpperCase() ?? 'U'}
          </div>
        )}
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* User weight */}
        <div className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)' }}>
          <p className="text-[10px] font-bold tracking-widest mb-3" style={{ color: 'var(--muted)' }}>MON POIDS</p>
          <div className="flex items-center gap-3">
            <div
              className="flex-1 flex items-center gap-2 rounded-lg px-3 py-2"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--glass-border)' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--muted)' }}>
                <path d="M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM4 21c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
              <input
                type="number"
                inputMode="decimal"
                value={userWeightKg ?? ''}
                onChange={(e) => setUserWeightKg(e.target.value ? Number(e.target.value) : undefined)}
                className="flex-1 bg-transparent text-sm font-semibold focus:outline-none"
                style={{ color: 'var(--text)' }}
                placeholder="Ex : 75"
              />
              <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>kg</span>
            </div>
            <button
              onClick={handleSaveWeight}
              disabled={!userWeightKg || weightSaved}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              style={{
                background: weightSaved ? 'rgba(34,197,94,0.12)' : 'var(--surface-2)',
                color: weightSaved ? '#22c55e' : 'var(--color-primary)',
                opacity: !userWeightKg ? 0.5 : 1,
              }}
            >
              {weightSaved ? '✓ Sauvegardé' : 'Sauvegarder'}
            </button>
          </div>
        </div>

        {/* Machine selector */}
        <div>
          <p className="text-[10px] font-bold tracking-widest mb-2" style={{ color: 'var(--muted)' }}>
            SÉLECTIONNER VOTRE MACHINE
          </p>
          <button
            onClick={() => setShowPicker(true)}
            className="w-full flex items-center justify-between p-3 rounded-xl active:scale-98 transition-transform"
            style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--surface-2)', color: 'var(--color-primary)' }}
              >
                <MachineIcon machine={selectedMachine} className="w-7 h-7" />
              </div>
              <div className="text-left">
                <span className="font-semibold block" style={{ color: 'var(--text)' }}>
                  {selectedMachine?.name ?? 'Choisir une machine'}
                </span>
                {selectedMachine && (
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>
                    {selectedMachine.categoryLabel ?? selectedMachine.category ?? ''}
                  </span>
                )}
              </div>
            </div>
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--muted)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {selectedMachine && (
          <>
            {/* Session header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold tracking-wider" style={{ color: 'var(--text)' }}>
                  SÉQUENCE : {selectedMachine.name.toUpperCase()}
                </p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>Session en cours</p>
              </div>
              {/* Session date picker */}
              <div className="flex items-center gap-2 rounded-lg px-3 py-1.5" style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--muted)' }}>
                  <rect x="3" y="4" width="18" height="18" rx="2" /><path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
                </svg>
                <input
                  type="date"
                  value={sessionDate}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="bg-transparent text-xs font-semibold focus:outline-none"
                  style={{ color: 'var(--color-primary)', colorScheme: 'dark' }}
                />
              </div>
            </div>

            {/* Sets table */}
            <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)' }}>
              {/* Table header */}
              <div className="px-4 pt-3 pb-2" style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <p className="text-[10px] font-bold tracking-widest" style={{ color: 'var(--muted)' }}>
                  DÉTAIL DES SÉRIES DE LA SESSION
                </p>
              </div>
              <div
                className="grid px-4 py-2 text-[10px] font-bold tracking-widest"
                style={{ gridTemplateColumns: '80px 1fr 1fr 32px', color: 'var(--muted)' }}
              >
                <span>SÉRIE</span>
                <span className="text-center">REPS</span>
                <span className="text-center">POIDS (kg)</span>
                <span />
              </div>

              {/* Set rows */}
              {sets.map((set, i) => (
                <div
                  key={i}
                  className="grid items-center px-4 py-2"
                  style={{
                    gridTemplateColumns: '80px 1fr 1fr 32px',
                    borderTop: '1px solid var(--glass-border)',
                  }}
                >
                  <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                    Série {i + 1}
                  </span>

                  {/* Reps input */}
                  <div className="flex justify-center">
                    <div
                      className="flex items-center gap-1 rounded-lg px-3 py-1.5"
                      style={{
                        background: 'var(--input-bg)',
                        border: '1px solid var(--color-primary)',
                      }}
                    >
                      <input
                        type="number"
                        inputMode="numeric"
                        value={set.reps || ''}
                        onChange={(e) => updateSet(i, { reps: Number(e.target.value) })}
                        className="w-8 bg-transparent text-center font-semibold text-sm focus:outline-none"
                        style={{ color: 'var(--text)' }}
                      />
                      <span className="text-xs" style={{ color: 'var(--muted)' }}>reps</span>
                    </div>
                  </div>

                  {/* Weight input */}
                  <div className="flex justify-center">
                    <div
                      className="flex items-center gap-1 rounded-lg px-3 py-1.5"
                      style={{
                        background: 'var(--input-bg)',
                        border: '1px solid var(--glass-border)',
                      }}
                    >
                      <input
                        type="number"
                        inputMode="decimal"
                        value={set.weightKg ?? ''}
                        onChange={(e) => updateSet(i, { weightKg: e.target.value ? Number(e.target.value) : undefined })}
                        className="w-10 bg-transparent text-center font-semibold text-sm focus:outline-none"
                        style={{ color: 'var(--text)' }}
                        placeholder="—"
                      />
                      <span className="text-xs" style={{ color: 'var(--muted)' }}>kg</span>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeSet(i)}
                    disabled={sets.length <= 1}
                    className="flex items-center justify-center w-7 h-7 rounded-full"
                    style={{
                      color: sets.length <= 1 ? 'var(--glass-border)' : '#ef4444',
                      background: sets.length <= 1 ? 'transparent' : 'rgba(239,68,68,0.1)',
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}

              {/* Add set */}
              <div className="px-4 py-3" style={{ borderTop: '1px solid var(--glass-border)' }}>
                <button
                  onClick={addSet}
                  className="w-full py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1"
                  style={{ background: 'var(--surface-2)', color: 'var(--color-primary)' }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Ajouter une série
                </button>
              </div>
            </div>

            {/* Rest time */}
            <div className="rounded-xl px-4 py-3" style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)' }}>
              <div className="flex items-center gap-2 mb-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4" style={{ color: 'var(--muted)' }}>
                  <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                </svg>
                <p className="text-[10px] font-bold tracking-widest" style={{ color: 'var(--muted)' }}>TEMPS DE REPOS</p>
              </div>
              <div className="flex items-end gap-3">
                {/* Minutes */}
                <div className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full flex items-center justify-center rounded-lg py-2"
                    style={{ background: 'var(--input-bg)', border: '1px solid var(--glass-border)' }}
                  >
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={59}
                      value={Math.floor(restSeconds / 60)}
                      onChange={(e) => {
                        const v = Math.max(0, Math.min(59, parseInt(e.target.value, 10) || 0))
                        setRestSeconds(v * 60 + (restSeconds % 60))
                      }}
                      className="w-14 bg-transparent text-center text-2xl font-bold focus:outline-none"
                      style={{ color: 'var(--text)' }}
                    />
                  </div>
                  <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>min</span>
                </div>
                <span className="text-3xl font-bold mb-5" style={{ color: 'var(--muted)' }}>:</span>
                {/* Seconds */}
                <div className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full flex items-center justify-center rounded-lg py-2"
                    style={{ background: 'var(--input-bg)', border: '1px solid var(--glass-border)' }}
                  >
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={59}
                      value={restSeconds % 60}
                      onChange={(e) => {
                        const v = Math.max(0, Math.min(59, parseInt(e.target.value, 10) || 0))
                        setRestSeconds(Math.floor(restSeconds / 60) * 60 + v)
                      }}
                      className="w-14 bg-transparent text-center text-2xl font-bold focus:outline-none"
                      style={{ color: 'var(--text)' }}
                    />
                  </div>
                  <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>sec</span>
                </div>
              </div>
            </div>

            {/* Save error banner */}
            {saveError && (
              <div
                className="flex items-start gap-2 rounded-xl px-4 py-3 text-sm"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 flex-shrink-0 mt-0.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                <span>{saveError}</span>
              </div>
            )}

            {/* CTA */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-4 rounded-xl font-bold text-white text-sm tracking-wider flex items-center justify-center gap-2 transition-all active:scale-98"
              style={{
                background: saved
                  ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                  : 'var(--gradient-primary)',
                opacity: saving ? 0.75 : 1,
              }}
            >
              {saved ? (
                <>
                  SÉQUENCE ENREGISTRÉE
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </>
              ) : saving ? (
                'ENREGISTREMENT...'
              ) : (
                <>
                  ENREGISTRER LA SÉQUENCE &amp; SUIVANT
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </>
        )}
      </div>

      {/* Machine Picker bottom sheet */}
      {showPicker && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end"
          style={{ background: 'rgba(0,0,0,0.65)' }}
          onClick={() => setShowPicker(false)}
        >
          <div
            className="rounded-t-2xl overflow-hidden flex flex-col"
            style={{
              background: 'var(--surface)',
              maxHeight: '75vh',
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ background: 'var(--glass-border)' }} />
            </div>

            <div className="px-5 pt-1 pb-3 flex items-center justify-between">
              <h3 className="font-bold text-base" style={{ color: 'var(--text)' }}>Choisir une machine</h3>
              <button
                onClick={() => setShowPicker(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'var(--surface-2)', color: 'var(--muted)' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              {Object.entries(grouped).map(([cat, mList]) => (
                <div key={cat}>
                  <div
                    className="px-5 py-2 text-[10px] font-bold tracking-widest uppercase"
                    style={{ background: 'var(--surface-2)', color: 'var(--muted)' }}
                  >
                    {mList[0]?.categoryLabel ?? cat}
                  </div>
                  {mList.map((m) => {
                    const isSelected = m.id === selectedId
                    return (
                      <button
                        key={m.id}
                        onClick={() => { setSelectedId(m.id); setShowPicker(false) }}
                        className="w-full flex items-center gap-3 px-5 py-3 text-left"
                        style={{
                          borderBottom: '1px solid var(--glass-border)',
                          background: isSelected ? 'rgba(59,126,248,0.08)' : 'transparent',
                        }}
                      >
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: 'var(--surface-2)', color: isSelected ? 'var(--color-primary)' : 'var(--muted)' }}
                        >
                          <MachineIcon machine={m} className="w-5 h-5" />
                        </div>
                        <span
                          className="flex-1 text-sm font-medium"
                          style={{ color: isSelected ? 'var(--color-primary)' : 'var(--text)' }}
                        >
                          {m.name}
                        </span>
                        {isSelected && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4" style={{ color: 'var(--color-primary)' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
