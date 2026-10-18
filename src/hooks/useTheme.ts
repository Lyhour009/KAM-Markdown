import { useState, useEffect } from 'react'
import type { Theme } from '../types'

function getInitialTheme(): Theme {
  try {
    const saved = window.localStorage.getItem('kam_markdown_theme') || window.localStorage.getItem('markflow_theme')
    if (saved === 'light' || saved === 'dark') {
      return saved
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

// Synchronously apply class to documentElement to prevent flash of wrong theme
if (typeof document !== 'undefined') {
  const initial = getInitialTheme()
  if (initial === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    try {
      window.localStorage.setItem('kam_markdown_theme', theme)
    } catch (err) {
      console.warn('Unable to persist theme:', err)
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'))
  }

  return [theme, toggleTheme]
}
