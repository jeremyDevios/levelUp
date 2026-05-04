import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const tabs = [
  {
    to: '/',
    label: 'DASHBOARD',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.8} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    to: '/history',
    label: 'HISTORIQUE',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.8} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    to: '/settings',
    label: 'PROFIL',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.8} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const location = useLocation()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex pb-safe"
      style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--glass-border)',
        paddingBottom: `max(env(safe-area-inset-bottom, 0px), 8px)`,
      }}
    >
      {tabs.map((tab) => {
        const active = tab.to === '/'
          ? location.pathname === '/'
          : location.pathname.startsWith(tab.to)
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            className="flex-1 flex flex-col items-center justify-center pt-2 pb-1 gap-0.5 transition-colors"
            style={{ color: active ? 'var(--color-primary)' : 'var(--muted)' }}
          >
            {tab.icon(active)}
            <span className="text-[9px] font-semibold tracking-wider">{tab.label}</span>
            {active && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full" style={{ background: 'var(--color-primary)' }} />
            )}
          </NavLink>
        )
      })}
    </nav>
  )
}
