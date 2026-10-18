import React, { useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  description: string
  confirmText: string
  cancelText: string
  onConfirm: () => void
  onCancel: () => void
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  description,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      if (e.key === 'Escape') onCancel()
      if (e.key === 'Enter') onConfirm()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onCancel, onConfirm])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in">
      <div 
        className="w-full max-w-md rounded-xl bg-[var(--surface)] border border-[var(--border)] p-6 shadow-xl text-[var(--text-primary)] transition-all"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--danger)]/10 text-[var(--danger)]">
              <AlertTriangle className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="rounded-lg p-1 text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        <p className="mt-3 text-sm text-[var(--text-secondary)] leading-relaxed">
          {description}
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-[var(--danger)] px-4 py-2 text-sm font-medium text-white shadow-xs hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--danger)]/30 transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
