import { useEffect, useState } from 'react'

export function useTheme() {
  const [dark, setDark] = useState<boolean>(() => {
    const stored = localStorage.getItem('theme')
    if (stored) return stored === 'dark'
    // Default dark: gym app is mostly used in dark environments
    return true
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return { dark, toggle: () => setDark((d) => !d), setDark }
}
