import { useState, useEffect } from 'react'
import type { Language } from '../types'
import { getTranslation, type TranslationKey } from '../locales'

export function useLanguage(): {
  language: Language
  setLanguage: (lang: Language) => void
  toggleLanguage: () => void
  t: (key: TranslationKey) => string
} {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = window.localStorage.getItem('kam_markdown_lang') || window.localStorage.getItem('markflow_lang')
      if (saved === 'en' || saved === 'km') {
        return saved
      }
      if (typeof navigator !== 'undefined' && navigator.language && navigator.language.startsWith('km')) {
        return 'km'
      }
    } catch {
      // Fallback
    }
    return 'en'
  })

  useEffect(() => {
    document.documentElement.lang = language
    try {
      window.localStorage.setItem('kam_markdown_lang', language)
    } catch (err) {
      console.warn('Unable to persist language:', err)
    }
  }, [language])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
  }

  const toggleLanguage = () => {
    setLanguageState(prev => (prev === 'en' ? 'km' : 'en'))
  }

  const t = (key: TranslationKey) => getTranslation(language, key)

  return { language, setLanguage, toggleLanguage, t }
}
