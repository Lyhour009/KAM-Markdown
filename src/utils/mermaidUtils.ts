import mermaid from 'mermaid'
import DOMPurify from 'dompurify'
import type { Theme } from '../types'

let isInitialized = false
let currentTheme: Theme | null = null

/**
 * Initializes Mermaid configuration once. Re-initializes only when the application theme changes.
 */
export function ensureMermaidInitialized(theme: Theme): void {
  if (isInitialized && currentTheme === theme) {
    return
  }

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
    htmlLabels: false,
    flowchart: {
      htmlLabels: false,
      useMaxWidth: true,
    },
    sequence: {
      useMaxWidth: true,
    },
    er: {
      useMaxWidth: true,
    },
    fontFamily: "'Kantumruy Pro', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    suppressErrorRendering: true,
  })

  currentTheme = theme
  isInitialized = true
}

let diagramIdCounter = 0
export function generateUniqueDiagramId(): string {
  diagramIdCounter += 1
  return `mermaid-diagram-${Date.now().toString(36)}-${diagramIdCounter}`
}

// Global serialized render queue to prevent concurrent DOM mutations in Mermaid's temporary container
let renderQueue: Promise<any> = Promise.resolve()

/**
 * Queues and renders a Mermaid diagram safely and returns the sanitized SVG string.
 */
export function renderMermaidDiagramSafe(id: string, code: string, theme: Theme): Promise<string> {
  ensureMermaidInitialized(theme)

  return new Promise<string>((resolve, reject) => {
    renderQueue = renderQueue
      .then(async () => {
        try {
          const { svg: rawSvg } = await mermaid.render(id, code)

          // Sanitize generated SVG with DOMPurify
          const cleanSvg = DOMPurify.sanitize(rawSvg, {
            USE_PROFILES: { svg: true, svgFilters: true },
            ADD_TAGS: ['use', 'symbol', 'defs', 'style'],
            ADD_ATTR: ['target', 'transform-origin', 'dominant-baseline', 'text-anchor'],
          })

          resolve(cleanSvg)
        } catch (err: any) {
          // Clean up any residual error DOM elements inserted by Mermaid into document body
          if (typeof document !== 'undefined') {
            const residualEl = document.getElementById(id) || document.getElementById(`d${id}`)
            if (residualEl) {
              residualEl.remove()
            }
          }
          reject(err)
        }
      })
      .catch((err) => {
        reject(err)
      })
  })
}

/**
 * Formats Mermaid error messages to be user-friendly without exposing raw stack traces.
 */
export function cleanMermaidErrorMessage(rawMessage: string): string {
  if (!rawMessage) return 'Syntax error in Mermaid diagram'
  return rawMessage
    .replace(/^Error:\s*/i, '')
    .replace(/Parse error on line \d+:\s*/i, '')
    .replace(/Lexical error on line \d+:\s*/i, '')
    .replace(/Error: Diagram syntax error in [^:]+:\s*/i, '')
    .split('\n')[0]
    .trim() || 'Invalid diagram syntax'
}

