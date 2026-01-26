
# Operating System (Browser UI)

A small React project that recreates a desktop-style UI in the browser (taskbar, windows, and a few simple apps). This is a personal learning / practice project.

Live demo: https://operating-system-nine.vercel.app

## Features

- Desktop with clickable app icons and a basic right-click menu
- Taskbar with Start button, clock/date, and a system tray panel
- Draggable window shell with minimize, maximize, and close controls
- Built-in apps:
	- File Explorer: in-memory “virtual file system” with navigation (back/forward/up), breadcrumbs, search, sort, icon/details view, selection, rename, delete, and copy/cut/paste
	- Notepad: simple text area
	- Photos: small image viewer with next/prev and thumbnails
	- Camera: webcam preview (requires browser permission)
	- Edge clone: iframe-based viewer with basic navigation and a small whitelist of allowed sites

## Tech Stack

- React
- Vite
- JavaScript (ES modules)
- CSS + Sass (SCSS)
- ESLint
- `react-rnd` (window drag/resize)

## Setup & Run Instructions

Prerequisites:

- Node.js (LTS recommended)

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Notes for the Camera app:

- Camera access typically works on `localhost` and on HTTPS origins.
- Your browser will prompt for permission.

## Notes

- This is a learning project and is not intended to be production-ready.
- The “File Explorer” uses an in-memory data model (no real filesystem access) and resets on refresh.
- Some UI elements are placeholders and may not be wired up yet.

## Future Improvements (Optional)

- Persist window/app state (e.g., localStorage)
- Add window focus/z-index management
- Wire Start menu pinned apps to open windows
- Improve Edge clone UX (still keep strict sandboxing/allow-list)
- Add automated tests and/or basic accessibility checks
