import mermaid from 'mermaid'
import DOMPurify from 'dompurify'
import type { Theme } from '../types'

let isInitialized = false
let currentTheme: Theme | null = null

/**
 * Normalizes and repairs common Mermaid syntax issues before rendering (e.g., ERD relationship labels).
 */
export function normalizeMermaidCode(rawCode: string): string {
  if (!rawCode) return ''

  // 1. Remove non-printable zero-width Unicode characters that may be introduced during copy-paste
  let cleaned = rawCode.replace(/[\u200B-\u200D\uFEFF]/g, '').trim()

  const lines = cleaned.split(/\r?\n/)
  const firstLine = lines[0] ? lines[0].trim() : ''

  // 2. ER Diagram specific normalization
  if (/^erDiagram/i.test(firstLine)) {
    cleaned = lines.map((line) => {
      // Check for relationship lines where relationship label has spaces, parentheses, slashes, or dashes
      // e.g. USERS ||--o{ RESERVATIONS : makes (guest_id)
      const relMatch = line.match(/^(\s*\w+\s*(?:\|\||\|o|\}\||\}o|--|\.\.)[^\n:]*:\s*)([^"\r\n]+)$/)
      if (relMatch) {
        const prefix = relMatch[1]
        const label = relMatch[2].trim()
        if (/[\s()\-/,]/.test(label) && !label.startsWith('"') && !label.endsWith('"')) {
          return `${prefix}"${label}"`
        }
      }
      return line
    }).join('\n')
  }

  return cleaned
}

/**
 * Detects the diagram type for UI labeling and responsive behavior.
 */
export function detectDiagramType(code: string): 'erd' | 'flowchart' | 'sequence' | 'diagram' {
  const trimmed = code.trim().toLowerCase()
  if (trimmed.startsWith('erdiagram')) return 'erd'
  if (trimmed.startsWith('flowchart') || trimmed.startsWith('graph')) return 'flowchart'
  if (trimmed.startsWith('sequencediagram')) return 'sequence'
  return 'diagram'
}

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
      primaryTextColor: '#F4F4F5',
      primaryBorderColor: '#958BFF',
      lineColor: '#A1A1AA',
      secondaryColor: '#242831',
      tertiaryColor: '#201F1D',
      fontFamily: "'Kantumruy Pro', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      // ERD specific theme overrides for Dark Mode
      attributeBackgroundColorOdd: '#242831',
      attributeBackgroundColorEven: '#1B1A18',
      entityBorder: '#4B5563',
      entityBkg: '#282623',
      entityTextColor: '#F4F4F5',
      relationshipLineColor: '#A1A1AA',
      relationshipLabelColor: '#F4F4F5',
      relationshipLabelBackground: '#201F1D',
    } : {
      darkMode: false,
      background: '#FFFFFF',
      mainBkg: '#F6F5F1',
      primaryColor: '#EFEDFF',
      primaryTextColor: '#18181B',
      primaryBorderColor: '#5B4BC4',
      lineColor: '#52525B',
      secondaryColor: '#FCFCFA',
      tertiaryColor: '#FFFFFF',
      fontFamily: "'Kantumruy Pro', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      // ERD specific theme overrides for Light Mode
      attributeBackgroundColorOdd: '#FFFFFF',
      attributeBackgroundColorEven: '#F8F9FA',
      entityBorder: '#D1D5DB',
      entityBkg: '#F3F4F6',
      entityTextColor: '#18181B',
      relationshipLineColor: '#52525B',
      relationshipLabelColor: '#18181B',
      relationshipLabelBackground: '#FFFFFF',
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
      useMaxWidth: false,
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
  const normalizedCode = normalizeMermaidCode(code)

  return new Promise<string>((resolve, reject) => {
    renderQueue = renderQueue
      .then(async () => {
        try {
          const { svg: rawSvg } = await mermaid.render(id, normalizedCode)

          // Sanitize generated SVG with DOMPurify, preserving all required ERD and diagram structures
          const cleanSvg = DOMPurify.sanitize(rawSvg, {
            USE_PROFILES: { svg: true, svgFilters: true },
            ADD_TAGS: ['use', 'symbol', 'defs', 'style'],
            ADD_ATTR: [
              'target',
              'transform-origin',
              'dominant-baseline',
              'text-anchor',
              'preserveAspectRatio',
            ],
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
