import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { firestore } from '../lib/firebase'
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore'

export default function Settings() {
  const { user, signOut } = useAuth()
  const { dark, toggle } = useTheme()
  const uid = user?.uid ?? null
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

      <div className="px-4 pt-6 space-y-4">
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
