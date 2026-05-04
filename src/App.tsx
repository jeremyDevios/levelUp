import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import { useAuth } from './hooks/useAuth'
import { useTheme } from './hooks/useTheme'
import History from './pages/History'
import MachineDetail from './pages/MachineDetail'
import Weight from './pages/Weight'
import Settings from './pages/Settings'
import AppLayout from './components/layout/AppLayout'

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, color: '#ef4444', fontFamily: 'monospace' }}>
          <h2 style={{ marginBottom: 8 }}>Something went wrong</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>{this.state.error.message}</pre>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  const { user, loading } = useAuth()
  // Initialize theme on mount (applies .dark class to <html>)
  useTheme()

  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: 'var(--bg)' }}
      >
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--color-primary)' }} />
      </div>
    )
  }

  if (!user) {
    return (
      <ErrorBoundary>
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
          <Route path="/history/:machineId" element={<MachineDetail />} />
          <Route path="/weight" element={<Weight />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </ErrorBoundary>
  )
}
