import test from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import rehypeHighlight from 'rehype-highlight'

function extractRawText(node: any): string {
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(extractRawText).join('')
  if (node && typeof node === 'object' && node.props && node.props.children) {
    return extractRawText(node.props.children)
  }
  return ''
}

const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code || []), 'className'],
    span: [...(defaultSchema.attributes?.span || []), 'className'],
    input: ['type', 'checked', 'disabled'],
  },
}

test('Pipeline: extractRawText extracts exact mermaid code through full rehype pipeline', async () => {
  const originalCode = `flowchart LR
    A["🧑 ភ្ញៀវ (Guest)"] --> B["កក់បន្ទប់ (Book)"]
    B --> C{ជម្រើស?}
    C -->|Yes| D[ជោគជ័យ]
    C -->|No| E[បរាជ័យ]`

  const markdownInput = "```mermaid\n" + originalCode + "\n```"

  let capturedCode = ''
  let capturedLang = ''

  const element = React.createElement(Markdown, {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      [rehypeSanitize, sanitizeSchema],
      rehypeHighlight,
    ],
    components: {
      pre: ({ children }: any) => React.createElement(React.Fragment, null, children),
      code: ({ className, children }: any) => {
        const match = /language-(\w+)/.exec(className || '')
        capturedLang = match ? match[1].toLowerCase() : ''
        capturedCode = extractRawText(children).trim()
        return React.createElement('div', null, capturedCode)
      },
    },
  }, markdownInput)

  // Render to static markup
  const { renderToStaticMarkup } = await import('react-dom/server')
  const html = renderToStaticMarkup(element)

  assert.equal(capturedLang, 'mermaid', 'Language should be detected as mermaid')
  assert.equal(capturedCode, originalCode.trim(), 'Extracted code must exactly match original code')
  assert.ok(html.includes('🧑 ភ្ញៀវ (Guest)'), 'Rendered HTML contains Khmer and emoji')
})

test('Pipeline: non-mermaid code blocks (typescript, bash, json) render as code, not diagram', async () => {
  const tsCode = `const x: number = 42;\nconsole.log(x);`
  const markdownInput = "```typescript\n" + tsCode + "\n```"

  let isMermaidRoute = false
  const element = React.createElement(Markdown, {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      [rehypeSanitize, sanitizeSchema],
      rehypeHighlight,
    ],
    components: {
      pre: ({ children }: any) => React.createElement(React.Fragment, null, children),
      code: ({ className, children }: any) => {
        const match = /language-(\w+)/.exec(className || '')
        const lang = match ? match[1].toLowerCase() : ''
        if (lang === 'mermaid') {
          isMermaidRoute = true
        }
        return React.createElement('pre', null, React.createElement('code', { className }, children))
      },
    },
  }, markdownInput)

  const { renderToStaticMarkup } = await import('react-dom/server')
  const html = renderToStaticMarkup(element)

  assert.equal(isMermaidRoute, false, 'TypeScript block should not be routed to Mermaid')
  assert.ok(html.includes('const') && html.includes('42'), 'Code block contains TypeScript code tokens')
})

