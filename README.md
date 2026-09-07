# WebOS: In-Browser Desktop Operating System Simulation

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com)
[![Tests](https://img.shields.io/badge/tests-8%20passed-success.svg)](https://github.com)
[![React](https://img.shields.io/badge/React-19.x-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.x-646CFF.svg)](https://vitejs.dev/)
[![Vitest](https://img.shields.io/badge/Tested%20with-Vitest-yellow.svg)](https://vitest.dev/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

A browser-based operating system simulation engineered with React 19, Vite, and modern web standards. Features an event-driven Process & Window Manager, a POSIX-style hierarchical Virtual File System (VFS) with persistent storage, an interactive Terminal CLI with Tab auto-completion, host OS drag-and-drop file ingestion, and multi-instance application lifecycles.

> 🌐 **Live Demo:** [https://operating-system-nine.vercel.app](https://operating-system-nine.vercel.app)

---

## 🏛️ System Architecture

```mermaid
graph TD
    subgraph Host OS & Browser APIs
        DOM[Browser DOM & Screen Display]
        Storage[LocalStorage / IndexedDB]
        DragDrop[HTML5 Drag & Drop File API]
        Media[WebRTC MediaDevices / Camera API]
    end

    subgraph Core Kernel & State Layer
        OSContext[OS Context / Kernel Store]
        ProcMgr[Process & Window Manager (PIDs, Z-Index Stack)]
        VFS[POSIX Virtual File System (Tree, Nodes, Subscribers)]
    end

    subgraph Shell UI
        Desktop[Desktop & Wallpaper Engine]
        Taskbar[Taskbar & Live System Tray]
        Spotlight[Spotlight / Command Palette (Ctrl+K)]
        Start[Searchable Start Menu]
        AltTab[Alt + Tab Window Switcher]
        Windows[Window Shell (Drag, Resize, Focus)]
    end

    subgraph Applications
        Portfolio[Portfolio / Hire Me (Resume & Showcase)]
        TaskManager[Task Manager (Live CPU & Telemetry)]
        Terminal[Terminal (Bash/CMD CLI)]
        Explorer[File Explorer (Fluent UI, Dual Pane, CRUD)]
        Notepad[Notepad (Tabs, Gutter, Line Counters)]
        Settings[Settings (Theme & Storage Telemetry)]
        Edge[Edge (Sandboxed Browser)]
        Camera[Camera App]
        Photos[Photos Viewer]
    end

    Host OS & Browser APIs <--> Core Kernel & State Layer
    Core Kernel & State Layer --> Shell UI
    Shell UI --> Windows
    Windows --> Applications
    Applications <--> VFS
    DragDrop --> Explorer
    Storage <--> VFS
```

---

## ✨ Core Engineering Highlights

### 1. Process & Window Management Engine
- **Multi-Instance Architecture:** Each open window runs as a separate process identified by an incremental Process ID (`PID`), allowing users to run multiple instances of applications (e.g., several Notepad and Explorer windows simultaneously).
- **Z-Index Stacking Context:** Active window focus is managed dynamically via an auto-incrementing stacking context, ensuring clicked or interacted windows immediately surface to the top layer.
- **`Alt + Tab` Task Switcher:** Global keyboard hook providing instant visual modal cycling across all running processes.
- **Window Lifecycle Controls:** State transitions between `MINIMIZED`, `MAXIMIZED`, `RESTORED`, and `TERMINATED`.

### 2. Hierarchical Virtual File System (VFS)
- **POSIX-Style API:** Clean object-oriented abstraction supporting standard file operations (`readFile`, `writeFile`, `mkdir`, `unlink`, `rename`, `readDir`, `resolvePath`, `getStorageStats`).
- **Reactive Event Bus:** Publisher-subscriber pattern notifying mounted GUI apps and CLI commands in real-time when file system nodes are mutated.
- **Data Persistence:** Automatic serialization to `localStorage` with fallback seeds, JSON backup export, and file restoration.
- **Host OS Drag & Drop Ingestion:** Drag `.txt`, `.md`, `.json`, or image files directly from your physical desktop into the web browser's File Explorer to ingest them into the virtual file system.

### 3. Interactive Terminal / Virtual Shell (CLI)
- **Built-in Commands:**
  - Navigation & FS: `ls`, `dir`, `cd`, `pwd`, `cat`, `echo`, `touch`, `mkdir`, `rm`
  - Process Control: `ps` (lists active windows & PIDs), `kill <pid>` (closes GUI windows directly from CLI)
  - System: `neofetch`, `sysinfo`, `theme <dark|light>`, `open <app>`, `date`, `whoami`, `clear`, `vfs-reset`
- **Developer UX:** History navigation with Arrow Up/Down, Tab auto-completion for commands and directory paths, and file output redirection (`echo "text" > file.txt`).

### 4. Spotlight Command Palette (`Ctrl + K` / `Cmd + K`)
- **Fuzzy Search Across System & VFS:** Instant keyboard-driven command palette indexing system applications, quick theme toggling, VFS file search, and shell actions.
- **Keyboard Navigation:** Seamless Arrow Up/Down selection with instant execution upon pressing Enter or clicking.

### 5. Native Applications Suite
- **Interactive Developer Portfolio ("Hire Me"):** Interactive resume window featuring tabbed engineering portfolio, key architecture metrics, skills matrix, project case studies, and instant recruiter contact copy button. Accessible directly from Desktop, Taskbar, Start Menu, or via Terminal (`resume` / `hire`).
- **Task Manager & System Telemetry:** Real-time activity monitor featuring a dynamic 60 FPS HTML5 Canvas CPU wave simulation, browser JS Heap memory gauges, live process list with PIDs, and interactive "End Task" process termination.
- **File Explorer (Windows 11 Fluent UI):** Quick Access sidebar, Local Disk (C:) storage utilization gauge, directory breadcrumbs, collapsible metadata & text preview pane, and host OS drag-and-drop file ingestion.
- **Notepad:** Multi-document tabs, synchronized line numbers gutter, wrap toggle, line/word/char counters, and CRLF/UTF-8 status indicators.
- **Settings App:** Appearance configuration (Dark/Light mode, 4 wallpaper presets, brightness control), VFS telemetry stats, and JSON backup export/import.
- **Camera App:** WebRTC webcam stream preview with browser permission handling.
- **Edge Browser Clone:** Sandboxed iframe viewer with secure navigation controls.

---

## 🛠️ Tech Stack

| Technology | Role |
| :--- | :--- |
| **React 19** | Core UI component framework and state synchronization |
| **Vite 7** | Next-generation frontend build tooling and HMR |
| **Vitest** | Blazing-fast unit test suite for VFS algorithms and path resolution |
| **JavaScript (ES2023)** | Modern modular architecture |
| **Sass / SCSS & CSS Modules** | Fluid Windows 11 Fluent-inspired glassmorphism styles |
| **ESLint 9** | Code quality enforcement with React Refresh integration |
| **GitHub Actions** | Automated CI pipeline (lint, test, build) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### Installation
```bash
git clone https://github.com/manascodr/operating-system.git
cd operating-system
npm install
```

### Development
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Running Tests
Execute the unit test suite powered by Vitest:
```bash
npm test
```

### Production Build & Verification
```bash
# Run code quality linting
npm run lint

# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 📝 Resume Summary (STAR / XYZ Formula)

> **Web Operating System & Window Manager** | *React 19, Vite, Vitest, JavaScript (ES2023), SCSS, GitHub Actions*
> - Architected an event-driven desktop simulation managing multi-instance process lifecycles (`PIDs`), dynamic z-index stacking contexts, a global Spotlight command palette (`Ctrl+K`), and an `Alt+Tab` application switcher.
> - Implemented an in-browser hierarchical Virtual File System (VFS) with POSIX-style CRUD APIs, pub/sub reactive notifications, `localStorage` persistence, and HTML5 Drag-and-Drop file ingestion from host machines.
> - Built an interactive Terminal CLI emulator featuring command history, Tab auto-completion, I/O redirection, and process termination (`kill <pid>`) communicating with the underlying window manager.
> - Engineered an interactive Activity Monitor & Task Manager with real-time 60 FPS Canvas CPU wave simulation and browser memory telemetry, plus a Windows 11 Fluent UI File Explorer with preview panes.
> - Configured CI/CD automation via GitHub Actions running automated Vitest unit tests and ESLint quality gates, maintaining a 100% test pass rate across core filesystem operations.
