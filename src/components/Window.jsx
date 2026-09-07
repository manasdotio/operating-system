import React, { useEffect, useState } from "react";
import "../utils/css/Window.css";
import { Rnd } from "react-rnd";
import { useOS } from "../context/OSContext";

const getWindowStatus = (win) => {
  switch (win.appId) {
    case "terminal":
      return {
        badge: "BASH v1.2",
        hint: "Type 'help' or click chips • Tab auto-completion",
        extra: "TTY 1",
      };
    case "explorer":
      return {
        badge: "VFS POSIX",
        hint: "Drag & drop files from desktop • Double-click to open",
        extra: "Local (C:)",
      };
    case "notepad":
      return {
        badge: "EDITOR",
        hint: "Ctrl+S to save to VFS • Multi-tab workspace",
        extra: "UTF-8",
      };
    case "taskmanager":
      return {
        badge: "TELEMETRY",
        hint: "Real-time 60 FPS Canvas wave • Live process manager",
        extra: "Kernel",
      };
    case "portfolio":
      return {
        badge: "RESUME",
        hint: "Full-Stack Engineer • React 19 • POSIX VFS Architecture",
        extra: "Hire Me",
      };
    case "settings":
      return {
        badge: "CONFIG",
        hint: "Themes • Wallpapers • Storage backup export & reset",
        extra: "Admin",
      };
    case "edge":
      return {
        badge: "BROWSER",
        hint: "Sandboxed Webview • Whitelisted HTTPS destinations",
        extra: "Secure",
      };
    case "camera":
      return {
        badge: "WEBRTC",
        hint: "Real-time video capture device stream preview",
        extra: "1080p",
      };
    case "photos":
      return {
        badge: "GALLERY",
        hint: "Arrow keys or click thumbnails to navigate photos",
        extra: "Media",
      };
    case "thisPC":
      return {
        badge: "THIS PC",
        hint: "Storage volume metrics and root directory overview",
        extra: "System",
      };
    case "recycleBin":
      return {
        badge: "RECYCLE",
        hint: "Temporary deleted files repository",
        extra: "Storage",
      };
    default:
      return {
        badge: "PROCESS",
        hint: "Alt+Tab to switch • Ctrl+K for Spotlight",
        extra: "WebOS",
      };
  }
};

const Window = ({ win }) => {
  const { closeWindow, minimizeWindow, maximizeWindow, focusWindow, activePid } = useOS();
  const defaultW = Math.min(win.defaultWidth || 760, Math.max(window.innerWidth - 60, 320));
  const defaultH = Math.min(win.defaultHeight || 480, Math.max(window.innerHeight - 100, 260));
  const [size, setSize] = useState({ width: defaultW, height: defaultH });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [customStatus, setCustomStatus] = useState(null);

  useEffect(() => {
    // Stagger / Center window on mount safely above taskbar
    const offset = (win.pid % 8) * 20;
    const x = Math.max((window.innerWidth - defaultW) / 2 + offset, 16);
    const y = Math.max((window.innerHeight - defaultH - 60) / 2 + offset, 16);
    setPosition({ x, y });
  }, [win.pid, defaultW, defaultH]);

  const isActive = activePid === win.pid;
  const statusInfo = getWindowStatus(win);

  return (
    <Rnd
      size={{
        width: win.maximized ? window.innerWidth : size.width,
        height: win.maximized ? window.innerHeight - 44 : size.height,
      }}
      position={win.maximized ? { x: 0, y: 0 } : position}
      onDragStop={(e, d) => setPosition({ x: d.x, y: d.y })}
      onResizeStop={(e, direction, ref, delta, pos) => {
        setSize({
          width: parseInt(ref.style.width, 10),
          height: parseInt(ref.style.height, 10),
        });
        setPosition(pos);
      }}
      onMouseDown={() => focusWindow(win.pid)}
      bounds="window"
      dragHandleClassName="window-header"
      enableResizing={!win.maximized}
      style={{ zIndex: win.zIndex }}
      className={`border-window ${win.minimized ? "minimized" : ""} ${
        win.maximized ? "maximized" : ""
      } ${isActive ? "window-active" : "window-inactive"}`}
    >
      <div className={`window-header ${isActive ? "active" : ""}`} onDoubleClick={() => maximizeWindow(win.pid)}>
        <div className="title">
          <img src={win.icon} alt="" />
          <p>{win.name}</p>
        </div>
        <div className="window-controls">
          <button onClick={() => minimizeWindow(win.pid)} title="Minimize">
            <img src="/assets/icons/ui/minimize.png" alt="Minimize" />
          </button>
          <button onClick={() => maximizeWindow(win.pid)} title="Maximize">
            <img src="/assets/icons/ui/maximize.png" alt="Maximize" />
          </button>
          <button className="close" onClick={() => closeWindow(win.pid)} title="Close">
            <img src="/assets/icons/ui/close.png" alt="Close" />
          </button>
        </div>
      </div>

      <div className="window-content" onClick={() => focusWindow(win.pid)}>
        {win.component ? (
          <win.component
            initialData={win.initialData}
            win={win}
            isActive={isActive}
            setStatusText={setCustomStatus}
          />
        ) : (
          <p>App not found</p>
        )}
      </div>

      {/* Attention-to-Detail System Telemetry & Status Bar (Tailwind CSS) */}
      <footer className="h-7 min-h-7 px-2.5 bg-zinc-900/95 border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-400 font-mono select-none backdrop-blur-md z-10">
        {/* Left: Process status & subsystem tag */}
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="flex items-center gap-1.5 shrink-0" title="Process running health">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[10px] text-emerald-400 font-medium uppercase tracking-wider">OK</span>
          </span>

          <span className="px-1.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-sky-400 font-mono text-[10px] font-semibold shrink-0">
            PID:{win.pid}
          </span>

          <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-300 font-mono text-[10px] hidden sm:inline shrink-0">
            {statusInfo.badge}
          </span>
        </div>

        {/* Center: Contextual shortcut hints or dynamic status */}
        <div className="hidden md:flex items-center gap-1.5 text-zinc-400 font-sans text-[11px] truncate max-w-[45%]">
          <span className="text-sky-400/90 shrink-0">⚡</span>
          <span className="truncate">{customStatus || statusInfo.hint}</span>
        </div>

        {/* Right: Memory telemetry, extra badge, and resize grip */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px]" title="Simulated Process Memory Footprint">
            MEM: ~{(11.4 + (win.pid % 9) * 1.8).toFixed(1)}MB
          </span>

          <span className="text-zinc-500 text-[10px] font-mono hidden lg:inline">
            {statusInfo.extra}
          </span>

          {/* Diagonal 6-dot native resize grip */}
          <div
            className="flex items-end justify-end pl-1 pr-0.5 cursor-se-resize text-zinc-600 hover:text-zinc-300 transition-colors"
            title="Resize window"
          >
            <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="currentColor">
              <circle cx="8.5" cy="8.5" r="1" />
              <circle cx="5" cy="8.5" r="1" />
              <circle cx="8.5" cy="5" r="1" />
              <circle cx="1.5" cy="8.5" r="1" />
              <circle cx="5" cy="1.5" r="1" />
              <circle cx="8.5" cy="1.5" r="1" />
            </svg>
          </div>
        </div>
      </footer>
    </Rnd>
  );
};

export default Window;
