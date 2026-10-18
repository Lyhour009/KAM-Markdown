import React from 'react'
import type { EditorStats, Language } from '../types'
import { getTranslation } from '../locales'

interface StatusBarProps {
  stats: EditorStats
  language: Language
  isSaving: boolean
}

export const StatusBar: React.FC<StatusBarProps> = ({
  stats,
  language,
  isSaving,
}) => {
  const t = (key: any) => getTranslation(language, key)

  // Only show estimated reading time for documents with meaningful length (> 50 words)
  const showReadingTime = stats.words >= 50

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface-secondary)] px-4 py-1 text-xs text-[var(--text-secondary)] flex items-center justify-between gap-3 select-none transition-colors">
      {/* Left: Cursor Position & Muted Counts */}
      <div className="flex items-center gap-2.5 sm:gap-3 font-mono text-[11px] sm:text-xs">
        <div>
          <span>{t('ln')} {stats.cursorLine}</span>
          <span className="mx-1 text-[var(--text-muted)] opacity-50">,</span>
          <span>{t('col')} {stats.cursorCol}</span>
        </div>

        <span className="text-[var(--text-muted)] opacity-50">•</span>

        <div className="font-sans">
          <span>{stats.words.toLocaleString()} {t('words')}</span>
        </div>

        <span className="text-[var(--text-muted)] opacity-50 hidden sm:inline">•</span>

        <div className="font-sans hidden sm:inline">
          <span>{stats.characters.toLocaleString()} {t('chars')}</span>
        </div>

        {showReadingTime && (
          <>
            <span className="text-[var(--text-muted)] opacity-50 hidden md:inline">•</span>
            <div className="font-sans hidden md:inline">
              <span>~{stats.readingTimeMinutes} {t('minRead')}</span>
            </div>
          </>
        )}
      </div>

      {/* Right: Autosave Note & Markdown tag with quiet indicator */}
      <div className="flex items-center gap-1.5 text-[11px] sm:text-xs">
        <span className={`inline-block h-1.5 w-1.5 rounded-full transition-colors ${isSaving ? 'bg-amber-400 animate-pulse' : 'bg-[var(--success)]'}`} />
        <span className="hidden sm:inline text-[var(--text-secondary)]">{isSaving ? t('saving') : t('markdownHint')}</span>
      </div>
    </footer>
  )
}
