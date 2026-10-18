import React, { useRef, useState, useEffect } from 'react'
import {
  FolderOpen,
  Download,
  FileImage,
  Loader2,
  Sun,
  Moon,
  MoreHorizontal,
  Copy,
  Keyboard,
  Globe,
  ShieldCheck,
  RotateCcw,
  Trash2,
} from 'lucide-react'
import { BrandLogo } from './BrandLogo'
import type { Language, Theme } from '../types'
import { getTranslation } from '../locales'

interface HeaderProps {
  title: string
  onTitleChange: (newTitle: string) => void
  theme: Theme
  onToggleTheme: () => void
  language: Language
  onToggleLanguage: () => void
  onFileSelect: (file: File) => void
  onCopyClick: () => void
  onDownloadClick: () => void
  onExportPngClick: () => void
  isExportingPng?: boolean
  onResetClick: () => void
  onSecurityClick: () => void
  onShortcutsClick: () => void
  onClearDraftClick: () => void
  isSaving?: boolean
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onTitleChange,
  theme,
  onToggleTheme,
  language,
  onToggleLanguage,
  onFileSelect,
  onCopyClick,
  onDownloadClick,
  onExportPngClick,
  isExportingPng = false,
  onResetClick,
  onSecurityClick,
  onShortcutsClick,
  onClearDraftClick,
  isSaving = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const t = (key: any) => getTranslation(language, key)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileSelect(file)
      e.target.value = ''
    }
  }

  // Click outside listener for the "More" dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  return (
    <header className="border-b border-[var(--border)] bg-[var(--surface)] px-2.5 sm:px-4 py-1.5 sm:py-2 transition-colors sticky top-0 z-40 select-none">
      <div className="flex items-center justify-between gap-1.5 sm:gap-3">
        {/* Left: Brand Identity, Document Title & Save Status */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1">
          <div className="flex items-center gap-1.5 sm:gap-2 font-bold tracking-tight text-[var(--text-primary)] shrink-0">
            <BrandLogo size={22} />
            <span className="text-sm sm:text-base font-semibold tracking-tight hidden md:inline-block">KAM-Markdown</span>
          </div>

          <span className="text-[var(--border)] hidden md:inline shrink-0">/</span>

          {/* Document Title input + Save Indicator */}
          <div className="flex items-center gap-1.5 min-w-0 flex-1 max-w-[130px] xs:max-w-[180px] sm:max-w-xs">
            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="w-full rounded-md border border-transparent hover:border-[var(--border)] focus:border-[var(--accent)] focus:bg-[var(--surface)] bg-transparent px-1.5 sm:px-2 py-1 text-xs sm:text-sm font-medium text-[var(--text-primary)] outline-none transition-colors truncate"
              title="Rename document"
              aria-label="Document Title"
            />
            {/* Visual save status dot on small screens */}
            <span
              className={`inline-block h-2 w-2 rounded-full shrink-0 transition-colors ${
                isSaving ? 'bg-amber-400 animate-pulse' : 'bg-[var(--success)]'
              }`}
              title={isSaving ? t('saving') : t('savedLocally')}
              aria-label={isSaving ? t('saving') : t('savedLocally')}
            />
          </div>
        </div>

        {/* Right: Touch-Friendly Header Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".md,.markdown,.txt"
            className="hidden"
          />

          {/* 1. Open Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--surface)] p-2 sm:px-2.5 sm:py-1.5 text-xs sm:text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors shadow-2xs shrink-0"
            title={t('openFile')}
            aria-label={t('openFile')}
          >
            <FolderOpen className="h-4 w-4 text-[var(--text-secondary)] stroke-[1.75]" />
            <span className="hidden md:inline">{t('openFile')}</span>
          </button>

          {/* 2. Download Button (Primary Accent Action) */}
          <button
            type="button"
            onClick={onDownloadClick}
            className="inline-flex items-center justify-center gap-1.5 rounded-md bg-[var(--accent)] hover:bg-[var(--accent-hover)] p-2 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium text-white transition-colors shadow-2xs shrink-0"
            title={t('downloadFile')}
            aria-label={t('downloadFile')}
          >
            <Download className="h-4 w-4 stroke-[1.75]" />
            <span className="hidden sm:inline">{t('downloadFile')}</span>
          </button>

          {/* 3. Export PNG Button (Visible on sm+, in More menu on small mobile) */}
          <button
            type="button"
            onClick={onExportPngClick}
            disabled={isExportingPng}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-xs sm:text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors shadow-2xs disabled:opacity-50 shrink-0"
            title={t('exportPng')}
            aria-label={t('exportPng')}
          >
            {isExportingPng ? (
              <Loader2 className="h-4 w-4 text-[var(--accent)] animate-spin stroke-[1.75]" />
            ) : (
              <FileImage className="h-4 w-4 text-[var(--accent)] stroke-[1.75]" />
            )}
            <span className="hidden md:inline">{isExportingPng ? t('exportingPng') : t('exportPng')}</span>
          </button>

          {/* 4. Theme Toggle (Touch Friendly) */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="inline-flex items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] p-2 text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors shadow-2xs shrink-0"
            title={theme === 'dark' ? t('lightTheme') : t('darkTheme')}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400 stroke-[1.75]" /> : <Moon className="h-4 w-4 text-[var(--text-secondary)] stroke-[1.75]" />}
          </button>

          {/* 5. "⋯ More" Dropdown Menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen(prev => !prev)}
              className={`inline-flex items-center justify-center gap-1 rounded-md border p-2 sm:px-2.5 sm:py-1.5 text-xs sm:text-sm font-medium transition-colors shadow-2xs shrink-0 ${
                isMenuOpen
                  ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                  : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
              }`}
              title={t('moreOptions')}
              aria-label={t('moreOptions')}
              aria-expanded={isMenuOpen}
              aria-haspopup="true"
            >
              <MoreHorizontal className="h-4 w-4 text-[var(--text-secondary)] stroke-[1.75]" />
              <span className="hidden md:inline">{t('more')}</span>
            </button>

            {/* Dropdown Panel */}
            {isMenuOpen && (
              <div 
                className="absolute right-0 mt-2 w-56 rounded-lg border border-[var(--border)] bg-[var(--surface)] py-1 shadow-lg z-50 text-xs sm:text-sm animate-fade-in divide-y divide-[var(--border-subtle)]"
                role="menu"
              >
                {/* Secondary Actions */}
                <div className="py-1">
                  {/* Export as PNG */}
                  <button
                    type="button"
                    onClick={() => {
                      onExportPngClick()
                      setIsMenuOpen(false)
                    }}
                    disabled={isExportingPng}
                    className="flex w-full items-center gap-2.5 px-3.5 py-2 text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors text-left disabled:opacity-50"
                    role="menuitem"
                  >
                    <FileImage className="h-4 w-4 text-[var(--accent)] stroke-[1.75]" />
                    <span>{t('exportPng')}</span>
                  </button>

                  {/* Copy Markdown */}
                  <button
                    type="button"
                    onClick={() => {
                      onCopyClick()
                      setIsMenuOpen(false)
                    }}
                    className="flex w-full items-center gap-2.5 px-3.5 py-2 text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors text-left"
                    role="menuitem"
                  >
                    <Copy className="h-4 w-4 text-[var(--text-secondary)] stroke-[1.75]" />
                    <span>{t('copyMarkdown')}</span>
                  </button>

                  {/* Keyboard Shortcuts */}
                  <button
                    type="button"
                    onClick={() => {
                      onShortcutsClick()
                      setIsMenuOpen(false)
                    }}
                    className="flex w-full items-center gap-2.5 px-3.5 py-2 text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors text-left"
                    role="menuitem"
                  >
                    <Keyboard className="h-4 w-4 text-[var(--text-secondary)] stroke-[1.75]" />
                    <span>{t('shortcutsHelp')}</span>
                  </button>

                  {/* Language Switch */}
                  <button
                    type="button"
                    onClick={() => {
                      onToggleLanguage()
                      setIsMenuOpen(false)
                    }}
                    className="flex w-full items-center justify-between px-3.5 py-2 text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors text-left"
                    role="menuitem"
                  >
                    <div className="flex items-center gap-2.5">
                      <Globe className="h-4 w-4 text-[var(--text-secondary)] stroke-[1.75]" />
                      <span>{t('language')}</span>
                    </div>
                    <span className="font-semibold text-xs text-[var(--accent)] bg-[var(--accent-soft)] px-1.5 py-0.5 rounded">
                      {language === 'en' ? 'ភាសាខ្មែរ' : 'English'}
                    </span>
                  </button>

                  {/* Security & Local Privacy */}
                  <button
                    type="button"
                    onClick={() => {
                      onSecurityClick()
                      setIsMenuOpen(false)
                    }}
                    className="flex w-full items-center gap-2.5 px-3.5 py-2 text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors text-left"
                    role="menuitem"
                  >
                    <ShieldCheck className="h-4 w-4 text-[var(--success)] stroke-[1.75]" />
                    <span>{t('privacyTitle')}</span>
                  </button>
                </div>

                {/* Destructive Actions */}
                <div className="py-1">
                  {/* Reset Document */}
                  <button
                    type="button"
                    onClick={() => {
                      onResetClick()
                      setIsMenuOpen(false)
                    }}
                    className="flex w-full items-center gap-2.5 px-3.5 py-2 text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors text-left"
                    role="menuitem"
                  >
                    <RotateCcw className="h-4 w-4 text-[var(--text-secondary)] stroke-[1.75]" />
                    <span>{t('reset')}</span>
                  </button>

                  {/* Clear Local Draft */}
                  <button
                    type="button"
                    onClick={() => {
                      onClearDraftClick()
                      setIsMenuOpen(false)
                    }}
                    className="flex w-full items-center gap-2.5 px-3.5 py-2 text-[var(--danger)] hover:bg-[var(--accent-soft)] transition-colors text-left"
                    role="menuitem"
                  >
                    <Trash2 className="h-4 w-4 text-[var(--danger)] stroke-[1.75]" />
                    <span>{t('clearDraft')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
