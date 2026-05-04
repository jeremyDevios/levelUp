import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Suivi des séances',
    desc: 'Enregistre séries, répétitions et poids pour chaque machine',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    title: 'Visualise ta progression',
    desc: 'Graphiques de progression par machine et suivi de ton poids',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Historique complet',
    desc: 'Calendrier de tes entraînements avec détail de chaque session',
  },
]

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

export default function Login() {
  const { signInWithGoogle, user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignIn = async () => {
    setLoading(true)
    setError(null)
    try {
      await signInWithGoogle()
      // On desktop popup resolves immediately; on mobile we get redirected
      navigate('/')
    } catch (e: any) {
      setError('Connexion impossible. Réessaie.')
    } finally {
      setLoading(false)
    }
  }

  // Already signed in (e.g. after redirect returns)
  if (user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: 'var(--bg)' }}>
        <div className="text-center space-y-4">
          {user.photoURL && (
            <img src={user.photoURL} alt="avatar" className="w-16 h-16 rounded-full mx-auto border-2" style={{ borderColor: 'var(--color-primary)' }} />
          )}
          <div>
            <p className="font-semibold" style={{ color: 'var(--text)' }}>Connecté en tant que</p>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>{user.displayName}</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full py-4 rounded-2xl font-bold text-white text-sm tracking-wider"
            style={{ background: 'var(--gradient-primary)' }}
          >
            Aller au tableau de bord →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--bg)' }}
    >
      {/* Hero top section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8">

        {/* App icon */}
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-2xl"
          style={{ background: 'var(--gradient-primary)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12" stroke="white" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-black tracking-tight mb-2" style={{ color: 'var(--text)' }}>
          level<span style={{ color: 'var(--color-primary)' }}>Up</span>
        </h1>
        <p className="text-base text-center max-w-xs mb-10" style={{ color: 'var(--muted)' }}>
          Ton coach de salle de sport personnel. Suis ta progression, bats tes records.
        </p>

        {/* Feature cards */}
        <div className="w-full max-w-sm space-y-3 mb-10">
          {features.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-2xl px-4 py-3"
              style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)' }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(59,126,248,0.15)', color: 'var(--color-primary)' }}
              >
                {f.icon}
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{f.title}</p>
                <p className="text-xs leading-snug" style={{ color: 'var(--muted)' }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div
        className="px-6 pb-safe space-y-3"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 32px)' }}
      >
        {error && (
          <p className="text-center text-sm text-red-400">{error}</p>
        )}

        <button
          onClick={handleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold text-sm transition-all active:scale-98"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text)',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? (
            <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--color-primary)' }} />
          ) : (
            <GoogleIcon />
          )}
          {loading ? 'Connexion en cours…' : 'Continuer avec Google'}
        </button>

        <p className="text-center text-xs" style={{ color: 'var(--muted)' }}>
          En te connectant, tu acceptes que tes données d'entraînement soient
          stockées de façon sécurisée sur Firebase.
        </p>
      </div>
    </div>
  )
}
