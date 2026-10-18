import { toPng } from 'html-to-image'

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
    const successful = document.execCommand('copy')
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
  const baseName = filename.replace(/\.(md|markdown|txt)$/i, '')
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
