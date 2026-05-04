import React from 'react'
import BottomNav from './BottomNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen" style={{ background: 'var(--bg)' }}>
      <main
        className="overflow-y-auto"
        style={{ paddingBottom: 'calc(var(--nav-height) + env(safe-area-inset-bottom, 0px))' }}
      >
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
