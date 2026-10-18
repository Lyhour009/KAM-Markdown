import React from 'react'
import { CheckCircle2, AlertCircle } from 'lucide-react'

interface ToastProps {
  message: string | null
  type?: 'success' | 'error'
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success' }) => {
  if (!message) return null

  return (
    <div className="fixed bottom-12 right-6 z-50 flex items-center gap-2 rounded-lg bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] px-4 py-2.5 text-sm font-medium shadow-lg backdrop-blur-md transition-all animate-slide-up">
      {type === 'success' ? (
        <CheckCircle2 className="h-4 w-4 text-[var(--success)]" strokeWidth={1.75} />
      ) : (
        <AlertCircle className="h-4 w-4 text-[var(--danger)]" strokeWidth={1.75} />
      )}
      <span>{message}</span>
    </div>
  )
}
