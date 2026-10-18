import React, { useEffect } from 'react'
import { ShieldCheck, X, Trash2, CheckCircle2 } from 'lucide-react'
import type { Language } from '../types'
import { getTranslation } from '../locales'

interface SecurityModalProps {
  isOpen: boolean
  onClose: () => void
  onClearDraft: () => void
  language: Language
}

export const SecurityModal: React.FC<SecurityModalProps> = ({
  isOpen,
  onClose,
  onClearDraft,
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

  const securityPoints = language === 'km' ? [
    'គ្មានការបញ្ជូនទិន្នន័យ៖ អត្ថបទរបស់អ្នកស្ថិតនៅក្នុងម៉ាស៊ីន Browser 100%។',
    'ការពារការវាយប្រហារ XSS៖ រាល់កូដ HTML មិនមានសុវត្ថិភាពត្រូវបានច្រោះចេញ។',
    'រារាំងតំណភ្ជាប់គ្រោះថ្នាក់៖ មិនអនុញ្ញាតឱ្យប្រើប្រាស់ javascript: ឬ data: URI ឡើយ។',
    'កំណត់ទំហំឯកសារនាំចូល៖ អនុញ្ញាតត្រឹមអតិបរមា 500 KB សម្រាប់ឯកសារ .md។',
    'គោលការណ៍ CSP តឹងរ៉ឹង៖ Content Security Policy រារាំងការទាញយកកូដពីក្រៅ។',
  ] : [
    'Zero Cloud Leak: 100% client-side. Documents are processed exclusively in your browser.',
    'XSS Prevention: Raw HTML scripts (<script>, event handlers) are strictly disabled.',
    'Safe Link Protocols: Dangerous schemes (javascript:, vbscript:, unexpected data:) are blocked.',
    'File Import Limit: Maximum 500 KB file-size threshold enforced for .md imports.',
    'Strict CSP Active: Content Security Policy restricts external execution.',
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in">
      <div
        className="w-full max-w-lg rounded-xl bg-[var(--surface)] border border-[var(--border)] p-6 shadow-2xl text-[var(--text-primary)]"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <ShieldCheck className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{t('privacyTitle')}</h3>
              <p className="text-xs text-[var(--text-secondary)]">KAM-Markdown Client-Side Security Standards</p>
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

        <div className="mt-5 space-y-2.5">
          {securityPoints.map((point, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--success)] mt-0.5" strokeWidth={1.75} />
              <span>{point}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-lg bg-[var(--surface-secondary)] p-3.5 border border-[var(--border)]">
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {t('privacyNote')}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={onClearDraft}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-3 py-2 text-xs font-semibold text-[var(--danger)] hover:bg-[var(--danger)]/20 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>{t('clearDraft')}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[var(--surface-hover)] text-[var(--text-primary)] border border-[var(--border)] px-4 py-2 text-xs sm:text-sm font-medium hover:bg-[var(--surface-secondary)] transition-colors"
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}
