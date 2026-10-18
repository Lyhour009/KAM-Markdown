import React from 'react'
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Quote,
  Code,
  FileCode,
  List,
  ListOrdered,
  ListTodo,
  Table as TableIcon,
  Minus,
  RefreshCw,
  Columns,
  Eye,
  Edit3,
  Maximize2,
  Minimize2,
  SplitSquareVertical,
} from 'lucide-react'
import type { ActiveTab, Language } from '../types'
import { getTranslation } from '../locales'

interface ToolbarProps {
  language: Language
  onFormat: (type: 'bold' | 'italic' | 'strikethrough' | 'code' | 'codeblock' | 'quote' | 'bullet' | 'number' | 'task' | 'h1' | 'h2' | 'h3' | 'link' | 'table' | 'hr') => void
  isSyncScroll: boolean
  onToggleSyncScroll: () => void
  activeTab: ActiveTab
  onTabChange: (tab: ActiveTab) => void
  isFocusMode: boolean
  onToggleFocusMode: () => void
  splitRatio: number
  onResetLayout: () => void
}

export const Toolbar: React.FC<ToolbarProps> = ({
  language,
  onFormat,
  isSyncScroll,
  onToggleSyncScroll,
  activeTab,
  onTabChange,
  isFocusMode,
  onToggleFocusMode,
  splitRatio,
  onResetLayout,
}) => {
  const t = (key: any) => getTranslation(language, key)

  const toolBtn = "h-7 w-7 flex items-center justify-center rounded-md hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--accent)] shrink-0"

  const isRatioModified = activeTab === 'split' && Math.round(splitRatio) !== 50

  return (
    <div className="border-b border-[var(--border)] bg-[var(--surface)] px-3 sm:px-4 py-1.5 flex items-center justify-between gap-3 text-sm select-none overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* Left: Compact formatting actions in a single row */}
      <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Text styling */}
        <button
          type="button"
          onClick={() => onFormat('bold')}
          className={toolBtn}
          title={t('bold')}
          aria-label={t('bold')}
        >
          <Bold className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>

        <button
          type="button"
          onClick={() => onFormat('italic')}
          className={toolBtn}
          title={t('italic')}
          aria-label={t('italic')}
        >
          <Italic className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>

        <button
          type="button"
          onClick={() => onFormat('strikethrough')}
          className={toolBtn}
          title={t('strikethrough')}
          aria-label={t('strikethrough')}
        >
          <Strikethrough className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>

        <div className="h-4 w-px bg-[var(--border)] mx-0.5 shrink-0" />

        {/* Headings */}
        <button
          type="button"
          onClick={() => onFormat('h1')}
          className={toolBtn}
          title={t('heading1')}
          aria-label={t('heading1')}
        >
          <Heading1 className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>

        <button
          type="button"
          onClick={() => onFormat('h2')}
          className={toolBtn}
          title={t('heading2')}
          aria-label={t('heading2')}
        >
          <Heading2 className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>

        <button
          type="button"
          onClick={() => onFormat('h3')}
          className={toolBtn}
          title={t('heading3')}
          aria-label={t('heading3')}
        >
          <Heading3 className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>

        <div className="h-4 w-px bg-[var(--border)] mx-0.5 shrink-0" />

        {/* Links, Quotes & Code */}
        <button
          type="button"
          onClick={() => onFormat('link')}
          className={toolBtn}
          title={t('link')}
          aria-label={t('link')}
        >
          <LinkIcon className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>

        <button
          type="button"
          onClick={() => onFormat('quote')}
          className={toolBtn}
          title={t('quote')}
          aria-label={t('quote')}
        >
          <Quote className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>

        <button
          type="button"
          onClick={() => onFormat('code')}
          className={toolBtn}
          title={t('codeInline')}
          aria-label={t('codeInline')}
        >
          <Code className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>

        <button
          type="button"
          onClick={() => onFormat('codeblock')}
          className={toolBtn}
          title={t('codeBlock')}
          aria-label={t('codeBlock')}
        >
          <FileCode className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>

        <div className="h-4 w-px bg-[var(--border)] mx-0.5 shrink-0" />

        {/* Lists & Structured elements */}
        <button
          type="button"
          onClick={() => onFormat('bullet')}
          className={toolBtn}
          title={t('bulletList')}
          aria-label={t('bulletList')}
        >
          <List className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>

        <button
          type="button"
          onClick={() => onFormat('number')}
          className={toolBtn}
          title={t('numberedList')}
          aria-label={t('numberedList')}
        >
          <ListOrdered className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>

        <button
          type="button"
          onClick={() => onFormat('task')}
          className={toolBtn}
          title={t('taskList')}
          aria-label={t('taskList')}
        >
          <ListTodo className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>

        <button
          type="button"
          onClick={() => onFormat('table')}
          className={toolBtn}
          title={t('table')}
          aria-label={t('table')}
        >
          <TableIcon className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>

        <button
          type="button"
          onClick={() => onFormat('hr')}
          className={toolBtn}
          title={t('horizontalRule')}
          aria-label={t('horizontalRule')}
        >
          <Minus className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>
      </div>

      {/* Right: Consolidated View Controls, Sync Scroll, Focus Mode */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">
        {/* Reset Layout 50/50 button (visible when ratio is customized) */}
        {isRatioModified && (
          <button
            type="button"
            onClick={onResetLayout}
            className="inline-flex items-center gap-1 h-7 px-2 rounded-md text-xs font-medium text-[var(--text-secondary)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] transition-colors"
            title={t('resetLayout')}
          >
            <SplitSquareVertical className="h-3.5 w-3.5 text-[var(--accent)]" strokeWidth={1.75} />
            <span className="hidden lg:inline">{t('resetLayout')}</span>
            <span className="lg:hidden">50:50</span>
          </button>
        )}

        {/* Sync Scroll Toggle */}
        <button
          type="button"
          onClick={onToggleSyncScroll}
          className={`inline-flex items-center gap-1.5 h-7 px-2 rounded-md text-xs font-medium transition-colors border ${
            isSyncScroll
              ? 'bg-[var(--accent-soft)] border-[var(--accent)]/30 text-[var(--accent)]'
              : 'border-[var(--border)] text-[var(--text-secondary)] bg-[var(--surface)] hover:bg-[var(--surface-hover)]'
          }`}
          title={isSyncScroll ? t('syncScrollEnabled') : t('syncScrollDisabled')}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isSyncScroll ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`} strokeWidth={1.75} />
          <span className="hidden md:inline">{t('syncScroll')}</span>
        </button>

        {/* View Mode Segmented Control (Editor / Split / Preview) */}
        <div className="flex items-center rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] p-0.5">
          <button
            type="button"
            onClick={() => onTabChange('editor')}
            className={`h-6 px-1.5 sm:px-2 rounded-md text-xs font-medium transition-all ${
              activeTab === 'editor'
                ? 'bg-[var(--surface)] text-[var(--accent)] shadow-2xs font-semibold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            title={t('editorOnly')}
            aria-label={t('editorOnly')}
          >
            <Edit3 className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={() => onTabChange('split')}
            className={`h-6 px-1.5 sm:px-2 rounded-md text-xs font-medium transition-all ${
              activeTab === 'split'
                ? 'bg-[var(--surface)] text-[var(--accent)] shadow-2xs font-semibold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            title={t('splitView')}
            aria-label={t('splitView')}
          >
            <Columns className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={() => onTabChange('preview')}
            className={`h-6 px-1.5 sm:px-2 rounded-md text-xs font-medium transition-all ${
              activeTab === 'preview'
                ? 'bg-[var(--surface)] text-[var(--accent)] shadow-2xs font-semibold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            title={t('previewOnly')}
            aria-label={t('previewOnly')}
          >
            <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
        </div>

        {/* Focus Mode Button */}
        <button
          type="button"
          onClick={onToggleFocusMode}
          className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-xs font-medium transition-colors border ${
            isFocusMode
              ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-2xs'
              : 'border-[var(--border)] text-[var(--text-primary)] bg-[var(--surface)] hover:bg-[var(--surface-hover)]'
          }`}
          title={isFocusMode ? t('exitFocusMode') : t('focusMode')}
        >
          {isFocusMode ? <Minimize2 className="h-3.5 w-3.5" strokeWidth={1.75} /> : <Maximize2 className="h-3.5 w-3.5 text-[var(--accent)]" strokeWidth={1.75} />}
          <span className="hidden sm:inline">{t('focusMode')}</span>
        </button>
      </div>
    </div>
  )
}
