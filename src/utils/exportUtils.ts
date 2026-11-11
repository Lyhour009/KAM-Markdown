import { toPng, toJpeg } from 'html-to-image'
import { jsPDF } from 'jspdf'
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  BorderStyle,
  WidthType,
  ShadingType,
  ImageRun,
  AlignmentType,
} from 'docx'

/**
 * Triggers a browser download of the given markdown content.
 */
export function downloadMarkdownFile(filename: string, content: string): void {
  const safeFilename = filename.endsWith('.md') ? filename : `${filename}.md`
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = safeFilename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Copies text to the system clipboard with modern and fallback methods.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (err) {
      console.warn('Clipboard API failed, using fallback:', err)
    }
  }

  // Fallback for non-secure contexts or older browsers
  try {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    let successful = false
    if (typeof document.execCommand === 'function') {
      successful = document.execCommand('copy')
    }
    document.body.removeChild(textArea)
    return successful
  } catch (err) {
    console.error('Failed to copy text fallback:', err)
    return false
  }
}

/**
 * Exports a DOM element as a high-resolution PNG image and initiates download.
 */
export async function exportElementAsPng(
  element: HTMLElement,
  filename: string,
  customOptions?: Record<string, any>
): Promise<boolean> {
  const baseName = filename.replace(/\.(md|markdown|txt|png)$/i, '')
  const safeFilename = `${baseName || 'preview'}.png`

  const isDark = document.documentElement.classList.contains('dark')
  const bgColor = isDark ? '#1B1A18' : '#FFFFFF'

  const options = {
    quality: 0.95,
    pixelRatio: 2, // 2x crisp retina resolution
    backgroundColor: bgColor,
    cacheBust: true,
    ...customOptions,
  }

  try {
    let dataUrl: string
    try {
      dataUrl = await toPng(element, options)
    } catch (fontErr) {
      console.warn('html-to-image with fonts failed, retrying with skipFonts: true', fontErr)
      dataUrl = await toPng(element, { ...options, skipFonts: true })
    }

    const link = document.createElement('a')
    link.href = dataUrl
    link.download = safeFilename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    return true
  } catch (err) {
    console.error('Failed to export element as PNG:', err)
    return false
  }
}

/**
 * Estimates or measures an element's block height for pagination.
 */
function getElementBlockHeight(el: HTMLElement): number {
  if (el.offsetHeight > 0) {
    return el.offsetHeight
  }
  const rect = el.getBoundingClientRect?.()
  if (rect && rect.height > 0) {
    return rect.height
  }
  const tag = el.tagName.toLowerCase()
  if (/^h[1-6]$/.test(tag)) return 48
  if (tag === 'p') {
    const textLen = el.textContent?.length || 0
    return Math.max(32, Math.ceil(textLen / 70) * 24)
  }
  if (tag === 'blockquote') return 64
  if (tag === 'pre') {
    const lineCount = el.textContent?.split('\n').length || 1
    return Math.max(50, lineCount * 21 + 28)
  }
  if (tag === 'table') {
    const rowCount = el.querySelectorAll('tr').length || 2
    return Math.max(70, rowCount * 36)
  }
  if (tag === 'ul' || tag === 'ol') {
    const itemCount = el.querySelectorAll('li').length || 1
    return Math.max(36, itemCount * 24)
  }
  if (tag === 'hr') return 24
  if (el.querySelector('svg')) return 260
  return 40
}

/**
 * Intelligent pagination engine: separates Markdown preview elements into clean
 * A4 page blocks without splitting headings away from their paragraphs or slicing
 * diagrams, tables, and code blocks in half.
 */
export function paginateElementBlocks(
  rootElement: HTMLElement,
  targetPageHeight: number = 1000
): HTMLElement[][] {
  let contentContainer: HTMLElement = rootElement

  // Drill down to the actual Markdown top-level children if nested in wrapper divs
  while (
    contentContainer.children.length === 1 &&
    contentContainer.firstElementChild instanceof HTMLElement &&
    contentContainer.firstElementChild.tagName.toLowerCase() === 'div'
  ) {
    contentContainer = contentContainer.firstElementChild
  }

  const rawChildren = Array.from(contentContainer.children) as HTMLElement[]
  if (rawChildren.length === 0) {
    return [[rootElement]]
  }

  // Filter out UI interactive buttons, invisible anchors, dialogs
  const children = rawChildren.filter((el) => {
    const tag = el.tagName.toLowerCase()
    return (
      tag !== 'button' &&
      tag !== 'script' &&
      tag !== 'style' &&
      !el.hasAttribute('aria-hidden') &&
      !el.classList.contains('hidden')
    )
  })

  if (children.length === 0) {
    return [[rootElement]]
  }

  const pages: HTMLElement[][] = []
  let currentPage: HTMLElement[] = []
  let currentHeight = 0

  for (let i = 0; i < children.length; i++) {
    const el = children[i]
    const blockHeight = getElementBlockHeight(el) + 16 // includes margin spacing
    const tag = el.tagName.toLowerCase()
    const isHeading = /^h[1-6]$/.test(tag)

    // Heading orphan prevention: if adding this heading would leave it alone
    // at the bottom of the page without its immediate follower, start a new page!
    let nextSiblingHeight = 0
    if (isHeading && i + 1 < children.length) {
      nextSiblingHeight = getElementBlockHeight(children[i + 1]) + 16
    }

    const wouldOrphanHeading = isHeading && (currentHeight + blockHeight + nextSiblingHeight > targetPageHeight)
    const wouldExceedPage = currentHeight + blockHeight > targetPageHeight

    if (currentPage.length > 0 && (wouldExceedPage || wouldOrphanHeading)) {
      pages.push(currentPage)
      currentPage = [el]
      currentHeight = blockHeight
    } else {
      currentPage.push(el)
      currentHeight += blockHeight
    }
  }

  if (currentPage.length > 0) {
    pages.push(currentPage)
  }

  return pages
}

/**
 * Exports a DOM element as a high-quality multi-page A4 PDF matching the design of the Markdown Preview.
 * Uses smart element-boundary pagination to eliminate split lines of text, sliced diagrams,
 * and massive uncompressed file sizes.
 */
export async function exportElementAsPdf(
  element: HTMLElement,
  filename: string
): Promise<boolean> {
  const baseName = filename.replace(/\.(md|markdown|txt|pdf)$/i, '')
  const safeFilename = `${baseName || 'document'}.pdf`

  try {
    // Standard A4 Dimensions in mm and target pixel equivalents
    // A4 Portrait: 210mm x 297mm
    // Margins: 14mm horizontal, 16mm vertical
    // Printable width: 182mm, Printable height: 265mm
    const pageWidthMm = 210
    const pageHeightMm = 297
    const marginXMm = 14
    const marginYMm = 16
    const printWidthMm = pageWidthMm - marginXMm * 2 // 182mm
    const printHeightMm = pageHeightMm - marginYMm * 2 // 265mm

    // Target content width at standard 96 DPI: 182mm * 3.7795 = ~688px
    const contentWidthPx = 688
    // Target content height at standard 96 DPI: 265mm * 3.7795 = ~1000px
    const targetPageHeightPx = 1000

    // 1. Paginate elements into discrete pages cleanly
    const blockPages = paginateElementBlocks(element, targetPageHeightPx)

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    })

    for (let pIdx = 0; pIdx < blockPages.length; pIdx++) {
      const pageBlocks = blockPages[pIdx]

      // Create an isolated, light-themed page wrapper for rendering
      const pageWrapper = document.createElement('div')
      pageWrapper.style.position = 'fixed'
      pageWrapper.style.left = '-99999px'
      pageWrapper.style.top = '0'
      pageWrapper.style.width = `${contentWidthPx}px`
      pageWrapper.style.backgroundColor = '#FFFFFF'
      pageWrapper.style.color = '#18181B'
      pageWrapper.style.fontFamily = "'Kantumruy Pro', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
      pageWrapper.style.fontSize = '14px'
      pageWrapper.style.lineHeight = '1.7'
      pageWrapper.style.padding = '0'
      pageWrapper.style.margin = '0'
      pageWrapper.style.boxSizing = 'border-box'
      pageWrapper.style.overflow = 'hidden'

      // Force high-contrast Light Paper design tokens on pageWrapper
      pageWrapper.style.setProperty('--text-primary', '#18181B')
      pageWrapper.style.setProperty('--text-secondary', '#52525B')
      pageWrapper.style.setProperty('--text-muted', '#71717A')
      pageWrapper.style.setProperty('--border', '#E4E2DB')
      pageWrapper.style.setProperty('--border-subtle', '#ECEAE3')
      pageWrapper.style.setProperty('--surface', '#FFFFFF')
      pageWrapper.style.setProperty('--surface-secondary', '#F6F5F1')
      pageWrapper.style.setProperty('--surface-hover', '#EBE9E1')
      pageWrapper.style.setProperty('--accent', '#5B4BC4')
      pageWrapper.style.setProperty('--preview-bg', '#FFFFFF')

      // Clone and sanitize blocks for this page
      for (const block of pageBlocks) {
        const clonedBlock = block.cloneNode(true) as HTMLElement
        clonedBlock.querySelectorAll('button').forEach((b) => b.remove())
        clonedBlock.querySelectorAll('[role="dialog"]').forEach((d) => d.remove())
        clonedBlock.querySelectorAll('[aria-hidden="true"]').forEach((h) => {
          if (h.tagName.toLowerCase() === 'svg' && h.parentElement?.tagName.toLowerCase() === 'button') {
            h.remove()
          }
        })
        pageWrapper.appendChild(clonedBlock)
      }

      document.body.appendChild(pageWrapper)

      let pageDataUrl = ''
      const renderOptions = {
        quality: 0.88,
        pixelRatio: 2,
        backgroundColor: '#FFFFFF',
        cacheBust: true,
      }

      try {
        pageDataUrl = await toJpeg(pageWrapper, renderOptions)
      } catch (fontErr) {
        console.warn('toJpeg with fonts failed for page, retrying with skipFonts: true', fontErr)
        try {
          pageDataUrl = await toJpeg(pageWrapper, { ...renderOptions, skipFonts: true })
        } catch {
          pageDataUrl = await toPng(pageWrapper, { ...renderOptions, skipFonts: true })
        }
      } finally {
        if (pageWrapper.parentNode) {
          document.body.removeChild(pageWrapper)
        }
      }

      if (pIdx > 0) {
        pdf.addPage()
      }

      const imgProps = pdf.getImageProperties(pageDataUrl)
      const renderedHeightMm = Math.min(
        (imgProps.height * printWidthMm) / imgProps.width,
        printHeightMm
      )

      // Draw page image with crisp A4 margins
      pdf.addImage(
        pageDataUrl,
        'JPEG',
        marginXMm,
        marginYMm,
        printWidthMm,
        renderedHeightMm,
        undefined,
        'FAST'
      )

      // Header on pages 2+
      if (pIdx > 0 && baseName) {
        pdf.setFontSize(8)
        pdf.setTextColor(150, 150, 150)
        pdf.text(baseName, marginXMm, marginYMm - 6)
        pdf.setDrawColor(228, 226, 219)
        pdf.setLineWidth(0.2)
        pdf.line(marginXMm, marginYMm - 4, pageWidthMm - marginXMm, marginYMm - 4)
      }

      // Footer with page numbering on all pages
      pdf.setFontSize(8.5)
      pdf.setTextColor(140, 140, 140)
      pdf.text(
        `Page ${pIdx + 1} of ${blockPages.length}`,
        pageWidthMm - marginXMm,
        pageHeightMm - 8,
        { align: 'right' }
      )
      pdf.text('KAM-Markdown', marginXMm, pageHeightMm - 8, { align: 'left' })
      pdf.setDrawColor(228, 226, 219)
      pdf.setLineWidth(0.2)
      pdf.line(marginXMm, pageHeightMm - 11, pageWidthMm - marginXMm, pageHeightMm - 11)
    }

    pdf.save(safeFilename)
    return true
  } catch (err) {
    console.error('Failed to export element as PDF:', err)
    return false
  }
}

/**
 * Converts an SVG element to a PNG image Uint8Array for Word embedding.
 */
async function svgToPngBytes(
  svgElement: SVGElement
): Promise<{ data: Uint8Array; width: number; height: number } | null> {
  try {
    const svgString = new XMLSerializer().serializeToString(svgElement)
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    const img = new Image()
    img.src = url
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
    })

    const bbox = svgElement.getBoundingClientRect()
    const origWidth = bbox.width || 600
    const origHeight = bbox.height || 400
    const pixelRatio = 2

    const canvas = document.createElement('canvas')
    canvas.width = origWidth * pixelRatio
    canvas.height = origHeight * pixelRatio

    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.scale(pixelRatio, pixelRatio)
    ctx.drawImage(img, 0, 0, origWidth, origHeight)
    URL.revokeObjectURL(url)

    const dataUrl = canvas.toDataURL('image/png')
    const base64 = dataUrl.split(',')[1]
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }

    const maxWidth = 550
    const scale = origWidth > maxWidth ? maxWidth / origWidth : 1

    return {
      data: bytes,
      width: Math.round(origWidth * scale),
      height: Math.round(origHeight * scale),
    }
  } catch (err) {
    console.warn('Failed to convert SVG to image for Word export:', err)
    return null
  }
}

/**
 * Helper to parse inline HTML nodes into docx TextRuns.
 */
function parseInlineRuns(node: Node): TextRun[] {
  const runs: TextRun[] = []

  function walk(n: Node, styles: Record<string, any> = {}) {
    if (n.nodeType === 3) {
      // Text node
      const text = n.textContent || ''
      if (text) {
        runs.push(
          new TextRun({
            text,
            bold: styles.bold,
            italics: styles.italics,
            strike: styles.strike,
            font: styles.font || 'Kantumruy Pro',
            color: styles.color || '18181B',
            size: styles.size || 22, // 11pt
            shading: styles.shading,
          })
        )
      }
      return
    }

    if (n.nodeType === 1) {
      const el = n as HTMLElement
      const tag = el.tagName.toLowerCase()
      const newStyles = { ...styles }

      if (tag === 'strong' || tag === 'b') newStyles.bold = true
      if (tag === 'em' || tag === 'i') newStyles.italics = true
      if (tag === 'del' || tag === 's') newStyles.strike = true
      if (tag === 'code') {
        newStyles.font = 'Consolas'
        newStyles.color = '5B4BC4'
        newStyles.shading = {
          type: ShadingType.CLEAR,
          fill: 'F6F5F1',
          color: 'auto',
        }
      }
      if (tag === 'a') {
        newStyles.color = '5B4BC4'
      }
      if (tag === 'input' && (el as HTMLInputElement).type === 'checkbox') {
        const isChecked = (el as HTMLInputElement).checked
        runs.push(
          new TextRun({
            text: isChecked ? '☑ ' : '☐ ',
            font: 'Segoe UI Symbol',
            color: isChecked ? '5B4BC4' : '71717A',
            bold: true,
            size: 22,
          })
        )
        return
      }

      for (const child of Array.from(n.childNodes)) {
        walk(child, newStyles)
      }
    }
  }

  for (const child of Array.from(node.childNodes)) {
    walk(child)
  }

  return runs.length ? runs : [new TextRun({ text: node.textContent || '', font: 'Kantumruy Pro', size: 22 })]
}

/**
 * Exports the Markdown preview content as an official Microsoft Word (.docx) document
 * with the exact typography, borders, tables, blockquotes, and diagrams of the preview.
 */
export async function exportElementAsWord(
  element: HTMLElement,
  filename: string
): Promise<boolean> {
  const baseName = filename.replace(/\.(md|markdown|txt|docx|doc)$/i, '')
  const safeFilename = `${baseName || 'document'}.docx`

  try {
    // Find preview container holding markdown elements
    const contentRoot = element.querySelector('.break-words') || element
    const children = Array.from(contentRoot.children)
    const docxChildren: any[] = []

    for (const child of children) {
      const el = child as HTMLElement
      const tag = el.tagName.toLowerCase()

      if (tag === 'h1') {
        docxChildren.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            children: parseInlineRuns(el),
            border: {
              bottom: {
                color: 'E4E2DB',
                space: 6,
                style: BorderStyle.SINGLE,
                size: 12,
              },
            },
            spacing: { before: 360, after: 180 },
          })
        )
      } else if (tag === 'h2') {
        docxChildren.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: parseInlineRuns(el),
            border: {
              bottom: {
                color: 'ECEAE3',
                space: 4,
                style: BorderStyle.SINGLE,
                size: 6,
              },
            },
            spacing: { before: 280, after: 140 },
          })
        )
      } else if (tag === 'h3') {
        docxChildren.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_3,
            children: parseInlineRuns(el),
            spacing: { before: 240, after: 120 },
          })
        )
      } else if (tag === 'h4') {
        docxChildren.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_4,
            children: parseInlineRuns(el),
            spacing: { before: 200, after: 100 },
          })
        )
      } else if (tag === 'p') {
        docxChildren.push(
          new Paragraph({
            children: parseInlineRuns(el),
            spacing: { before: 120, after: 120, line: 360 },
          })
        )
      } else if (tag === 'blockquote') {
        docxChildren.push(
          new Paragraph({
            children: parseInlineRuns(el),
            border: {
              left: {
                color: '5B4BC4',
                space: 12,
                style: BorderStyle.SINGLE,
                size: 24,
              },
            },
            shading: {
              type: ShadingType.CLEAR,
              fill: 'F6F5F1',
              color: 'auto',
            },
            indent: { left: 360 },
            spacing: { before: 180, after: 180, line: 360 },
          })
        )
      } else if (tag === 'ul') {
        for (const li of Array.from(el.querySelectorAll('li'))) {
          docxChildren.push(
            new Paragraph({
              bullet: { level: 0 },
              children: parseInlineRuns(li),
              spacing: { before: 60, after: 60 },
            })
          )
        }
      } else if (tag === 'ol') {
        const lis = Array.from(el.querySelectorAll('li'))
        lis.forEach((li, idx) => {
          docxChildren.push(
            new Paragraph({
              children: [
                new TextRun({ text: `${idx + 1}. `, bold: true, color: '5B4BC4', font: 'Kantumruy Pro' }),
                ...parseInlineRuns(li),
              ],
              spacing: { before: 60, after: 60 },
            })
          )
        })
      } else if (tag === 'table' || el.querySelector('table')) {
        const tableEl = tag === 'table' ? (el as HTMLTableElement) : el.querySelector('table')!
        const rows: TableRow[] = []

        for (const tr of Array.from(tableEl.querySelectorAll('tr'))) {
          const cells: TableCell[] = []
          const ths = Array.from(tr.querySelectorAll('th'))
          const isHeader = ths.length > 0
          const cellElements = isHeader ? ths : Array.from(tr.querySelectorAll('td'))

          for (const td of cellElements) {
            cells.push(
              new TableCell({
                children: [
                  new Paragraph({
                    children: parseInlineRuns(td),
                    spacing: { before: 60, after: 60 },
                  }),
                ],
                shading: isHeader
                  ? { type: ShadingType.CLEAR, fill: 'F6F5F1', color: 'auto' }
                  : undefined,
                margins: {
                  top: 100,
                  bottom: 100,
                  left: 150,
                  right: 150,
                },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 4, color: 'E4E2DB' },
                  bottom: { style: BorderStyle.SINGLE, size: 4, color: 'E4E2DB' },
                  left: { style: BorderStyle.SINGLE, size: 4, color: 'E4E2DB' },
                  right: { style: BorderStyle.SINGLE, size: 4, color: 'E4E2DB' },
                },
              })
            )
          }
          rows.push(new TableRow({ children: cells, tableHeader: isHeader }))
        }

        if (rows.length) {
          docxChildren.push(
            new Table({
              rows,
              width: { size: 100, type: WidthType.PERCENTAGE },
            })
          )
        }
      } else if (tag === 'pre' || el.querySelector('pre')) {
        const preEl = tag === 'pre' ? el : el.querySelector('pre')!
        const codeText = preEl.textContent || ''
        const lines = codeText.split('\n')

        for (const line of lines) {
          docxChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: line || ' ',
                  font: 'Consolas',
                  size: 19, // 9.5pt
                  color: '18181B',
                }),
              ],
              shading: {
                type: ShadingType.CLEAR,
                fill: 'F6F5F1',
                color: 'auto',
              },
              spacing: { before: 20, after: 20 },
            })
          )
        }
      } else if (tag === 'hr') {
        docxChildren.push(
          new Paragraph({
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 6, color: 'E4E2DB', space: 10 },
            },
            spacing: { before: 180, after: 180 },
          })
        )
      } else {
        // Check for Mermaid SVG or other diagram graphics
        const svgEl = el.querySelector('svg')
        if (svgEl) {
          const imgResult = await svgToPngBytes(svgEl)
          if (imgResult) {
            docxChildren.push(
              new Paragraph({
                children: [
                  new ImageRun({
                    data: imgResult.data,
                    type: 'png',
                    transformation: {
                      width: imgResult.width,
                      height: imgResult.height,
                    },
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 180, after: 180 },
              })
            )
            continue
          }
        }

        // Fallback for any other paragraph/container
        if (el.textContent && el.textContent.trim().length > 0) {
          docxChildren.push(
            new Paragraph({
              children: parseInlineRuns(el),
              spacing: { before: 80, after: 80 },
            })
          )
        }
      }
    }

    const doc = new Document({
      styles: {
        default: {
          document: {
            run: {
              font: 'Kantumruy Pro',
              size: 22, // 11pt
              color: '18181B',
            },
          },
        },
      },
      sections: [
        {
          properties: {},
          children: docxChildren.length ? docxChildren : [new Paragraph({ text: '' })],
        },
      ],
    })

    const blob = await Packer.toBlob(doc)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = safeFilename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    return true
  } catch (err) {
    console.error('Failed to export element as Word document:', err)
    return false
  }
}

/**
 * Triggers high-fidelity browser Print-to-PDF with clean A4 print styles.
 */
export function printElementAsPdf(
  element: HTMLElement,
  title: string
): boolean {
  try {
    const baseName = title.replace(/\.(md|markdown|txt|pdf)$/i, '')
    const originalTitle = document.title
    document.title = baseName || 'document'

    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.right = '0'
    iframe.style.bottom = '0'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = '0'
    document.body.appendChild(iframe)

    const doc = iframe.contentWindow?.document
    if (!doc) {
      document.body.removeChild(iframe)
      return false
    }

    const clone = element.cloneNode(true) as HTMLElement
    clone.querySelectorAll('button').forEach((btn) => btn.remove())
    clone.querySelectorAll('[role="dialog"]').forEach((dlg) => dlg.remove())

    doc.open()
    doc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${baseName}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Kantumruy+Pro:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          :root {
            --text-primary: #18181B !important;
            --text-secondary: #52525B !important;
            --text-muted: #71717A !important;
            --border: #E4E2DB !important;
            --border-subtle: #ECEAE3 !important;
            --surface: #FFFFFF !important;
            --surface-secondary: #F6F5F1 !important;
            --surface-hover: #EBE9E1 !important;
            --accent: #5B4BC4 !important;
            --preview-bg: #FFFFFF !important;
          }
          @page {
            size: A4 portrait;
            margin: 16mm 14mm;
          }
          * {
            box-sizing: border-box;
          }
          body {
            font-family: 'Kantumruy Pro', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 11pt;
            line-height: 1.7;
            color: #18181B;
            background: #FFFFFF;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          h1, h2, h3, h4, h5, h6 {
            color: #18181B;
            page-break-after: avoid;
            break-after: avoid;
            font-weight: 700;
          }
          h1 {
            font-size: 20pt;
            border-bottom: 2px solid #E4E2DB;
            padding-bottom: 6px;
            margin-top: 24px;
            margin-bottom: 12px;
          }
          h2 {
            font-size: 15pt;
            border-bottom: 1px solid #ECEAE3;
            padding-bottom: 4px;
            margin-top: 20px;
            margin-bottom: 10px;
          }
          h3 { font-size: 13pt; margin-top: 16px; margin-bottom: 8px; }
          h4 { font-size: 11.5pt; margin-top: 14px; margin-bottom: 6px; }
          p { margin: 8px 0; line-height: 1.7; color: #18181B; }
          blockquote {
            margin: 14px 0;
            padding: 10px 16px;
            border-left: 4px solid #5B4BC4;
            background-color: #F6F5F1;
            border-radius: 0 8px 8px 0;
            font-style: italic;
            color: #18181B;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 16px 0;
            border: 1px solid #E4E2DB;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          tr {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          th {
            background-color: #F6F5F1;
            border: 1px solid #E4E2DB;
            padding: 8px 12px;
            font-weight: 600;
            color: #18181B;
            text-align: left;
          }
          td {
            border: 1px solid #E4E2DB;
            padding: 8px 12px;
            color: #18181B;
          }
          pre {
            background-color: #F6F5F1;
            border: 1px solid #E4E2DB;
            border-radius: 8px;
            padding: 12px;
            font-family: 'JetBrains Mono', 'Consolas', monospace;
            font-size: 9.5pt;
            line-height: 1.6;
            margin: 12px 0;
            page-break-inside: avoid;
            break-inside: avoid;
            overflow: hidden;
            white-space: pre-wrap;
            word-break: break-all;
          }
          code {
            font-family: 'JetBrains Mono', 'Consolas', monospace;
            font-size: 9pt;
            background-color: #F6F5F1;
            color: #5B4BC4;
            padding: 2px 5px;
            border-radius: 4px;
            border: 1px solid #E4E2DB;
          }
          ul, ol {
            margin: 10px 0;
            padding-left: 24px;
          }
          li { margin: 4px 0; line-height: 1.7; }
          hr {
            border: 0;
            border-top: 1px solid #E4E2DB;
            margin: 20px 0;
          }
          svg {
            max-width: 100% !important;
            height: auto !important;
            page-break-inside: avoid;
            break-inside: avoid;
          }
        </style>
      </head>
      <body>
        ${clone.innerHTML}
      </body>
      </html>
    `)
    doc.close()

    const triggerPrint = () => {
      try {
        iframe.contentWindow?.focus()
        iframe.contentWindow?.print()
      } catch (printErr) {
        console.warn('iframe print invocation failed:', printErr)
      } finally {
        setTimeout(() => {
          if (iframe.parentNode) {
            document.body.removeChild(iframe)
          }
          document.title = originalTitle
        }, 1500)
      }
    }

    if (iframe.contentWindow?.document?.fonts?.ready) {
      iframe.contentWindow.document.fonts.ready.then(triggerPrint).catch(triggerPrint)
    } else {
      setTimeout(triggerPrint, 500)
    }

    return true
  } catch (err) {
    console.error('Failed to trigger print PDF:', err)
    return false
  }
}
