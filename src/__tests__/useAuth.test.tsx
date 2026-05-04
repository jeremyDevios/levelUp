import { renderHook, act } from '@testing-library/react'
import React from 'react'
import { AuthProvider, useAuth } from '../hooks/useAuth'

test('useAuth provides signIn and signOut stubs and user null by default', async () => {
  const wrapper = ({ children }: { children?: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  )

  const { result } = renderHook(() => useAuth(), { wrapper })

  expect(result.current.user).toBeNull()
  expect(typeof result.current.signInWithGoogle).toBe('function')
  expect(typeof result.current.signOut).toBe('function')
})
