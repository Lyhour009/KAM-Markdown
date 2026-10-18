import React from 'react'
import { Minimize2 } from 'lucide-react'
import type { Language } from '../types'
import { getTranslation } from '../locales'

interface FocusModeBannerProps {
  isFocusMode: boolean
  onExit: () => void
  language: Language
}

export const FocusModeBanner: React.FC<FocusModeBannerProps> = ({
  isFocusMode,
  onExit,
  language,
}) => {
  const t = (key: any) => getTranslation(language, key)

  if (!isFocusMode) return null

  return (
    <div className="fixed top-3 right-5 z-50 flex items-center gap-2 rounded-full bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] px-3 py-1.5 text-xs font-medium shadow-xl backdrop-blur-md transition-all animate-fade-in">
      <span className="flex h-2 w-2 rounded-full bg-[var(--success)] animate-pulse" />
      <span>{t('focusMode')}</span>
      <span className="text-[var(--text-muted)] opacity-50">|</span>
      <button
        type="button"
        onClick={onExit}
        className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-hover)] text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] border border-[var(--border)] px-2 py-0.5 text-xs transition-colors"
        title="Exit Focus Mode (Esc)"
      >
        <Minimize2 className="h-3 w-3" strokeWidth={1.75} />
        <span>{t('exitFocusMode')}</span>
      </button>
    </div>
  )
}
