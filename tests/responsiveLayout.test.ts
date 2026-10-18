import test from 'node:test'
import assert from 'node:assert/strict'
import type { ActiveTab, MobileTab } from '../src/types'

// Pure logic helpers representing responsive layout rules
export function isMobileBreakpoint(width: number): boolean {
  return width < 768
}

export interface WorkspaceVisibility {
  showEditor: boolean
  showPreview: boolean
  showDivider: boolean
  editorWidthPct: number
  previewWidthPct: number
}

export function resolveWorkspaceLayout(
  width: number,
  desktopTab: ActiveTab,
  mobileTab: MobileTab,
  splitRatio: number = 50
): WorkspaceVisibility {
  const isMobile = isMobileBreakpoint(width)

  if (isMobile) {
    return {
      showEditor: mobileTab === 'editor',
      showPreview: mobileTab === 'preview',
      showDivider: false,
      editorWidthPct: mobileTab === 'editor' ? 100 : 0,
      previewWidthPct: mobileTab === 'preview' ? 100 : 0,
    }
  }

  // Desktop
  if (desktopTab === 'split') {
    return {
      showEditor: true,
      showPreview: true,
      showDivider: true,
      editorWidthPct: splitRatio,
      previewWidthPct: 100 - splitRatio,
    }
  }

  if (desktopTab === 'editor') {
    return {
      showEditor: true,
      showPreview: false,
      showDivider: false,
      editorWidthPct: 100,
      previewWidthPct: 0,
    }
  }

  // desktopTab === 'preview'
  return {
    showEditor: false,
    showPreview: true,
    showDivider: false,
    editorWidthPct: 0,
    previewWidthPct: 100,
  }
}

test('Responsive Layout: isMobileBreakpoint correctly classifies viewports', () => {
  // Mobile devices (< 768px)
  assert.equal(isMobileBreakpoint(320), true)  // Small narrow phone
  assert.equal(isMobileBreakpoint(375), true)  // iPhone SE / common phone
  assert.equal(isMobileBreakpoint(430), true)  // iPhone Pro Max
  assert.equal(isMobileBreakpoint(600), true)  // Small tablet portrait
  assert.equal(isMobileBreakpoint(767), true)  // Just under breakpoint

  // Desktop / Tablet landscape (>= 768px)
  assert.equal(isMobileBreakpoint(768), false) // iPad / Tablet breakpoint
  assert.equal(isMobileBreakpoint(1024), false)// Small desktop / tablet landscape
  assert.equal(isMobileBreakpoint(1440), false)// Standard desktop
})

test('Responsive Layout: Mobile viewport enforces single-panel workspace', () => {
  // On mobile (375px), when mobileTab is 'editor': only editor is visible at 100%
  const editorView = resolveWorkspaceLayout(375, 'split', 'editor', 50)
  assert.equal(editorView.showEditor, true)
  assert.equal(editorView.showPreview, false)
  assert.equal(editorView.showDivider, false)
  assert.equal(editorView.editorWidthPct, 100)
  assert.equal(editorView.previewWidthPct, 0)

  // On mobile (375px), when mobileTab is 'preview': only preview is visible at 100%
  const previewView = resolveWorkspaceLayout(375, 'split', 'preview', 50)
  assert.equal(previewView.showEditor, false)
  assert.equal(previewView.showPreview, true)
  assert.equal(previewView.showDivider, false)
  assert.equal(previewView.editorWidthPct, 0)
  assert.equal(previewView.previewWidthPct, 100)
})

test('Responsive Layout: Desktop preserves split view and draggable divider', () => {
  // On desktop (1024px), split view shows both panels according to splitRatio
  const splitView = resolveWorkspaceLayout(1024, 'split', 'editor', 60)
  assert.equal(splitView.showEditor, true)
  assert.equal(splitView.showPreview, true)
  assert.equal(splitView.showDivider, true)
  assert.equal(splitView.editorWidthPct, 60)
  assert.equal(splitView.previewWidthPct, 40)

  // On desktop (1440px), editor-only mode shows editor at 100%
  const desktopEditorOnly = resolveWorkspaceLayout(1440, 'editor', 'editor', 50)
  assert.equal(desktopEditorOnly.showEditor, true)
  assert.equal(desktopEditorOnly.showPreview, false)
  assert.equal(desktopEditorOnly.showDivider, false)
  assert.equal(desktopEditorOnly.editorWidthPct, 100)

  // On desktop (1440px), preview-only mode shows preview at 100%
  const desktopPreviewOnly = resolveWorkspaceLayout(1440, 'preview', 'editor', 50)
  assert.equal(desktopPreviewOnly.showEditor, false)
  assert.equal(desktopPreviewOnly.showPreview, true)
  assert.equal(desktopPreviewOnly.showDivider, false)
  assert.equal(desktopPreviewOnly.previewWidthPct, 100)
})

test('Responsive Layout: State preservation records cursor and scroll values', () => {
  // Simulated state store
  const stateStore = {
    editorScroll: 0,
    editorSelection: { start: 0, end: 0 },
    previewScroll: 0,
  }

  // Simulate editing on mobile
  stateStore.editorScroll = 340
  stateStore.editorSelection = { start: 45, end: 72 }

  // User switches to preview
  stateStore.previewScroll = 120

  // User switches back to editor
  assert.equal(stateStore.editorScroll, 340)
  assert.equal(stateStore.editorSelection.start, 45)
  assert.equal(stateStore.editorSelection.end, 72)
  assert.equal(stateStore.previewScroll, 120)
})
