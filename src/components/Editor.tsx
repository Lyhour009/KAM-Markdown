import React, { useRef, useImperativeHandle, forwardRef, useEffect, useMemo } from 'react'
import CodeMirror, { type ReactCodeMirrorRef } from '@uiw/react-codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'
import type { Theme } from '../types'

export interface EditorHandle {
  insertFormat: (type: any) => void
  getSelection: () => { start: number; end: number }
  setSelection: (start: number, end: number) => void
  focus: () => void
  scrollToPercentage: (percentage: number) => void
  getScrollPosition: () => number
  setScrollPosition: (scrollTop: number) => void
}

interface EditorProps {
  content: string
  onChange: (value: string) => void
  theme: Theme
  onCursorMove: (line: number, col: number) => void
  onFileDrop: (file: File) => void
  onScroll?: (percentage: number) => void
  isSyncScroll: boolean
}

export const Editor = forwardRef<EditorHandle, EditorProps>(({
  content,
  onChange,
  theme,
  onCursorMove,
  onFileDrop,
  onScroll,
  isSyncScroll,
}, ref) => {
  const cmRef = useRef<ReactCodeMirrorRef>(null)
  const isScrollingFromSync = useRef(false)

  // Expose methods for toolbar actions and programmatic scrolling
  useImperativeHandle(ref, () => ({
    insertFormat: () => {},
    getSelection: () => {
      const view = cmRef.current?.view
      if (!view) return { start: 0, end: 0 }
      const { from, to } = view.state.selection.main
      return { start: from, end: to }
    },
    setSelection: (start: number, end: number) => {
      const view = cmRef.current?.view
      if (!view) return
      view.dispatch({
        selection: { anchor: start, head: end },
        scrollIntoView: true,
      })
    },
    focus: () => {
      cmRef.current?.view?.focus()
    },
    scrollToPercentage: (percentage: number) => {
      const view = cmRef.current?.view
      if (!view) return
      const scroller = view.scrollDOM
      if (!scroller) return

      isScrollingFromSync.current = true
      const maxScroll = scroller.scrollHeight - scroller.clientHeight
      if (maxScroll > 0) {
        scroller.scrollTop = maxScroll * percentage
      }
      setTimeout(() => {
        isScrollingFromSync.current = false
      }, 50)
    },
    getScrollPosition: () => {
      const scroller = cmRef.current?.view?.scrollDOM
      return scroller ? scroller.scrollTop : 0
    },
    setScrollPosition: (scrollTop: number) => {
      const scroller = cmRef.current?.view?.scrollDOM
      if (scroller) {
        scroller.scrollTop = scrollTop
      }
    },
  }))

  // CodeMirror theme customization
  const customEditorTheme = useMemo(() => {
    return EditorView.theme({
      '&': {
        height: '100%',
        backgroundColor: 'transparent',
      },
      '.cm-content': {
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Kantumruy Pro', monospace",
        padding: '16px',
        lineHeight: '1.75',
      },
      '.cm-line': {
        padding: '0 4px',
      },
      '.cm-cursor': {
        borderLeftColor: theme === 'dark' ? '#958BFF' : '#5B4BC4',
        borderLeftWidth: '2px',
      },
      '.cm-selectionBackground, ::selection': {
        backgroundColor: theme === 'dark' ? 'rgba(149, 139, 255, 0.28) !important' : 'rgba(91, 75, 196, 0.16) !important',
      },
      '&.cm-focused .cm-selectionBackground': {
        backgroundColor: theme === 'dark' ? 'rgba(149, 139, 255, 0.35) !important' : 'rgba(91, 75, 196, 0.22) !important',
      },
    })
  }, [theme])

  // Scroll listener for synchronization
  useEffect(() => {
    const view = cmRef.current?.view
    if (!view) return
    const scroller = view.scrollDOM
    if (!scroller) return

    const handleScroll = () => {
      if (isScrollingFromSync.current || !isSyncScroll || !onScroll) return
      const maxScroll = scroller.scrollHeight - scroller.clientHeight
      if (maxScroll > 0) {
        const percentage = scroller.scrollTop / maxScroll
        onScroll(percentage)
      }
    }

    scroller.addEventListener('scroll', handleScroll, { passive: true })
    return () => scroller.removeEventListener('scroll', handleScroll)
  }, [isSyncScroll, onScroll])

  // Drag and drop handling
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      if (file.name.endsWith('.md') || file.name.endsWith('.markdown') || file.name.endsWith('.txt')) {
        onFileDrop(file)
      }
    }
  }

  return (
    <div 
      className="relative h-full w-full overflow-hidden flex flex-col bg-[var(--editor-bg)] transition-colors"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex-1 h-full overflow-auto">
        <CodeMirror
          ref={cmRef}
          value={content}
          height="100%"
          theme={theme === 'dark' ? oneDark : 'light'}
          extensions={[
            markdown(),
            customEditorTheme,
            EditorView.lineWrapping,
          ]}
          onChange={(val, viewUpdate) => {
            onChange(val)
            const head = viewUpdate.state.selection.main.head
            const line = viewUpdate.state.doc.lineAt(head)
            onCursorMove(line.number, head - line.from + 1)
          }}
          onUpdate={(viewUpdate) => {
            if (viewUpdate.selectionSet) {
              const head = viewUpdate.state.selection.main.head
              const line = viewUpdate.state.doc.lineAt(head)
              onCursorMove(line.number, head - line.from + 1)
            }
          }}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightSpecialChars: true,
            history: true,
            foldGutter: false,
            drawSelection: true,
            dropCursor: true,
            allowMultipleSelections: false,
            indentOnInput: true,
            syntaxHighlighting: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: false,
            rectangularSelection: false,
            crosshairCursor: false,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            closeBracketsKeymap: true,
            defaultKeymap: true,
            searchKeymap: true,
            historyKeymap: true,
            foldKeymap: false,
            completionKeymap: false,
            lintKeymap: false,
          }}
          className="h-full text-[14px]"
        />
      </div>
    </div>
  )
})

Editor.displayName = 'Editor'
