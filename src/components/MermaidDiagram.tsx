import React, { useState, useEffect, useRef } from 'react'
import mermaid from 'mermaid'
import DOMPurify from 'dompurify'
import { AlertTriangle, Copy, Check, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import type { Theme, Language } from '../types'
import { getTranslation } from '../locales'
import { copyToClipboard } from '../utils/exportUtils'

interface MermaidDiagramProps {
  code: string
  theme: Theme
  language: Language
}

let diagramCounter = 0
function generateDiagramId(): string {
  diagramCounter += 1
  return `mermaid-diagram-${Date.now().toString(36)}-${diagramCounter}`
}

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({
  code,
  theme,
  language,
}) => {
  const [svg, setSvg] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [showSource, setShowSource] = useState<boolean>(false)
  const [copied, setCopied] = useState<boolean>(false)
  
  const renderIndexRef = useRef<number>(0)
  const t = (key: any) => getTranslation(language, key)

  useEffect(() => {
    const trimmedCode = code.trim()
    if (!trimmedCode) return

    const currentRender = ++renderIndexRef.current

    // Configure Mermaid with strict security and current theme tokens
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: theme === 'dark' ? 'dark' : 'neutral',
      themeVariables: theme === 'dark' ? {
        darkMode: true,
        background: '#201F1D',
        mainBkg: '#282623',
        primaryColor: '#302B4B',
        primaryTextColor: '#F0EFEA',
        primaryBorderColor: '#958BFF',
        lineColor: '#AAA79F',
        secondaryColor: '#242831',
        tertiaryColor: '#201F1D',
        fontFamily: "'Kantumruy Pro', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      } : {
        darkMode: false,
        background: '#FFFFFF',
        mainBkg: '#F6F5F1',
        primaryColor: '#EFEDFF',
        primaryTextColor: '#252522',
        primaryBorderColor: '#5B4BC4',
        lineColor: '#706F68',
        secondaryColor: '#FCFCFA',
        tertiaryColor: '#FFFFFF',
        fontFamily: "'Kantumruy Pro', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      },
      fontFamily: "'Kantumruy Pro', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      suppressErrorRendering: true,
    })

    const diagramId = generateDiagramId()

    // Render asynchronously with race-condition protection
    mermaid.render(diagramId, trimmedCode)
      .then(({ svg: rawSvg }) => {
        if (renderIndexRef.current !== currentRender) return

        // Sanitize generated SVG with DOMPurify
        const cleanSvg = DOMPurify.sanitize(rawSvg, {
          USE_PROFILES: { svg: true, svgFilters: true },
          ADD_TAGS: ['use', 'symbol', 'defs'],
          ADD_ATTR: ['target', 'transform-origin'],
        })

        setSvg(cleanSvg)
        setError(null)
        setIsLoading(false)
      })
      .catch((err: any) => {
        if (renderIndexRef.current !== currentRender) return

        // Clean up any residual error DOM elements inserted by Mermaid
        const residualEl = document.getElementById(diagramId) || document.getElementById(`d${diagramId}`)
        if (residualEl) {
          residualEl.remove()
        }

        const rawMessage = err?.message || String(err)
        // Clean up syntax error messages for better user experience
        const cleanMessage = rawMessage.replace(/Parse error on line \d+:/, '').trim()

        setError(cleanMessage || getTranslation(language, 'mermaidErrorHint'))
        setSvg('')
        setIsLoading(false)
      })
  }, [code, theme, language])

  const handleCopyCode = async () => {
    const success = await copyToClipboard(code)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // 1. Error State
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

  // 2. Loading State (subtle pulse when rendering)
  if (isLoading && !svg) {
    return (
      <div className="my-6 max-w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 flex flex-col items-center justify-center gap-2 text-xs text-[var(--text-secondary)]">
        <Loader2 className="h-4 w-4 animate-spin text-[var(--accent)]" />
        <span>{t('renderingDiagram')}</span>
      </div>
    )
  }

  // 3. Successful Rendered Diagram
  return (
    <div
      className="my-6 max-w-full overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6 flex justify-center items-center shadow-2xs [scrollbar-width:thin] transition-colors [&>svg]:max-w-full [&>svg]:h-auto [&>svg]:block font-sans"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
