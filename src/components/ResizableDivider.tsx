import React, { useState, useCallback, useRef } from 'react'

interface ResizableDividerProps {
  ratio: number
  onRatioChange: (newRatio: number) => void
  onReset: () => void
  minRatio?: number
  maxRatio?: number
  title?: string
}

export const ResizableDivider: React.FC<ResizableDividerProps> = ({
  ratio,
  onRatioChange,
  onReset,
  minRatio = 20,
  maxRatio = 80,
  title = 'Drag to resize (Double-click to reset)',
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const dividerRef = useRef<HTMLDivElement>(null)

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
    const dividerEl = e.currentTarget
    dividerEl.setPointerCapture(e.pointerId)

    const parentEl = dividerEl.parentElement
    if (!parentEl) return
    const rect = parentEl.getBoundingClientRect()

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const offset = moveEvent.clientX - rect.left
      const rawPct = (offset / rect.width) * 100
      const clampedPct = Math.min(Math.max(rawPct, minRatio), maxRatio)
      onRatioChange(clampedPct)
    }

    const handlePointerUp = (upEvent: PointerEvent) => {
      setIsDragging(false)
      try {
        dividerEl.releasePointerCapture(upEvent.pointerId)
      } catch {
        // Fallback
      }
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerUp)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerUp)
  }, [minRatio, maxRatio, onRatioChange])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      onRatioChange(Math.max(ratio - 2, minRatio))
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      onRatioChange(Math.min(ratio + 2, maxRatio))
    } else if (e.key === 'Home') {
      e.preventDefault()
      onRatioChange(minRatio)
    } else if (e.key === 'End') {
      e.preventDefault()
      onRatioChange(maxRatio)
    } else if (e.key === 'Enter' || e.key === ' ' || e.key === 'r') {
      e.preventDefault()
      onReset()
    }
  }

  return (
    <div
      ref={dividerRef}
      role="separator"
      aria-orientation="vertical"
      aria-valuenow={Math.round(ratio)}
      aria-valuemin={minRatio}
      aria-valuemax={maxRatio}
      tabIndex={0}
      title={title}
      onPointerDown={handlePointerDown}
      onDoubleClick={onReset}
      onKeyDown={handleKeyDown}
      className={`relative z-30 hidden md:flex items-center justify-center w-2 -mx-1 cursor-col-resize select-none touch-none transition-colors group focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] ${
        isDragging
          ? 'bg-[var(--accent-soft)]'
          : 'hover:bg-[var(--accent-soft)]/50 bg-transparent'
      }`}
    >
      {/* Visual Line & Handle */}
      <div
        className={`w-px h-full transition-colors ${
          isDragging
            ? 'bg-[var(--accent)]'
            : 'bg-[var(--border)] group-hover:bg-[var(--accent)]'
        }`}
      />

      {/* Center grip handle */}
      <div
        className={`absolute h-8 w-3.5 rounded-full border flex items-center justify-center transition-all shadow-xs ${
          isDragging
            ? 'bg-[var(--accent)] border-[var(--accent)] text-white scale-110'
            : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)] group-hover:border-[var(--accent)] group-hover:text-[var(--accent)]'
        }`}
      >
        <div className="flex flex-col gap-0.5">
          <span className="block h-0.5 w-0.5 rounded-full bg-current" />
          <span className="block h-0.5 w-0.5 rounded-full bg-current" />
          <span className="block h-0.5 w-0.5 rounded-full bg-current" />
        </div>
      </div>
    </div>
  )
}
