import type { EditorStats } from '../types'

/**
 * Calculates line count, word count, character count, and estimated reading time.
 * Uses Intl.Segmenter for accurate Khmer & multilingual word counting when supported.
 */
export function calculateEditorStats(content: string, cursorLine = 1, cursorCol = 1): EditorStats {
  const characters = content.length
  const lines = content.length === 0 ? 0 : content.split('\n').length

  let words = 0
  if (content.trim().length > 0) {
    if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
      try {
        const segmenter = new (Intl as any).Segmenter(['km', 'en'], { granularity: 'word' })
        const segments = segmenter.segment(content)
        for (const segment of segments) {
          if (segment.isWordLike) {
            words++
          }
        }
      } catch {
        words = fallbackWordCount(content)
      }
    } else {
      words = fallbackWordCount(content)
    }
  }

  // Reading time: ~200 words per minute average
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 200))

  return {
    lines,
    characters,
    words,
    readingTimeMinutes,
    cursorLine,
    cursorCol,
  }
}

function fallbackWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export interface TextTransformResult {
  newText: string
  newSelectionStart: number
  newSelectionEnd: number
}

/**
 * Wraps or inserts markdown formatting around selected text.
 */
export function applyFormat(
  text: string,
  start: number,
  end: number,
  type: 'bold' | 'italic' | 'strikethrough' | 'code' | 'codeblock' | 'quote' | 'bullet' | 'number' | 'task' | 'h1' | 'h2' | 'h3' | 'link' | 'table' | 'hr'
): TextTransformResult {
  const selected = text.slice(start, end)
  let before = text.slice(0, start)
  let after = text.slice(end)

  switch (type) {
    case 'bold': {
      const wrapped = `**${selected || 'bold text'}**`
      return {
        newText: before + wrapped + after,
        newSelectionStart: selected ? start : start + 2,
        newSelectionEnd: selected ? start + wrapped.length : start + wrapped.length - 2,
      }
    }
    case 'italic': {
      const wrapped = `*${selected || 'italic text'}*`
      return {
        newText: before + wrapped + after,
        newSelectionStart: selected ? start : start + 1,
        newSelectionEnd: selected ? start + wrapped.length : start + wrapped.length - 1,
      }
    }
    case 'strikethrough': {
      const wrapped = `~~${selected || 'strikethrough text'}~~`
      return {
        newText: before + wrapped + after,
        newSelectionStart: selected ? start : start + 2,
        newSelectionEnd: selected ? start + wrapped.length : start + wrapped.length - 2,
      }
    }
    case 'code': {
      const wrapped = `\`${selected || 'code'}\``
      return {
        newText: before + wrapped + after,
        newSelectionStart: selected ? start : start + 1,
        newSelectionEnd: selected ? start + wrapped.length : start + wrapped.length - 1,
      }
    }
    case 'codeblock': {
      const insert = `\n\`\`\`javascript\n${selected || '// code here'}\n\`\`\`\n`
      return {
        newText: before + insert + after,
        newSelectionStart: start + insert.length,
        newSelectionEnd: start + insert.length,
      }
    }
    case 'link': {
      const label = selected || 'link text'
      const insert = `[${label}](https://example.com)`
      return {
        newText: before + insert + after,
        newSelectionStart: start + label.length + 3,
        newSelectionEnd: start + insert.length - 1,
      }
    }
    case 'quote': {
      const lines = (selected || 'Quote text').split('\n')
      const formatted = lines.map(line => `> ${line}`).join('\n')
      return {
        newText: before + formatted + after,
        newSelectionStart: start + formatted.length,
        newSelectionEnd: start + formatted.length,
      }
    }
    case 'bullet': {
      const lines = (selected || 'List item').split('\n')
      const formatted = lines.map(line => `- ${line}`).join('\n')
      return {
        newText: before + formatted + after,
        newSelectionStart: start + formatted.length,
        newSelectionEnd: start + formatted.length,
      }
    }
    case 'number': {
      const lines = (selected || 'List item').split('\n')
      const formatted = lines.map((line, idx) => `${idx + 1}. ${line}`).join('\n')
      return {
        newText: before + formatted + after,
        newSelectionStart: start + formatted.length,
        newSelectionEnd: start + formatted.length,
      }
    }
    case 'task': {
      const lines = (selected || 'Task item').split('\n')
      const formatted = lines.map(line => `- [ ] ${line}`).join('\n')
      return {
        newText: before + formatted + after,
        newSelectionStart: start + formatted.length,
        newSelectionEnd: start + formatted.length,
      }
    }
    case 'h1': {
      const insert = `\n# ${selected || 'Heading 1'}\n`
      return {
        newText: before + insert + after,
        newSelectionStart: start + insert.length,
        newSelectionEnd: start + insert.length,
      }
    }
    case 'h2': {
      const insert = `\n## ${selected || 'Heading 2'}\n`
      return {
        newText: before + insert + after,
        newSelectionStart: start + insert.length,
        newSelectionEnd: start + insert.length,
      }
    }
    case 'h3': {
      const insert = `\n### ${selected || 'Heading 3'}\n`
      return {
        newText: before + insert + after,
        newSelectionStart: start + insert.length,
        newSelectionEnd: start + insert.length,
      }
    }
    case 'table': {
      const insert = `\n| Column 1 | Column 2 | Column 3 |\n| :--- | :---: | ---: |\n| Item 1 | Value A | 100 |\n| Item 2 | Value B | 200 |\n`
      return {
        newText: before + insert + after,
        newSelectionStart: start + insert.length,
        newSelectionEnd: start + insert.length,
      }
    }
    case 'hr': {
      const insert = `\n---\n`
      return {
        newText: before + insert + after,
        newSelectionStart: start + insert.length,
        newSelectionEnd: start + insert.length,
      }
    }
    default:
      return { newText: text, newSelectionStart: start, newSelectionEnd: end }
  }
}
