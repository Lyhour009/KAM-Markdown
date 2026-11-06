import React, { useState, useEffect, useRef } from 'react'
import {
  AlertTriangle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Expand,
  Database,
  GitFork,
  ArrowRightLeft,
  Workflow,
} from 'lucide-react'
import type { Theme, Language } from '../types'
import { getTranslation } from '../locales'
import { copyToClipboard } from '../utils/exportUtils'
import {
  generateUniqueDiagramId,
  renderMermaidDiagramSafe,
  cleanMermaidErrorMessage,
  detectDiagramType,
} from '../utils/mermaidUtils'

interface MermaidDiagramProps {
  code: string
  theme: Theme
  language: Language
}

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({
  code,
  theme,
  language,
}) => {
  const trimmed = code ? code.trim() : ''
  const [renderResult, setRenderResult] = useState<{
    code: string
    theme: Theme
    svg: string
    error: string | null
  }>({
    code: '',
    theme,
    svg: '',
    error: null,
  })

  const [showSource, setShowSource] = useState<boolean>(false)
  const [copied, setCopied] = useState<boolean>(false)
  const [zoom, setZoom] = useState<number>(100)
  const [isFitToWidth, setIsFitToWidth] = useState<boolean>(false)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)

  // Stable instance ID per component mount, refreshed per render pass
  const renderSeqRef = useRef<number>(0)
  const t = (key: any) => getTranslation(language, key)

  const diagramType = detectDiagramType(trimmed)

  const isCurrent = renderResult.code === trimmed && renderResult.theme === theme
  const isLoading = Boolean(trimmed && !isCurrent)
  const svg = isCurrent ? renderResult.svg : (renderResult.svg || '')
  const error = isCurrent ? renderResult.error : null

  useEffect(() => {
    if (!trimmed) return

    const currentSeq = ++renderSeqRef.current
    const renderId = generateUniqueDiagramId()

    renderMermaidDiagramSafe(renderId, trimmed, theme)
      .then((cleanSvg) => {
        // Prevent stale async renders from replacing newer edits
        if (renderSeqRef.current !== currentSeq) return

        setRenderResult({
          code: trimmed,
          theme,
          svg: cleanSvg,
          error: null,
        })
      })
      .catch((err: any) => {
        if (renderSeqRef.current !== currentSeq) return

        const friendlyMsg = cleanMermaidErrorMessage(err?.message || String(err))
        setRenderResult({
          code: trimmed,
          theme,
          svg: '',
          error: friendlyMsg || getTranslation(language, 'mermaidErrorHint'),
        })
      })
  }, [trimmed, theme, language])

  // Close fullscreen on Esc key
  useEffect(() => {
    if (!isFullscreen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen])

  const handleCopyCode = async () => {
    const success = await copyToClipboard(code)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleZoomIn = () => {
    setIsFitToWidth(false)
    setZoom((prev) => Math.min(prev + 25, 250))
  }

  const handleZoomOut = () => {
    setIsFitToWidth(false)
    setZoom((prev) => Math.max(prev - 25, 50))
  }

  const handleResetZoom = () => {
    setIsFitToWidth(false)
    setZoom(100)
  }

  const handleToggleFit = () => {
    setIsFitToWidth((prev) => !prev)
    setZoom(100)
  }

  const getDiagramBadge = () => {
    switch (diagramType) {
      case 'erd':
        return {
          icon: <Database className="h-3.5 w-3.5 text-[var(--accent)]" />,
          label: t('erdDiagram'),
        }
      case 'flowchart':
        return {
          icon: <GitFork className="h-3.5 w-3.5 text-[var(--accent)]" />,
          label: t('flowchartDiagram'),
        }
      case 'sequence':
        return {
          icon: <ArrowRightLeft className="h-3.5 w-3.5 text-[var(--accent)]" />,
          label: t('sequenceDiagram'),
        }
      default:
        return {
          icon: <Workflow className="h-3.5 w-3.5 text-[var(--accent)]" />,
          label: t('diagram'),
        }
    }
  }

  // 1. Error State: Visible, helpful fallback; never crashes preview
  if (error) {
    return (
      <div className="my-6 max-w-full rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/5 p-4 text-sm font-sans transition-colors shadow-2xs">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-[var(--danger)] font-semibold">
            <AlertTriangle className="h-4 w-4 shrink-0" strokeWidth={2} />
            <span>{t('mermaidError')}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--danger)]/10 text-[var(--danger)] font-mono">
              {diagramType.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] border border-[var(--border)] transition-colors cursor-pointer"
              title={t('copySource')}
              aria-label={t('copySource')}
            >
              {copied ? <Check className="h-3.5 w-3.5 text-[var(--success)]" /> : <Copy className="h-3.5 w-3.5" />}
              <span className="hidden xs:inline">{copied ? t('copied') : t('copySource')}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSource((prev) => !prev)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] border border-[var(--border)] transition-colors cursor-pointer"
              title={showSource ? t('hideSource') : t('showSource')}
              aria-label={showSource ? t('hideSource') : t('showSource')}
            >
              {showSource ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              <span className="hidden xs:inline">{showSource ? t('hideSource') : t('showSource')}</span>
            </button>
          </div>
        </div>

        <p className="mt-2 text-xs text-[var(--text-primary)] font-medium leading-relaxed bg-[var(--surface)] p-2.5 rounded-lg border border-[var(--danger)]/20">
          {error}
        </p>

        {showSource && (
          <div className="mt-3 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-2xs">
            <pre className="p-3 text-xs font-mono text-[var(--text-primary)] overflow-x-auto [scrollbar-width:thin] leading-relaxed">
              <code>{code}</code>
            </pre>
          </div>
        )}
      </div>
    )
  }

  // 2. Loading State: Subtle spinner only while actively generating
  if (isLoading && !svg) {
    return (
      <div className="my-6 max-w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 flex flex-col items-center justify-center gap-2 text-xs text-[var(--text-secondary)] shadow-2xs">
        <Loader2 className="h-5 w-5 animate-spin text-[var(--accent)]" />
        <span className="font-medium">{t('renderingDiagram')}</span>
      </div>
    )
  }

  // Empty code state
  if (!svg) {
    return null
  }

  const badge = getDiagramBadge()

  // 3. Render Diagram Container with Interactive Controls
  const renderDiagramContent = (isModal: boolean = false) => (
    <div
      className={`w-full overflow-auto [scrollbar-width:thin] flex items-center justify-center p-4 sm:p-6 transition-all ${
        isModal ? 'h-[calc(100vh-140px)]' : 'min-h-[220px]'
      }`}
    >
      <div
        style={{
          transform: isFitToWidth ? 'none' : `scale(${zoom / 100})`,
          transformOrigin: 'top center',
          transition: 'transform 0.15s ease-out',
        }}
        className={`flex justify-center items-center transition-all ${
          isFitToWidth
            ? '[&>svg]:max-w-full [&>svg]:h-auto [&>svg]:block'
            : '[&>svg]:max-w-none [&>svg]:h-auto [&>svg]:block'
        }`}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  )

  return (
    <>
      <div className="my-6 max-w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-2xs overflow-hidden transition-all group font-sans">
        {/* Header Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-[var(--surface-secondary)] border-b border-[var(--border)] text-xs select-none">
          {/* Left: Diagram Type Badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--surface)] border border-[var(--border-subtle)] font-medium text-[var(--text-primary)] shadow-2xs">
              {badge.icon}
              <span className="text-xs">{badge.label}</span>
            </span>

            {/* Current Zoom / Fit Indicator */}
            <span className="text-[11px] font-mono text-[var(--text-muted)] hidden sm:inline-block">
              {isFitToWidth ? t('fitToWidth') : `${zoom}%`}
            </span>
          </div>

          {/* Right: Interactive Zoom, Fit, Fullscreen, and Code Tools */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Zoom Controls */}
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={isFitToWidth || zoom <= 50}
              className="p-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title={t('zoomOut')}
              aria-label={t('zoomOut')}
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={handleResetZoom}
              className={`px-1.5 py-0.5 rounded-md text-[11px] font-mono font-medium transition-colors cursor-pointer ${
                zoom === 100 && !isFitToWidth
                  ? 'bg-[var(--accent)] text-white shadow-2xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
              }`}
              title={t('resetZoom')}
              aria-label={t('resetZoom')}
            >
              100%
            </button>

            <button
              type="button"
              onClick={handleZoomIn}
              disabled={isFitToWidth || zoom >= 250}
              className="p-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title={t('zoomIn')}
              aria-label={t('zoomIn')}
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>

            {/* Fit to Width toggle */}
            <button
              type="button"
              onClick={handleToggleFit}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer border ${
                isFitToWidth
                  ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-2xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] border-[var(--border)]'
              }`}
              title={t('fitToWidth')}
              aria-label={t('fitToWidth')}
            >
              <span className="hidden xs:inline">{t('fitToWidth')}</span>
              <Expand className="h-3.5 w-3.5 xs:hidden" />
            </button>

            {/* Fullscreen Modal Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
              title={t('fullscreen')}
              aria-label={t('fullscreen')}
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>

            <div className="h-3.5 w-px bg-[var(--border)] mx-1" />

            {/* Copy Code */}
            <button
              type="button"
              onClick={handleCopyCode}
              className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
              title={t('copySource')}
              aria-label={t('copySource')}
            >
              {copied ? <Check className="h-3.5 w-3.5 text-[var(--success)]" /> : <Copy className="h-3.5 w-3.5" />}
            </button>

            {/* View Source Toggle */}
            <button
              type="button"
              onClick={() => setShowSource((prev) => !prev)}
              className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
              title={showSource ? t('hideSource') : t('showSource')}
              aria-label={showSource ? t('hideSource') : t('showSource')}
            >
              {showSource ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Diagram SVG Canvas */}
        <div className={`relative ${isLoading ? 'opacity-70' : 'opacity-100'}`}>
          {renderDiagramContent(false)}
        </div>

        {/* Optional Source Code Accordion */}
        {showSource && (
          <div className="border-t border-[var(--border)] bg-[var(--surface-secondary)]/50 p-3">
            <pre className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs font-mono text-[var(--text-primary)] overflow-x-auto [scrollbar-width:thin] leading-relaxed">
              <code>{code}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox Modal for Large Schema / ERD Diagrams */}
      {isFullscreen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex flex-col bg-black/85 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-200"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between gap-4 pb-3 border-b border-white/10 select-none">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/10 text-white font-medium text-xs">
                {badge.icon}
                <span>{badge.label}</span>
              </span>
              <span className="text-white/60 text-xs font-mono">
                {isFitToWidth ? t('fitToWidth') : `${zoom}%`}
              </span>
            </div>

            {/* Modal Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={isFitToWidth || zoom <= 50}
                className="p-1.5 rounded-md text-white/80 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-colors cursor-pointer"
                title={t('zoomOut')}
              >
                <ZoomOut className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={handleResetZoom}
                className="px-2 py-1 rounded-md text-xs font-mono text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title={t('resetZoom')}
              >
                <RotateCcw className="h-3.5 w-3.5 inline mr-1" />
                100%
              </button>

              <button
                type="button"
                onClick={handleZoomIn}
                disabled={isFitToWidth || zoom >= 250}
                className="p-1.5 rounded-md text-white/80 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-colors cursor-pointer"
                title={t('zoomIn')}
              >
                <ZoomIn className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={handleToggleFit}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  isFitToWidth ? 'bg-[var(--accent)] text-white' : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {t('fitToWidth')}
              </button>

              <div className="h-4 w-px bg-white/20 mx-1" />

              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/10 text-white hover:bg-white/20 font-medium text-xs transition-colors cursor-pointer"
                title={t('exitFullscreen')}
              >
                <Minimize2 className="h-4 w-4" />
                <span className="hidden sm:inline">{t('exitFullscreen')}</span>
              </button>
            </div>
          </div>

          {/* Modal SVG Body */}
          <div className="flex-1 overflow-auto [scrollbar-width:thin] flex items-center justify-center p-4">
            <div className="bg-[var(--surface)] p-6 rounded-2xl shadow-2xl border border-[var(--border)] max-w-full overflow-auto [scrollbar-width:thin]">
              {renderDiagramContent(true)}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
