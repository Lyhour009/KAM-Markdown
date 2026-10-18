import React from 'react'
import { Edit3, Eye, RefreshCw, Maximize2, Minimize2 } from 'lucide-react'
import type { MobileTab, Language } from '../types'
import { getTranslation } from '../locales'

interface MobileTabBarProps {
  mobileTab: MobileTab
  onTabChange: (tab: MobileTab) => void
  language: Language
  isSyncScroll: boolean
  onToggleSyncScroll: () => void
  isFocusMode: boolean
  onToggleFocusMode: () => void
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({
  mobileTab,
  onTabChange,
  language,
  isSyncScroll,
  onToggleSyncScroll,
  isFocusMode,
  onToggleFocusMode,
}) => {
  const t = (key: any) => getTranslation(language, key)

  return (
    <div
      className="md:hidden flex items-center justify-between px-2.5 sm:px-3 py-1.5 bg-[var(--surface)] border-b border-[var(--border)] gap-2 select-none shrink-0"
      role="tablist"
      aria-label="Mobile workspace view tabs"
    >
      {/* Clear Two-Option Switcher: Editor / Preview */}
      <div className="flex items-center rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] p-0.5 flex-1 max-w-[260px]">
        <button
          type="button"
          role="tab"
          id="mobile-tab-editor"
          aria-selected={mobileTab === 'editor'}
          aria-controls="mobile-panel-editor"
          onClick={() => onTabChange('editor')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-semibold transition-all touch-manipulation ${
            mobileTab === 'editor'
              ? 'bg-[var(--surface)] text-[var(--accent)] shadow-2xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Edit3 className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span>{t('editorTab')}</span>
        </button>

        <button
          type="button"
          role="tab"
          id="mobile-tab-preview"
          aria-selected={mobileTab === 'preview'}
          aria-controls="mobile-panel-preview"
          onClick={() => onTabChange('preview')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-semibold transition-all touch-manipulation ${
            mobileTab === 'preview'
              ? 'bg-[var(--surface)] text-[var(--accent)] shadow-2xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span>{t('previewTab')}</span>
        </button>
      </div>

      {/* Secondary Fast Actions on Mobile */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Sync Scroll Toggle */}
        <button
          type="button"
          onClick={onToggleSyncScroll}
          className={`inline-flex items-center justify-center h-8 w-8 rounded-md border text-xs transition-colors touch-manipulation ${
            isSyncScroll
              ? 'bg-[var(--accent-soft)] border-[var(--accent)]/30 text-[var(--accent)]'
              : 'border-[var(--border)] text-[var(--text-secondary)] bg-[var(--surface)] hover:bg-[var(--surface-hover)]'
          }`}
          title={isSyncScroll ? t('syncScrollEnabled') : t('syncScrollDisabled')}
          aria-label={t('syncScroll')}
        >
          <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>

        {/* Focus Mode Button */}
        <button
          type="button"
          onClick={onToggleFocusMode}
          className={`inline-flex items-center justify-center h-8 w-8 rounded-md border text-xs transition-colors touch-manipulation ${
            isFocusMode
              ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-2xs'
              : 'border-[var(--border)] text-[var(--text-primary)] bg-[var(--surface)] hover:bg-[var(--surface-hover)]'
          }`}
          title={isFocusMode ? t('exitFocusMode') : t('focusMode')}
          aria-label={t('focusMode')}
        >
          {isFocusMode ? (
            <Minimize2 className="h-3.5 w-3.5" strokeWidth={1.75} />
          ) : (
            <Maximize2 className="h-3.5 w-3.5 text-[var(--accent)]" strokeWidth={1.75} />
          )}
        </button>
      </div>
    </div>
  )
}
