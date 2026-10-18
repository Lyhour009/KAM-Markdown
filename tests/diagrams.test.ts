import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

test('Mermaid: verify project defense diagrams syntax in Untitled (1).md', () => {
  const filePath = 'c:\\Users\\ASUS\\Downloads\\Untitled (1).md'
  if (!fs.existsSync(filePath)) {
    console.warn(`File ${filePath} does not exist, skipping.`)
    return
  }

  const content = fs.readFileSync(filePath, 'utf-8')
  const regex = /```mermaid\r?\n([\s\S]*?)```/g
  const diagrams: string[] = []
  let match
  while ((match = regex.exec(content)) !== null) {
    diagrams.push(match[1].trim())
  }

  assert.equal(diagrams.length, 3, 'Expected 3 Mermaid diagrams in Untitled (1).md')

  // Diagram 1: Use Case Diagram
  assert.ok(diagrams[0].startsWith('flowchart LR'), 'Diagram 1 should be flowchart LR')
  assert.ok(diagrams[0].includes('Guest'), 'Diagram 1 should include Guest actor')
  assert.ok(diagrams[0].includes('Receptionist'), 'Diagram 1 should include Receptionist actor')
  assert.ok(diagrams[0].includes('Housekeeper'), 'Diagram 1 should include Housekeeper actor')
  assert.ok(diagrams[0].includes('Admin'), 'Diagram 1 should include Admin actor')
  assert.ok(diagrams[0].includes('SystemBoundary'), 'Diagram 1 should include SystemBoundary')

  // Diagram 2: ERD
  assert.ok(diagrams[1].startsWith('erDiagram'), 'Diagram 2 should be erDiagram')
  assert.ok(diagrams[1].includes('USERS'), 'Diagram 2 should include USERS entity')
  assert.ok(diagrams[1].includes('ROOMS'), 'Diagram 2 should include ROOMS entity')
  assert.ok(diagrams[1].includes('RESERVATIONS'), 'Diagram 2 should include RESERVATIONS entity')
  assert.ok(diagrams[1].includes('INVOICES'), 'Diagram 2 should include INVOICES entity')
  assert.ok(diagrams[1].includes('PAYMENTS'), 'Diagram 2 should include PAYMENTS entity')

  // Diagram 3: System Architecture
  assert.ok(diagrams[2].startsWith('flowchart TD'), 'Diagram 3 should be flowchart TD')
  assert.ok(diagrams[2].includes('Client'), 'Diagram 3 should include Client')
  assert.ok(diagrams[2].includes('ReactUI'), 'Diagram 3 should include ReactUI')
  assert.ok(diagrams[2].includes('Inertia'), 'Diagram 3 should include Inertia')
  assert.ok(diagrams[2].includes('LaravelCore'), 'Diagram 3 should include LaravelCore')
  assert.ok(diagrams[2].includes('Eloquent'), 'Diagram 3 should include Eloquent')
  assert.ok(diagrams[2].includes('Database'), 'Diagram 3 should include Database')
})

test('Mermaid: render all 3 diagrams with Mermaid library', async () => {
  const filePath = 'c:\\Users\\ASUS\\Downloads\\Untitled (1).md'
  if (!fs.existsSync(filePath)) return

  const { JSDOM } = await import('jsdom')
  const dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>', {
    pretendToBeVisual: true,
  })
  Object.defineProperty(globalThis, 'window', { value: dom.window, writable: true, configurable: true })
  Object.defineProperty(globalThis, 'document', { value: dom.window.document, writable: true, configurable: true })
  Object.defineProperty(globalThis, 'Element', { value: dom.window.Element, writable: true, configurable: true })
  Object.defineProperty(globalThis, 'SVGElement', { value: dom.window.SVGElement, writable: true, configurable: true })
  Object.defineProperty(globalThis, 'CSSStyleSheet', { value: dom.window.CSSStyleSheet, writable: true, configurable: true })
  Object.defineProperty(globalThis, 'XMLSerializer', { value: dom.window.XMLSerializer, writable: true, configurable: true })



  const mermaid = (await import('mermaid')).default
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    theme: 'neutral',
    flowchart: { htmlLabels: false },
  })

  const content = fs.readFileSync(filePath, 'utf-8')
  const regex = /```mermaid\r?\n([\s\S]*?)```/g
  let match
  let index = 0
  while ((match = regex.exec(content)) !== null) {
    index++
    const code = match[1].trim()
    const valid = await mermaid.parse(code)
    assert.ok(valid, `Diagram ${index} syntax must be valid for Mermaid`)
  }
})

