'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

export type Theme = 'dark-gold' | 'maroon-white'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark-gold')

  // Load theme from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('gaboose-theme')
    if (saved === 'dark-gold' || saved === 'maroon-white') {
      setThemeState(saved)
      applyTheme(saved)
    } else {
      applyTheme('dark-gold')
    }
  }, [])

  const applyTheme = (t: Theme) => {
    const html = document.documentElement
    html.classList.remove('theme-dark-gold', 'theme-maroon-white')
    html.classList.add(`theme-${t}`)
  }

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
    localStorage.setItem('gaboose-theme', t)
    applyTheme(t)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
