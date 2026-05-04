import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '../lib/firebase'
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as fbSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth'

export type AuthContextValue = {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({} as AuthContextValue)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsub: (() => void) | undefined

    // Wait for redirect result FIRST, THEN subscribe to auth state.
    // Without this, onAuthStateChanged fires with null before Firebase
    // has a chance to process the returning redirect — causing a flash to /login.
    getRedirectResult(auth)
      .catch(() => {})
      .finally(() => {
        unsub = onAuthStateChanged(auth, (u) => {
          setUser(u)
          setLoading(false)
        })
      })

    return () => unsub?.()
  }, [])

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    // Try popup first — works on iOS Safari when triggered by direct user tap.
    // Fall back to redirect only if the popup is explicitly blocked by the browser.
    try {
      await signInWithPopup(auth, provider)
    } catch (e: any) {
      if (e.code === 'auth/popup-blocked') {
        await signInWithRedirect(auth, provider)
      } else if (e.code !== 'auth/popup-closed-by-user') {
        throw e
      }
    }
  }

  const signOut = async () => {
    await fbSignOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
