import { useState, useEffect, useRef, useCallback } from 'react'
import { Header } from './components/Header'
import { Toolbar } from './components/Toolbar'
import { Editor, type EditorHandle } from './components/Editor'
import { Preview, type PreviewHandle } from './components/Preview'
import { StatusBar } from './components/StatusBar'
import { ConfirmModal } from './components/ConfirmModal'
import { Toast } from './components/Toast'
import { ResizableDivider } from './components/ResizableDivider'
import { FocusModeBanner } from './components/FocusModeBanner'
import { SecurityModal } from './components/SecurityModal'
import { ShortcutsModal } from './components/ShortcutsModal'
import { useTheme } from './hooks/useTheme'
import { useLanguage } from './hooks/useLanguage'
import { STARTER_DOCUMENT_EN, STARTER_DOCUMENT_KM } from './constants/starterDocument'
import { calculateEditorStats, applyFormat } from './utils/markdownUtils'
import { downloadMarkdownFile, copyToClipboard } from './utils/exportUtils'
import { validateMarkdownFile, clearLocalDraft } from './utils/securityUtils'
import type { ActiveTab } from './types'

export function App() {
  const [theme, toggleTheme] = useTheme()
  const { language, toggleLanguage, t } = useLanguage()

  // Document Content & Title with local storage
  const [title, setTitle] = useState<string>(() => {
    try {
      return localStorage.getItem('kam_markdown_title') || localStorage.getItem('markflow_title') || (language === 'km' ? 'គ្មានចំណងជើង.md' : 'Untitled.md')
    } catch {
      return 'Untitled.md'
    }
  })

  const [content, setContent] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('kam_markdown_content') || localStorage.getItem('markflow_content')
      if (saved !== null) return saved
    } catch {
      // Fallback
    }
    return language === 'km' ? STARTER_DOCUMENT_KM : STARTER_DOCUMENT_EN
  })

  // Panel Split Ratio (default 50%, persisted in localStorage)
  const [splitRatio, setSplitRatio] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('kam_markdown_split_ratio') || localStorage.getItem('markflow_split_ratio')
      if (saved) {
        const parsed = parseFloat(saved)
        if (!isNaN(parsed) && parsed >= 20 && parsed <= 80) {
          return parsed
        }
      }
    } catch {
      // Fallback
    }
    return 50
  })

  // Focus Mode State
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false)

  // Editor and preview references
  const editorRef = useRef<EditorHandle>(null)
  const previewRef = useRef<PreviewHandle>(null)

  // Status & UI States
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [isSyncScroll, setIsSyncScroll] = useState<boolean>(true)
  const [activeTab, setActiveTab] = useState<ActiveTab>('split')
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false)
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState<boolean>(false)
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState<boolean>(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [cursorPos, setCursorPos] = useState<{ line: number; col: number }>({ line: 1, col: 1 })

  // Trigger brief toast
  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg)
    setToastType(type)
    setTimeout(() => {
      setToastMessage(null)
    }, 2800)
  }, [])

  // Update content and title handlers with immediate saving state
  const handleContentChange = useCallback((newContent: string) => {
    setIsSaving(true)
    setContent(newContent)
  }, [])

  const handleTitleChange = useCallback((newTitle: string) => {
    setIsSaving(true)
    setTitle(newTitle)
  }, [])

  // Ratio change and layout reset handlers
  const handleRatioChange = useCallback((newRatio: number) => {
    setSplitRatio(newRatio)
    try {
      localStorage.setItem('kam_markdown_split_ratio', newRatio.toFixed(1))
    } catch (err) {
      console.warn('Could not save split ratio:', err)
    }
  }, [])

  const handleResetLayout = useCallback(() => {
    setSplitRatio(50)
    try {
      localStorage.setItem('kam_markdown_split_ratio', '50')
    } catch (err) {
      console.warn('Could not reset split ratio:', err)
    }
    showToast(t('layoutResetToast'))
  }, [showToast, t])

  // Autosave to localStorage with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem('kam_markdown_content', content)
        localStorage.setItem('kam_markdown_title', title)
      } catch (err) {
        console.warn('LocalStorage save error:', err)
      } finally {
        setIsSaving(false)
      }
    }, 350)

    return () => clearTimeout(timer)
  }, [content, title])

  // Handle cursor position updates
  const handleCursorMove = useCallback((line: number, col: number) => {
    setCursorPos({ line, col })
  }, [])

  // Handle Formatting from Toolbar or Shortcuts
  const handleFormat = useCallback((type: any) => {
    if (!editorRef.current) return
    const { start, end } = editorRef.current.getSelection()
    const result = applyFormat(content, start, end, type)
    setContent(result.newText)
    setTimeout(() => {
      editorRef.current?.setSelection(result.newSelectionStart, result.newSelectionEnd)
      editorRef.current?.focus()
    }, 10)
  }, [content])

  // File loading helper with strict security validation
  const loadFile = useCallback((file: File) => {
    // 1. Enforce 500 KB limit & file integrity
    const validation = validateMarkdownFile(file)
    if (!validation.isValid) {
      const errorMsg = validation.errorKey ? t(validation.errorKey as any) : (validation.error || 'Invalid file')
      showToast(errorMsg, 'error')
      return
    }

    // 2. Read as plain text (never executable)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result
      if (typeof text === 'string') {
        handleContentChange(text)
        handleTitleChange(file.name)
        showToast(language === 'km' ? `បានបើក ${file.name}` : `Opened ${file.name}`)
      }
    }
    reader.onerror = () => {
      showToast(t('fileReadFailed'), 'error')
    }
    reader.readAsText(file)
  }, [handleContentChange, handleTitleChange, language, showToast, t])

  // Copy Markdown
  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(content)
    if (success) {
      showToast(t('copied'), 'success')
    } else {
      showToast(t('copyFailed'), 'error')
    }
  }, [content, t, showToast])

  // Download Markdown
  const handleDownload = useCallback(() => {
    downloadMarkdownFile(title, content)
    showToast(language === 'km' ? 'បានទាញយកឯកសារ!' : 'Markdown file downloaded!')
  }, [title, content, language, showToast])

  // Export Preview as PNG
  const [isExportingPng, setIsExportingPng] = useState<boolean>(false)

  const handleExportPng = useCallback(async () => {
    if (!previewRef.current) return
    setIsExportingPng(true)
    try {
      const success = await previewRef.current.exportAsPng(title)
      if (success) {
        showToast(t('exportPngSuccess'), 'success')
      } else {
        showToast(t('exportPngFailed'), 'error')
      }
    } catch (err) {
      console.error('Export PNG failed:', err)
      showToast(t('exportPngFailed'), 'error')
    } finally {
      setIsExportingPng(false)
    }
  }, [title, showToast, t])

  // Reset Document to starter
  const handleConfirmReset = useCallback(() => {
    const starter = language === 'km' ? STARTER_DOCUMENT_KM : STARTER_DOCUMENT_EN
    const defaultTitle = language === 'km' ? 'គ្មានចំណងជើង.md' : 'Untitled.md'
    setContent(starter)
    setTitle(defaultTitle)
    setIsResetModalOpen(false)
    showToast(language === 'km' ? 'បានកំណត់ឯកសារឡើងវិញ' : 'Document reset to starter')
  }, [language, showToast])

  // Clear local draft completely (P0 security requirement)
  const handleClearDraft = useCallback(() => {
    setContent('')
    setTitle(language === 'km' ? 'គ្មានចំណងជើង.md' : 'Untitled.md')
    clearLocalDraft()
    setIsSecurityModalOpen(false)
    showToast(language === 'km' ? 'បានសម្អាតសេចក្តីព្រាងក្នុងម៉ាស៊ីនរួចរាល់' : 'Local draft cleared', 'success')
  }, [language, showToast])

  // Keyboard Shortcuts (Ctrl+B, Ctrl+I, Ctrl+S, Esc, F11)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const modifier = isMac ? e.metaKey : e.ctrlKey

      if (e.key === 'Escape' && isFocusMode) {
        e.preventDefault()
        setIsFocusMode(false)
        return
      }

      if (e.key === 'F11') {
        e.preventDefault()
        setIsFocusMode(prev => !prev)
        return
      }

      if (modifier && e.key.toLowerCase() === 'b') {
        e.preventDefault()
        handleFormat('bold')
      } else if (modifier && e.key.toLowerCase() === 'i') {
        e.preventDefault()
        handleFormat('italic')
      } else if (modifier && e.key.toLowerCase() === 's') {
        e.preventDefault()
        handleDownload()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleFormat, handleDownload, isFocusMode])

  // Scroll sync handlers
  const handleEditorScroll = useCallback((pct: number) => {
    if (isSyncScroll && previewRef.current) {
      previewRef.current.scrollToPercentage(pct)
    }
  }, [isSyncScroll])

  const handlePreviewScroll = useCallback((pct: number) => {
    if (isSyncScroll && editorRef.current) {
      editorRef.current.scrollToPercentage(pct)
    }
  }, [isSyncScroll])

  // Calculate live stats
  const stats = calculateEditorStats(content, cursorPos.line, cursorPos.col)

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[var(--app-bg)] text-[var(--text-primary)] font-sans">
      {/* 1. Header (Hidden during Focus Mode to expand workspace) */}
      {!isFocusMode && (
        <Header
          title={title}
          onTitleChange={handleTitleChange}
          theme={theme}
          onToggleTheme={toggleTheme}
          language={language}
          onToggleLanguage={toggleLanguage}
          onFileSelect={loadFile}
          onCopyClick={handleCopy}
          onDownloadClick={handleDownload}
          onExportPngClick={handleExportPng}
          isExportingPng={isExportingPng}
          onResetClick={() => setIsResetModalOpen(true)}
          onSecurityClick={() => setIsSecurityModalOpen(true)}
          onShortcutsClick={() => setIsShortcutsModalOpen(true)}
          onClearDraftClick={handleClearDraft}
        />
      )}

      {/* 2. Floating Focus Mode Exit Pill */}
      <FocusModeBanner
        isFocusMode={isFocusMode}
        onExit={() => setIsFocusMode(false)}
        language={language}
      />

      {/* 3. Formatting & Actions Toolbar */}
      <Toolbar
        language={language}
        onFormat={handleFormat}
        isSyncScroll={isSyncScroll}
        onToggleSyncScroll={() => setIsSyncScroll(prev => !prev)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isFocusMode={isFocusMode}
        onToggleFocusMode={() => setIsFocusMode(prev => !prev)}
        splitRatio={splitRatio}
        onResetLayout={handleResetLayout}
      />

      {/* 4. Main Resizable Workspace */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Editor Pane */}
        <section
          aria-label="Markdown Editor"
          style={{
            width: activeTab === 'split' ? `${splitRatio}%` : activeTab === 'editor' ? '100%' : '0%',
          }}
          className={`h-full border-r border-[var(--border)] transition-all ${
            activeTab === 'preview' ? 'hidden' : 'flex flex-1 md:flex-none'
          }`}
        >
          <Editor
            ref={editorRef}
            content={content}
            onChange={handleContentChange}
            theme={theme}
            onCursorMove={handleCursorMove}
            onFileDrop={loadFile}
            onScroll={handleEditorScroll}
            isSyncScroll={isSyncScroll}
          />
        </section>

        {/* Resizable Divider (Active only in split view on desktop) */}
        {activeTab === 'split' && (
          <ResizableDivider
            ratio={splitRatio}
            onRatioChange={handleRatioChange}
            onReset={handleResetLayout}
            minRatio={20}
            maxRatio={80}
            title={t('resizeDivider')}
          />
        )}

        {/* Preview Pane */}
        <section
          aria-label="Markdown Preview"
          style={{
            width: activeTab === 'split' ? `${100 - splitRatio}%` : activeTab === 'preview' ? '100%' : '0%',
          }}
          className={`h-full overflow-hidden transition-all ${
            activeTab === 'editor' ? 'hidden' : 'flex flex-1 md:flex-none'
          }`}
        >
          <Preview
            ref={previewRef}
            content={content}
            theme={theme}
            language={language}
            onScroll={handlePreviewScroll}
            isSyncScroll={isSyncScroll}
          />
        </section>
      </main>

      {/* 5. Status Bar */}
      <StatusBar
        stats={stats}
        language={language}
        isSaving={isSaving}
      />

      {/* Reset Confirmation Dialog */}
      <ConfirmModal
        isOpen={isResetModalOpen}
        title={t('resetTitle')}
        description={t('resetDescription')}
        confirmText={t('resetConfirm')}
        cancelText={t('cancel')}
        onConfirm={handleConfirmReset}
        onCancel={() => setIsResetModalOpen(false)}
      />

      {/* Security & Local Draft Management Modal */}
      <SecurityModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        onClearDraft={handleClearDraft}
        language={language}
      />

      {/* Keyboard Shortcuts Reference Modal */}
      <ShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
        language={language}
      />

      {/* Toast Notification */}
      <Toast message={toastMessage} type={toastType} />
    </div>
  )
}
export default App
