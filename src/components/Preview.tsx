import { useRef, useImperativeHandle, forwardRef, useEffect } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import rehypeHighlight from 'rehype-highlight'
import { PenLine } from 'lucide-react'
import type { Language, Theme } from '../types'
import { isSafeUrl } from '../utils/securityUtils'
import { exportElementAsPng } from '../utils/exportUtils'
import { getTranslation } from '../locales'

export interface PreviewHandle {
  scrollToPercentage: (percentage: number) => void
  exportAsPng: (filename: string) => Promise<boolean>
  getScrollTop: () => number
  setScrollTop: (scrollTop: number) => void
}

interface PreviewProps {
  content: string
  theme: Theme
  language: Language
  onScroll?: (percentage: number) => void
  isSyncScroll: boolean
}

// Custom sanitize schema that allows code block classes and task list checkboxes
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code || []), 'className'],
    span: [...(defaultSchema.attributes?.span || []), 'className'],
    input: ['type', 'checked', 'disabled'],
  },
}

export const Preview = forwardRef<PreviewHandle, PreviewProps>(({
  content,
  language,
  onScroll,
  isSyncScroll,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const isScrollingFromSync = useRef(false)

  useImperativeHandle(ref, () => ({
    scrollToPercentage: (percentage: number) => {
      const el = containerRef.current
      if (!el) return
      isScrollingFromSync.current = true
      const maxScroll = el.scrollHeight - el.clientHeight
      if (maxScroll > 0) {
        el.scrollTop = maxScroll * percentage
      }
      setTimeout(() => {
        isScrollingFromSync.current = false
      }, 50)
    },
    exportAsPng: async (filename: string) => {
      const el = containerRef.current
      if (!el) return false

      const scrollHeight = el.scrollHeight
      const scrollWidth = el.scrollWidth

      return await exportElementAsPng(el, filename, {
        height: scrollHeight,
        width: scrollWidth,
        style: {
          height: `${scrollHeight}px`,
          maxHeight: 'none',
          overflow: 'visible',
        },
      })
    },
    getScrollTop: () => {
      return containerRef.current ? containerRef.current.scrollTop : 0
    },
    setScrollTop: (scrollTop: number) => {
      if (containerRef.current) {
        containerRef.current.scrollTop = scrollTop
      }
    },
  }))

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const handleScroll = () => {
      if (isScrollingFromSync.current || !isSyncScroll || !onScroll) return
      const maxScroll = el.scrollHeight - el.clientHeight
      if (maxScroll > 0) {
        const percentage = el.scrollTop / maxScroll
        onScroll(percentage)
      }
    }

    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [isSyncScroll, onScroll])

  // Quiet empty state when document is blank (Clear contrast in both Light & Dark)
  if (!content || content.trim().length === 0) {
    return (
      <div
        ref={containerRef}
        lang={language}
        className="h-full w-full flex flex-col items-center justify-center p-8 bg-[var(--preview-bg)] transition-colors"
      >
        <div className="h-10 w-10 rounded-full bg-[var(--surface-hover)] flex items-center justify-center text-[var(--text-secondary)] mb-3 shadow-2xs">
          <PenLine className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <p className="text-sm font-medium text-[var(--text-secondary)] font-sans select-none text-center max-w-sm leading-relaxed">
          {getTranslation(language, 'emptyPreviewHint')}
        </p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      lang={language}
      className={`h-full w-full overflow-y-auto px-3.5 py-4 sm:px-8 bg-[var(--preview-bg)] transition-colors selection:bg-[var(--accent-soft)]`}
    >
      <div className="w-full font-sans leading-relaxed text-[var(--text-primary)] break-words [overflow-wrap:anywhere]">
        <Markdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[
            [rehypeSanitize, sanitizeSchema],
            rehypeHighlight,
          ]}
          urlTransform={(url) => (isSafeUrl(url) ? url : '')}
          components={{
            h1: ({ ...props }) => (
              <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] mt-8 mb-4 pb-2 border-b border-[var(--border)]" {...props} />
            ),
            h2: ({ ...props }) => (
              <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] mt-6 mb-3 pb-1 border-b border-[var(--border-subtle)]" {...props} />
            ),
            h3: ({ ...props }) => (
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mt-5 mb-2" {...props} />
            ),
            h4: ({ ...props }) => (
              <h4 className="text-lg font-semibold text-[var(--text-primary)] mt-4 mb-2" {...props} />
            ),
            p: ({ ...props }) => (
              <p className="my-3 leading-7 text-[var(--text-secondary)]" {...props} />
            ),
            blockquote: ({ ...props }) => (
              <blockquote className="my-4 border-l-4 border-[var(--accent)] bg-[var(--surface-hover)] py-2.5 px-4 rounded-r-lg italic text-[var(--text-secondary)]" {...props} />
            ),
            ul: ({ ...props }) => (
              <ul className="my-3 list-disc list-inside space-y-1.5 pl-2 text-[var(--text-secondary)]" {...props} />
            ),
            ol: ({ ...props }) => (
              <ol className="my-3 list-decimal list-inside space-y-1.5 pl-2 text-[var(--text-secondary)]" {...props} />
            ),
            li: ({ ...props }) => (
              <li className="leading-7" {...props} />
            ),
            hr: ({ ...props }) => (
              <hr className="my-6 border-[var(--border)]" {...props} />
            ),
            table: ({ ...props }) => (
              <div className="my-6 overflow-x-auto max-w-full rounded-lg border border-[var(--border)] [scrollbar-width:thin]">
                <table className="min-w-full text-left border-collapse text-xs sm:text-sm" {...props} />
              </div>
            ),
            thead: ({ ...props }) => (
              <thead className="bg-[var(--surface-secondary)] border-b border-[var(--border)] font-semibold text-[var(--text-primary)]" {...props} />
            ),
            th: ({ ...props }) => (
              <th className="px-4 py-3 font-semibold" {...props} />
            ),
            td: ({ ...props }) => (
              <td className="px-4 py-2.5 border-t border-[var(--border)] text-[var(--text-secondary)]" {...props} />
            ),
            a: ({ href, children, ...props }: any) => {
              const safe = isSafeUrl(href)
              if (!safe) {
                return (
                  <span
                    className="inline-flex items-center text-[var(--danger)] font-mono text-xs line-through cursor-not-allowed select-none bg-[var(--danger)]/10 px-1 rounded"
                    title="Security: Blocked unsafe link scheme (javascript/data/vbscript)"
                  >
                    {children}
                  </span>
                )
              }
              return (
                <a
                  href={href}
                  className="font-medium text-[var(--accent)] underline decoration-[var(--accent)]/40 hover:decoration-[var(--accent)] underline-offset-2 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  {...props}
                >
                  {children}
                </a>
              )
            },
            img: ({ src, alt, ...props }: any) => {
              const safe = isSafeUrl(src)
              if (!safe) {
                return (
                  <span className="inline-block text-xs bg-[var(--danger)]/10 text-[var(--danger)] p-2 rounded border border-[var(--danger)]/30">
                    [Blocked unsafe image source]
                  </span>
                )
              }
              return (
                <img
                  src={src}
                  alt={alt || 'Image'}
                  loading="lazy"
                  className="max-w-full h-auto rounded-lg my-4 border border-[var(--border)] shadow-2xs"
                  {...props}
                />
              )
            },
            code: ({ className, children, ...props }: any) => {
              const match = /language-(\w+)/.exec(className || '')
              const isInline = !match && !String(children).includes('\n')
              if (isInline) {
                return (
                  <code
                    className="rounded bg-[var(--surface-secondary)] border border-[var(--border-subtle)] px-1.5 py-0.5 font-mono text-[13px] text-[var(--accent)] font-medium"
                    {...props}
                  >
                    {children}
                  </code>
                )
              }
              return (
                <div className="my-4 max-w-full overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--text-primary)] shadow-2xs">
                  <pre className="p-3 sm:p-4 overflow-x-auto max-w-full text-xs sm:text-[13px] font-mono leading-relaxed bg-transparent [scrollbar-width:thin]">
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                </div>
              )
            },
          }}
        >
          {content}
        </Markdown>
      </div>
    </div>
  )
})

Preview.displayName = 'Preview'
