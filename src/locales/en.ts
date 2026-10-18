export const en = {
  appName: 'KAM-Markdown',
  appTagline: 'Calm, focused Markdown editor with live preview',
  untitledDoc: 'Untitled.md',
  savedLocally: 'Saved locally',
  saving: 'Saving...',
  openFile: 'Open',
  downloadFile: 'Download .md',
  exportPng: 'Export PNG',
  exportingPng: 'Exporting PNG...',
  exportPngSuccess: 'Preview exported as PNG successfully!',
  exportPngFailed: 'Failed to export preview as PNG',
  copyMarkdown: 'Copy',
  copied: 'Copied to clipboard!',
  copyFailed: 'Failed to copy',
  reset: 'Reset',
  theme: 'Theme',
  lightTheme: 'Light mode',
  darkTheme: 'Dark mode',
  language: 'Language',
  syncScroll: 'Sync scroll',
  syncScrollEnabled: 'Sync scrolling enabled',
  syncScrollDisabled: 'Sync scrolling disabled',
  more: 'More',
  moreOptions: 'More options',
  shortcutsHelp: 'Keyboard shortcuts',
  shortcutsDesc: 'Useful keyboard commands for quick editing',
  emptyPreviewHint: 'Start writing Markdown to see the preview.',
  close: 'Close',
  
  // Tabs & View Modes
  editorTab: 'Editor',
  previewTab: 'Preview',
  splitTab: 'Split view',
  editorOnly: 'Editor only',
  previewOnly: 'Preview only',
  splitView: 'Split view',

  // Focus Mode & Resizing
  focusMode: 'Focus Mode',
  exitFocusMode: 'Exit Focus Mode (Esc)',
  resetLayout: 'Reset layout (50/50)',
  layoutResetToast: 'Layout reset to 50/50',
  resizeDivider: 'Drag to resize panels (Double-click to reset 50/50)',

  // Formatting Toolbar
  bold: 'Bold (Ctrl+B)',
  italic: 'Italic (Ctrl+I)',
  heading: 'Heading',
  heading1: 'Heading 1',
  heading2: 'Heading 2',
  heading3: 'Heading 3',
  link: 'Insert link',
  quote: 'Blockquote',
  codeInline: 'Inline code',
  codeBlock: 'Code block',
  bulletList: 'Bullet list',
  numberedList: 'Numbered list',
  taskList: 'Task list',
  table: 'Insert table',
  strikethrough: 'Strikethrough',
  horizontalRule: 'Horizontal rule',

  // Status Bar
  ln: 'Ln',
  col: 'Col',
  words: 'words',
  chars: 'chars',
  minRead: 'min read',
  markdownHint: 'Markdown • Autosaved locally',

  // Reset Modal
  resetTitle: 'Reset Document?',
  resetDescription: 'This will discard your current draft and restore the bilingual starter document. Make sure to download a copy if you want to keep your work.',
  resetConfirm: 'Reset Document',
  cancel: 'Cancel',

  // Drag and Drop
  dropZoneText: 'Drop your .md file here to open',

  // Security & Privacy
  fileTooLarge: 'File exceeds the 500 KB limit. Please choose a smaller Markdown file.',
  fileReadFailed: 'Could not read the file. Please check file permissions.',
  clearDraft: 'Clear Draft',
  clearDraftTitle: 'Clear Local Draft?',
  clearDraftDescription: 'This will completely empty your working draft and remove it from local storage. This action cannot be undone.',
  clearDraftConfirm: 'Clear Draft',
  privacyTitle: 'Local Privacy & Security',
  securityNotice: 'Markdown is sanitized client-side. Scripts and unsafe protocols are strictly blocked. No data ever leaves your device.',
  privacyNote: 'Your draft is stored safely in this browser’s local storage. Download the Markdown file to keep an offline backup.',

  // Mermaid Diagrams
  mermaidError: 'Diagram Syntax Error',
  mermaidErrorHint: 'Could not render diagram. Please verify your Mermaid syntax.',
  showSource: 'Show Source',
  hideSource: 'Hide Source',
  copySource: 'Copy Source',
  renderingDiagram: 'Rendering diagram...',
}

export type TranslationKey = keyof typeof en
