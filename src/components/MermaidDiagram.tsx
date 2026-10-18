import React, { useState, useEffect, useRef } from 'react'
import { AlertTriangle, Copy, Check, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import type { Theme, Language } from '../types'
import { getTranslation } from '../locales'
import { copyToClipboard } from '../utils/exportUtils'
import {
  generateUniqueDiagramId,
  renderMermaidDiagramSafe,
  cleanMermaidErrorMessage,
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

  // Stable instance ID per component mount, refreshed per render pass
  const renderSeqRef = useRef<number>(0)
  const t = (key: any) => getTranslation(language, key)

  const isCurrent = renderResult.code === trimmed && renderResult.theme === theme
  const isLoading = Boolean(trimmed && !isCurrent)
  const svg = isCurrent ? renderResult.svg : ''
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

  const handleCopyCode = async () => {
    const success = await copyToClipboard(code)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // 1. Error State: Visible, helpful fallback; never crashes preview
  if (error) {
    return (
      <div className="my-6 max-w-full rounded-lg border border-[var(--danger)]/30 bg-[var(--danger)]/5 p-4 text-sm font-sans transition-colors">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-[var(--danger)] font-medium">
            <AlertTriangle className="h-4 w-4 shrink-0" strokeWidth={2} />
            <span>{t('mermaidError')}</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] border border-[var(--border)] transition-colors"
              title={t('copySource')}
              aria-label={t('copySource')}
            >
              {copied ? <Check className="h-3.5 w-3.5 text-[var(--success)]" /> : <Copy className="h-3.5 w-3.5" />}
              <span className="hidden xs:inline">{copied ? t('copied') : t('copySource')}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSource(prev => !prev)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] border border-[var(--border)] transition-colors"
              title={showSource ? t('hideSource') : t('showSource')}
              aria-label={showSource ? t('hideSource') : t('showSource')}
            >
              {showSource ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              <span className="hidden xs:inline">{showSource ? t('hideSource') : t('showSource')}</span>
            </button>
          </div>
        </div>

        <p className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed">
          {error}
        </p>

        {showSource && (
          <div className="mt-3 overflow-hidden rounded border border-[var(--border)] bg-[var(--surface)]">
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
      <div className="my-6 max-w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 flex flex-col items-center justify-center gap-2 text-xs text-[var(--text-secondary)]">
        <Loader2 className="h-4 w-4 animate-spin text-[var(--accent)]" />
        <span>{t('renderingDiagram')}</span>
      </div>
    )
  }

  // Empty code state
  if (!svg) {
    return null
  }

  // 3. Successful Rendered Diagram: Responsive, horizontally scrollable, scaled correctly
  return (
    <div
      className="my-6 max-w-full overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6 flex justify-center items-center shadow-2xs [scrollbar-width:thin] transition-colors [&>svg]:max-w-full [&>svg]:h-auto [&>svg]:block font-sans"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
