# KAM-Markdown

> A calm, high-performance Markdown editor with real-time live preview, first-class Khmer (ភាសាខ្មែរ) & English typography, and zero cloud leaks.

![KAM-Markdown](public/favicon.svg)

---

## 🌟 Key Features

- **⚡ Instant Dual-Pane Live Preview:** Split-screen writing with real-time GitHub-Flavored Markdown (GFM) rendering.
- **🇰🇭 Khmer Unicode Typography:** Flawless rendering for Khmer consonants, subscripts, and independent vowels with calibrated line-heights (`Kantumruy Pro` & `Noto Sans Khmer`).
- **🔒 100% Client-Side Privacy:** Zero cloud leaks. Drafts, preferences, and documents remain strictly local in your browser.
- **🛡️ Security Hardened:** Strict Content Security Policy (CSP), link scheme sanitization, and import threshold enforcement.
- **🎨 Editorial Theme System:** Crafted "Writer's Workshop" Light and Dark modes with smooth transitions.
- **↔️ Resizable Workspace:** Drag-and-drop divider with double-click 50:50 reset and dedicated view modes (Editor-only, Split, Preview-only).
- **🧘 Focus Mode:** Minimalist distraction-free writing environment (`F11` or toolbar toggle).
- **🔄 Synchronized Scrolling:** Proportional bi-directional scroll synchronization between editor and preview.

---

## 🛠️ Tech Stack

- **Framework:** React 19 + TypeScript
- **Bundler:** Vite 8 (Rolldown engine)
- **Editor:** CodeMirror 6 with Markdown language pack & One Dark theme
- **Markdown Pipeline:** `react-markdown` + `remark-gfm` + `rehype-highlight` + `rehype-sanitize`
- **Styling:** Tailwind CSS v4 (CSS variables & tokenized palette)
- **Icons:** Lucide React (uniform 1.75 stroke weight)
- **Linter & Tests:** Oxlint + Node.js native test runner

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (tested on Node 20 / 22 / 24)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/Lyhour009/KAM-Markdown.git
cd KAM-Markdown

# Install dependencies
npm install
```

### Development

```bash
# Start Vite development server
npm run dev
```

### Testing & Verification

```bash
# Run unit tests
npm test

# Run Oxlint
npm run lint

# Build for production
npm run build
```

---

## 📄 License

MIT License. Designed and built with ❤️ for Khmer and global writers.
