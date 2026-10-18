/**
 * Security utilities for KAM-Markdown.
 * Enforces URL sanitization, file-size limits, and local draft isolation.
 */

export const MAX_FILE_SIZE_BYTES = 500 * 1024 // 500 KB limit as mandated by MVP spec

const DANGEROUS_PROTOCOLS = [
  'javascript:',
  'vbscript:',
  'data:',
  'file:',
]

/**
 * Validates URLs to prevent script injection (XSS via javascript: or data: URIs).
 * Only allows https:, http:, mailto:, or safe relative paths / anchors.
 */
export function isSafeUrl(url?: string): boolean {
  if (!url) return false
  const trimmed = url.trim().toLowerCase()

  // Reject dangerous protocols
  for (const protocol of DANGEROUS_PROTOCOLS) {
    if (trimmed.startsWith(protocol)) {
      return false
    }
  }

  // Allow relative URLs, fragments, and anchors
  if (trimmed.startsWith('/') || trimmed.startsWith('#') || trimmed.startsWith('./') || trimmed.startsWith('../')) {
    return true
  }

  // Only allow standard http, https, and mailto schemes
  try {
    const parsed = new URL(url, 'https://example.com')
    return ['http:', 'https:', 'mailto:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

export interface FileValidationResult {
  isValid: boolean
  error?: string
  errorKey?: 'fileTooLarge' | 'fileReadFailed'
}

/**
 * Checks file size and returns validation status.
 */
export function validateMarkdownFile(file: File): FileValidationResult {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      errorKey: 'fileTooLarge',
      error: `File size (${(file.size / 1024).toFixed(1)} KB) exceeds the maximum limit of 500 KB.`,
    }
  }

  return { isValid: true }
}

/**
 * Safely removes draft content and title from localStorage.
 */
export function clearLocalDraft(): void {
  try {
    localStorage.removeItem('kam_markdown_content')
    localStorage.removeItem('kam_markdown_title')
    localStorage.removeItem('markflow_content')
    localStorage.removeItem('markflow_title')
  } catch (err) {
    console.warn('Failed to clear local storage draft:', err)
  }
}
