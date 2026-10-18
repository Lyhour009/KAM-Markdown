import test from 'node:test'
import assert from 'node:assert/strict'
import DOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'

// Set up DOMPurify for Node.js environment
const window = new JSDOM('').window
// @ts-expect-error - JSDOM window provides DOMPurify requirements in Node
const purify = DOMPurify(window)

// Logic helpers matching MermaidDiagram.tsx
export function isMermaidCodeBlock(className: string | undefined, isInline: boolean): boolean {
  if (isInline) return false
  const match = /language-(\w+)/.exec(className || '')
  return !!match && match[1].toLowerCase() === 'mermaid'
}

let diagramCounter = 0
export function generateTestDiagramId(): string {
  diagramCounter += 1
  return `mermaid-diagram-${Date.now().toString(36)}-${diagramCounter}`
}

export function sanitizeSvgOutput(rawSvg: string): string {
  return purify.sanitize(rawSvg, {
    USE_PROFILES: { svg: true, svgFilters: true },
    ADD_TAGS: ['use', 'symbol', 'defs'],
    ADD_ATTR: ['target', 'transform-origin'],
  })
}

export function formatMermaidErrorMessage(rawMessage: string): string {
  return rawMessage.replace(/Parse error on line \d+:/, '').trim()
}

test('Mermaid: isMermaidCodeBlock detects only block-level mermaid fences', () => {
  // Valid mermaid code blocks
  assert.equal(isMermaidCodeBlock('language-mermaid', false), true)
  assert.equal(isMermaidCodeBlock('language-MERMAID', false), true)
  assert.equal(isMermaidCodeBlock('hljs language-mermaid', false), true)

  // Other languages
  assert.equal(isMermaidCodeBlock('language-typescript', false), false)
  assert.equal(isMermaidCodeBlock('language-javascript', false), false)
  assert.equal(isMermaidCodeBlock('language-python', false), false)
  assert.equal(isMermaidCodeBlock('language-json', false), false)
  assert.equal(isMermaidCodeBlock(undefined, false), false)

  // Inline code must never be treated as diagram
  assert.equal(isMermaidCodeBlock('language-mermaid', true), false)
  assert.equal(isMermaidCodeBlock(undefined, true), false)
})

test('Mermaid Security: DOMPurify strictly neutralizes XSS payloads in SVG', () => {
  // Attempt 1: Script tag injection
  const maliciousScript = `<svg viewBox="0 0 100 100"><script>alert('pwned')</script><circle cx="50" cy="50" r="40" fill="red"/></svg>`
  const cleanScript = sanitizeSvgOutput(maliciousScript)
  assert.equal(cleanScript.includes('<script>'), false)
  assert.equal(cleanScript.includes('alert'), false)
  assert.equal(cleanScript.includes('<circle'), true)

  // Attempt 2: Inline event handler on SVG element
  const maliciousHandler = `<svg onload="alert('xss')" onclick="alert(2)"><rect width="100" height="100"/></svg>`
  const cleanHandler = sanitizeSvgOutput(maliciousHandler)
  assert.equal(cleanHandler.includes('onload'), false)
  assert.equal(cleanHandler.includes('onclick'), false)
  assert.equal(cleanHandler.includes('<rect'), true)

  // Attempt 3: javascript: pseudo-protocol in links
  const maliciousLink = `<svg><a href="javascript:alert(1)"><text>Click</text></a></svg>`
  const cleanLink = sanitizeSvgOutput(maliciousLink)
  assert.equal(cleanLink.includes('javascript:'), false)
})

test('Mermaid: Unique ID generator creates distinct IDs for multiple diagrams', () => {
  const ids = new Set<string>()
  for (let i = 0; i < 50; i++) {
    const id = generateTestDiagramId()
    assert.match(id, /^mermaid-diagram-/)
    assert.equal(ids.has(id), false)
    ids.add(id)
  }
  assert.equal(ids.size, 50)
})

test('Mermaid: Error message formatter strips noisy parser internals', () => {
  const rawError = 'Parse error on line 4: ... Expecting SEMI, got EOF'
  const formatted = formatMermaidErrorMessage(rawError)
  assert.equal(formatted.includes('Parse error on line 4:'), false)
  assert.equal(formatted, '... Expecting SEMI, got EOF')
})
