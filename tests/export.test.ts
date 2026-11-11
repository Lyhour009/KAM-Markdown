import test from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import {
  downloadMarkdownFile,
  copyToClipboard,
  exportElementAsWord,
  paginateElementBlocks,
  printElementAsPdf,
} from '../src/utils/exportUtils.ts'

const dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>', {
  pretendToBeVisual: true,
})
Object.defineProperty(globalThis, 'window', { value: dom.window, writable: true, configurable: true })
Object.defineProperty(globalThis, 'document', { value: dom.window.document, writable: true, configurable: true })
Object.defineProperty(globalThis, 'HTMLElement', { value: dom.window.HTMLElement, writable: true, configurable: true })
Object.defineProperty(globalThis, 'HTMLTableElement', { value: dom.window.HTMLTableElement, writable: true, configurable: true })
Object.defineProperty(globalThis, 'HTMLInputElement', { value: dom.window.HTMLInputElement, writable: true, configurable: true })
Object.defineProperty(globalThis, 'Blob', { value: dom.window.Blob, writable: true, configurable: true })

test('Export Utils: downloadMarkdownFile triggers download with .md extension', () => {
  let createdDownload = ''
  let createdHref = ''
  let clicked = false

  const originalCreateElement = dom.window.document.createElement.bind(dom.window.document)
  dom.window.document.createElement = function (tagName: string) {
    const el = originalCreateElement(tagName)
    if (tagName.toLowerCase() === 'a') {
      el.click = () => {
        clicked = true
        createdDownload = el.download
        createdHref = el.href
      }
    }
    return el
  } as any

  globalThis.URL.createObjectURL = () => 'blob:mock-url'
  globalThis.URL.revokeObjectURL = () => {}

  downloadMarkdownFile('sample', '# Hello World')
  assert.equal(createdDownload, 'sample.md', 'Should append .md extension if missing')
  assert.equal(clicked, true, 'Link click should be triggered')
  assert.equal(createdHref, 'blob:mock-url', 'Blob URL should be created')

  downloadMarkdownFile('notes.md', '# Existing md')
  assert.equal(createdDownload, 'notes.md', 'Should preserve existing .md extension')

  dom.window.document.createElement = originalCreateElement as any
})

test('Export Utils: exportElementAsWord generates valid Word document from Markdown Preview DOM', async () => {
  const container = dom.window.document.createElement('div')
  container.innerHTML = `
    <div class="break-words">
      <h1>ចំណងជើងធំ (Heading 1)</h1>
      <h2>ចំណងជើងរង (Heading 2)</h2>
      <p>This is a paragraph with <strong>bold text</strong>, <em>italic text</em>, and <code>const x = 10;</code>.</p>
      <blockquote>
        "ចេះមកពីរៀន មានមកពីរក" — ការអាននិងការសរសេរ គឺជាស្ពានឆ្ពោះទៅរកចំណេះដឹង។
      </blockquote>
      <ul>
        <li>First task item</li>
        <li>Second task item</li>
      </ul>
      <ol>
        <li>Step one</li>
        <li>Step two</li>
      </ol>
      <table>
        <thead>
          <tr><th>ភាសា (Language)</th><th>ស្ថានភាព (Status)</th></tr>
        </thead>
        <tbody>
          <tr><td>ភាសាខ្មែរ</td><td>🟢 Active</td></tr>
          <tr><td>English</td><td>🟢 Active</td></tr>
        </tbody>
      </table>
      <pre><code>interface Note { title: string; }</code></pre>
      <hr />
    </div>
  `

  let clicked = false
  let downloadedFile = ''
  const originalCreateElement = dom.window.document.createElement.bind(dom.window.document)
  dom.window.document.createElement = function (tagName: string) {
    const el = originalCreateElement(tagName)
    if (tagName.toLowerCase() === 'a') {
      el.click = () => {
        clicked = true
        downloadedFile = el.download
      }
    }
    return el
  } as any

  const success = await exportElementAsWord(container, 'project_defense.md')
  assert.equal(success, true, 'exportElementAsWord should succeed')
  assert.equal(downloadedFile, 'project_defense.docx', 'Filename should end with .docx')
  assert.equal(clicked, true, 'Download link should have been clicked')

  dom.window.document.createElement = originalCreateElement as any
})

test('Export Utils: copyToClipboard falls back gracefully in test environment', async () => {
  const result = await copyToClipboard('test copy')
  assert.equal(typeof result, 'boolean', 'copyToClipboard returns boolean')
})

test('Export Utils: paginateElementBlocks cleanly groups blocks and protects heading orphans', () => {
  const container = dom.window.document.createElement('div')
  container.innerHTML = `
    <div>
      <h1>Introduction</h1>
      <p>Paragraph 1 with text content</p>
      <p>Paragraph 2 with text content</p>
      <h2>Architecture</h2>
      <div class="mermaid"><svg height="200"></svg></div>
      <p>Paragraph 3</p>
      <h3>Details</h3>
      <pre><code>console.log('test')</code></pre>
      <table><tbody><tr><td>Row 1</td></tr></tbody></table>
      <h4>Summary</h4>
      <p>Final remarks</p>
    </div>
  `

  const pages = paginateElementBlocks(container, 350)
  assert.ok(pages.length >= 2, 'Should divide tall multi-section document into multiple pages')
  
  // Verify heading orphan rule: heading is not isolated at the end of a page
  for (const page of pages) {
    if (page.length > 1) {
      const lastEl = page[page.length - 1]
      const lastTag = lastEl.tagName.toLowerCase()
      // If the last element is a heading, it would be an orphan without content
      assert.notEqual(/^h[1-6]$/.test(lastTag), true, 'A heading should not be isolated at the very bottom of a page')
    }
  }
})

test('Export Utils: printElementAsPdf injects print styles and iframe cleanly', async () => {
  const container = dom.window.document.createElement('div')
  container.innerHTML = '<h1>Title</h1><p>Body text</p>'

  let printed = false
  const originalCreateElement = dom.window.document.createElement.bind(dom.window.document)
  dom.window.document.createElement = function (tagName: string) {
    const el = originalCreateElement(tagName)
    if (tagName.toLowerCase() === 'iframe') {
      const fakeWindow = {
        focus: () => {},
        print: () => { printed = true },
        document: {
          open: () => {},
          write: () => {},
          close: () => {},
          fonts: { ready: Promise.resolve() },
        },
      }
      Object.defineProperty(el, 'contentWindow', { value: fakeWindow, configurable: true })
    }
    return el
  } as any

  const result = printElementAsPdf(container, 'sample_doc')
  assert.equal(result, true, 'printElementAsPdf should return true')

  await new Promise((resolve) => setTimeout(resolve, 20))
  assert.equal(printed, true, 'Print function should have been invoked')

  dom.window.document.createElement = originalCreateElement as any
})
