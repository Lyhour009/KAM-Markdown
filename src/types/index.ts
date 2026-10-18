export type Theme = 'light' | 'dark'

export type Language = 'en' | 'km'

export type ActiveTab = 'editor' | 'preview' | 'split'

export type MobileTab = 'editor' | 'preview'

export interface EditorStats {
  lines: number
  characters: number
  words: number
  readingTimeMinutes: number
  cursorLine: number
  cursorCol: number
}

export interface DocumentState {
  title: string
  content: string
  lastModified: number
}
