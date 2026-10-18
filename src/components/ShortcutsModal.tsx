import React, { useEffect } from 'react'
import { Keyboard, X } from 'lucide-react'
import type { Language } from '../types'
import { getTranslation } from '../locales'

interface ShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
  language: Language
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const t = (key: any) => getTranslation(language, key)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0
  const modKey = isMac ? '⌘' : 'Ctrl'

  const shortcuts = language === 'km' ? [
    { key: `${modKey} + B`, desc: 'អក្សរដិត (Bold)' },
    { key: `${modKey} + I`, desc: 'អក្សរទ្រេត (Italic)' },
    { key: `${modKey} + S`, desc: 'ទាញយកឯកសារ Markdown' },
    { key: 'F11', desc: 'បើក / បិទ Focus Mode' },
    { key: 'Esc', desc: 'ចាកចេញពី Focus Mode ឬបិទផ្ទាំង' },
    { key: 'Tab', desc: 'រំកិលចូលបន្ទាត់ (Indent)' },
    { key: 'Double Click', desc: 'កំណត់ទំហំផ្ទាំងស្មើគ្នា 50/50 (លើ Divider)' },
  ] : [
    { key: `${modKey} + B`, desc: 'Toggle bold text' },
    { key: `${modKey} + I`, desc: 'Toggle italic text' },
    { key: `${modKey} + S`, desc: 'Download .md file' },
    { key: 'F11', desc: 'Toggle Focus Mode' },
    { key: 'Esc', desc: 'Exit Focus Mode / Close modals' },
    { key: 'Tab', desc: 'Indent text in editor' },
    { key: 'Double Click', desc: 'Reset layout to 50/50 (on divider)' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in">
      <div
        className="w-full max-w-md rounded-xl bg-[var(--surface)] border border-[var(--border)] p-6 shadow-2xl text-[var(--text-primary)]"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <Keyboard className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{t('shortcutsHelp')}</h3>
              <p className="text-xs text-[var(--text-secondary)]">{t('shortcutsDesc')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        <div className="mt-5 divide-y divide-[var(--border-subtle)]">
          {shortcuts.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-2.5 text-xs sm:text-sm">
              <span className="text-[var(--text-secondary)]">{item.desc}</span>
              <kbd className="rounded-md border border-[var(--border)] bg-[var(--surface-secondary)] px-2 py-1 font-mono text-xs font-semibold text-[var(--text-primary)] shadow-2xs">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end pt-3 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[var(--surface-hover)] text-[var(--text-primary)] border border-[var(--border)] px-4 py-2 text-xs sm:text-sm font-medium hover:bg-[var(--surface-secondary)] transition-colors"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  )
}
