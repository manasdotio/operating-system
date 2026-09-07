import React, { useState, useRef, useEffect } from "react";
import vfs from "../services/vfs";
import { useOS } from "../context/OSContext";
import "./terminal/Terminal.css";

const BANNER = `
   __      __      ___.    ________    _________
  /  \\    /  \\ ____\\_ |__  \\_____  \\  /   _____/
  \\   \\/\\/   // __ \\| __ \\  /   |   \\ \\_____  \\ 
   \\        /|  ___/| \\_\\ \\/    |    \\/        \\
    \\__/\\  /  \\___  >___  /\\_______  /_______  /
         \\/       \\/    \\/         \\/        \\/ 
      WebOS Virtual Shell [v1.2.0-release]
Type 'help' for available commands or 'neofetch' for system info.
`;

const COMMANDS = [
  "help",
  "ls",
  "dir",
  "cd",
  "pwd",
  "cat",
  "echo",
  "touch",
  "mkdir",
  "rm",
  "ps",
  "kill",
  "open",
  "neofetch",
  "sysinfo",
  "theme",
  "clear",
  "cls",
  "date",
  "whoami",
  "vfs-reset",
  "resume",
  "hire",
];

const Terminal = ({ isActive, setStatusText }) => {
  const { processes, killProcess, openApp, theme, setTheme } = useOS();
  const [cwd, setCwd] = useState([]); // [] = root/home
  const [history, setHistory] = useState([
    { type: "banner", text: BANNER },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [cmdHistory, setCmdHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalBodyRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll directly on container without any dummy placeholder divs
  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [history]);

  // Auto-focus on mount
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, []);

  // Auto-focus whenever the window is brought to active state
  useEffect(() => {
    if (isActive) {
      inputRef.current?.focus();
    }
  }, [isActive]);

  // Sync status bar telemetry
  useEffect(() => {
    if (setStatusText) {
      const pathStr = cwd.length === 0 ? "~" : `~/${cwd.join("/")}`;
      setStatusText(`CWD: ${pathStr} • Tab to auto-complete • Type 'help'`);
    }
  }, [cwd, setStatusText]);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const handleContainerKeyDown = (e) => {
    if (document.activeElement !== inputRef.current && !e.ctrlKey && !e.altKey && !e.metaKey) {
      inputRef.current?.focus();
    }
  };

  const getPrompt = () => {
    const p = cwd.length === 0 ? "~" : `~/${cwd.join("/")}`;
    return `user@webos:${p}$ `;
  };

  const handleCommand = (rawInput) => {
    const trimmed = rawInput.trim();
    if (!trimmed) {
      setHistory((prev) => [...prev, { type: "prompt", prompt: getPrompt(), text: "" }]);
      return;
    }

    setCmdHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);

    const parts = trimmed.split(" ");
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    const newEntries = [{ type: "prompt", prompt: getPrompt(), text: trimmed }];

    switch (cmd) {
      case "help": {
        newEntries.push({
          type: "output",
          text: `Available commands:
  ls, dir            List files and directories
  cd <dir>           Change directory ('..', '~', or dirname)
  pwd                Print current working directory
  cat <file>         Print file contents
  echo <txt> [> fl]  Echo text or redirect to file
  touch <file>       Create an empty file
  mkdir <dir>        Create a new directory
  rm [-rf] <name>    Delete a file or directory
  ps                 List active windows and Process IDs (PIDs)
  kill <pid>         Terminate a running process/window by PID
  open <app>         Launch an application (e.g. 'open notepad')
  neofetch, sysinfo  Display system specifications and ASCII banner
  theme [dark|light] Switch OS desktop theme
  date               Show current system date and time
  whoami             Display current logged in user
  resume, hire       View developer resume and launch Portfolio app
  vfs-reset          Reset the Virtual File System to defaults
  clear, cls         Clear terminal screen`,
        });
        break;
      }

      case "clear":
      case "cls": {
        setHistory([]);
        return;
      }

      case "pwd": {
        newEntries.push({
          type: "output",
          text: "/" + cwd.join("/"),
        });
        break;
      }

      case "ls":
      case "dir": {
        try {
          const items = vfs.readDir(cwd);
          if (items.length === 0) {
            newEntries.push({ type: "output", text: "(directory is empty)" });
          } else {
            const formatted = items
              .map((item) => {
                const prefix = item.type === "dir" ? "[DIR]  " : "[FILE] ";
                const sizeStr = item.type === "file" ? ` (${item.size || 0} bytes)` : "";
                return `${prefix.padEnd(8)} ${item.name}${sizeStr}`;
              })
              .join("\n");
            newEntries.push({ type: "output", text: formatted });
          }
        } catch (err) {
          newEntries.push({ type: "error", text: err.message });
        }
        break;
      }

      case "cd": {
        const target = args[0];
        if (!target || target === "~" || target === "/") {
          setCwd([]);
        } else if (target === "..") {
          setCwd((prev) => (prev.length > 0 ? prev.slice(0, -1) : []));
        } else {
          const next = vfs.resolvePath(cwd, target);
          const node = vfs.getNode(next);
          if (!node) {
            newEntries.push({ type: "error", text: `cd: no such directory: ${target}` });
          } else if (node.type !== "dir") {
            newEntries.push({ type: "error", text: `cd: not a directory: ${target}` });
          } else {
            setCwd(next);
          }
        }
        break;
      }

      case "cat": {
        if (!args[0]) {
          newEntries.push({ type: "error", text: "cat: missing file operand" });
        } else {
          try {
            const filePath = vfs.resolvePath(cwd, args[0]);
            const content = vfs.readFile(filePath);
            newEntries.push({ type: "output", text: content });
          } catch (err) {
            newEntries.push({ type: "error", text: `cat: ${err.message}` });
          }
        }
        break;
      }

      case "echo": {
        const redirectIndex = args.indexOf(">");
        if (redirectIndex !== -1) {
          const text = args.slice(0, redirectIndex).join(" ").replace(/^["']|["']$/g, "");
          const fileName = args[redirectIndex + 1];
          if (!fileName) {
            newEntries.push({ type: "error", text: "echo: missing destination file after '>'" });
          } else {
            try {
              const targetPath = vfs.resolvePath(cwd, fileName);
              vfs.writeFile(targetPath, text);
              newEntries.push({ type: "output", text: `Saved to ${fileName}` });
            } catch (err) {
              newEntries.push({ type: "error", text: `echo: ${err.message}` });
            }
          }
        } else {
          newEntries.push({
            type: "output",
            text: args.join(" ").replace(/^["']|["']$/g, ""),
          });
        }
        break;
      }

      case "touch": {
        if (!args[0]) {
          newEntries.push({ type: "error", text: "touch: missing file operand" });
        } else {
          try {
            const targetPath = vfs.resolvePath(cwd, args[0]);
            vfs.writeFile(targetPath, "");
            newEntries.push({ type: "output", text: `Created file '${args[0]}'` });
          } catch (err) {
            newEntries.push({ type: "error", text: `touch: ${err.message}` });
          }
        }
        break;
      }

      case "mkdir": {
        if (!args[0]) {
          newEntries.push({ type: "error", text: "mkdir: missing directory name" });
        } else {
          try {
            const targetPath = vfs.resolvePath(cwd, args[0]);
            vfs.mkdir(targetPath);
            newEntries.push({ type: "output", text: `Created directory '${args[0]}'` });
          } catch (err) {
            newEntries.push({ type: "error", text: `mkdir: ${err.message}` });
          }
        }
        break;
      }

      case "rm": {
        const target = args[0] === "-rf" ? args[1] : args[0];
        if (!target) {
          newEntries.push({ type: "error", text: "rm: missing operand" });
        } else {
          try {
            const targetPath = vfs.resolvePath(cwd, target);
            vfs.unlink(targetPath);
            newEntries.push({ type: "output", text: `Removed '${target}'` });
          } catch (err) {
            newEntries.push({ type: "error", text: `rm: ${err.message}` });
          }
        }
        break;
      }

      case "ps": {
        if (processes.length === 0) {
          newEntries.push({ type: "output", text: "No active user processes/windows running." });
        } else {
          const header = "PID    APP ID        STATUS        WINDOW TITLE\n------------------------------------------------";
          const rows = processes
            .map((p) => {
              const status = p.minimized ? "MINIMIZED" : "ACTIVE";
              return `${String(p.pid).padEnd(6)} ${p.appId.padEnd(13)} ${status.padEnd(13)} ${p.name}`;
            })
            .join("\n");
          newEntries.push({ type: "output", text: `${header}\n${rows}` });
        }
        break;
      }

      case "kill": {
        const pid = args[0];
        if (!pid) {
          newEntries.push({ type: "error", text: "kill: missing PID. Usage: kill <pid>" });
        } else {
          const numPid = Number(pid);
          const found = processes.find((p) => p.pid === numPid);
          if (!found) {
            newEntries.push({ type: "error", text: `kill: process with PID ${pid} not found` });
          } else {
            killProcess(numPid);
            newEntries.push({ type: "output", text: `Process [${pid}] (${found.name}) terminated.` });
          }
        }
        break;
      }

      case "open": {
        const appKey = args[0]?.toLowerCase();
        if (!appKey) {
          newEntries.push({
            type: "error",
            text: "open: missing app name. Available: notepad, explorer, camera, settings, photos, edge, terminal",
          });
        } else {
          openApp(appKey);
          newEntries.push({ type: "output", text: `Launched app: ${appKey}` });
        }
        break;
      }

      case "neofetch":
      case "sysinfo": {
        const stats = vfs.getStorageStats();
        const mem = performance?.memory
          ? `${Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)} MB / ${Math.round(
              performance.memory.jsHeapSizeLimit / 1024 / 1024
            )} MB`
          : "Browser Sandboxed";

        const info = `
  /\\_/\\      OS: WebOS Simulator v1.2
 ( o.o )     Kernel: React 19.x Virtual DOM Engine
  > ^ <      Shell: WebOS CLI (Bash Emulator)
             Resolution: ${window.innerWidth}x${window.innerHeight}
             Theme: ${theme}
             VFS Files: ${stats.fileCount} files, ${stats.dirCount} directories (${stats.totalBytes} bytes)
             Memory: ${mem}
             Uptime: ${Math.round(performance.now() / 1000)}s
        `;
        newEntries.push({ type: "output", text: info });
        break;
      }

      case "theme": {
        const val = args[0]?.toLowerCase();
        if (val === "dark" || val === "light") {
          setTheme(val);
          newEntries.push({ type: "output", text: `Theme set to: ${val}` });
        } else {
          newEntries.push({ type: "output", text: `Current theme: ${theme}. Usage: theme [dark|light]` });
        }
        break;
      }

      case "date": {
        newEntries.push({ type: "output", text: new Date().toString() });
        break;
      }

      case "whoami": {
        newEntries.push({ type: "output", text: "guest@webos (Administrator)" });
        break;
      }

      case "vfs-reset": {
        vfs.reset();
        setCwd([]);
        newEntries.push({ type: "output", text: "Virtual File System restored to factory seed." });
        break;
      }

      case "resume":
      case "hire": {
        newEntries.push({
          type: "output",
          text: `=====================================================
  MANAS SINGH - FULL STACK & SYSTEM ARCHITECT
  GitHub: github.com/manascodr | WebOS Core Developer
=====================================================
  [+] React 19, Vite, SCSS, POSIX Virtual File System
  [+] Window Management, Process Isolation, Spotlight
  [+] Ready for full-time frontend/full-stack engineering roles!

  Opening interactive Portfolio window...`,
        });
        openApp("portfolio");
        break;
      }

      default: {
        newEntries.push({
          type: "error",
          text: `webos: command not found: ${cmd}. Type 'help' for available commands.`,
        });
        break;
      }
    }

    setHistory((prev) => [...prev, ...newEntries]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleCommand(inputVal);
      setInputVal("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const nextIdx = historyIndex === -1 ? cmdHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIdx);
      setInputVal(cmdHistory[nextIdx]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIdx = historyIndex + 1;
      if (nextIdx >= cmdHistory.length) {
        setHistoryIndex(-1);
        setInputVal("");
      } else {
        setHistoryIndex(nextIdx);
        setInputVal(cmdHistory[nextIdx]);
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const current = inputVal.trimStart();
      if (!current) return;

      const tokens = current.split(" ");
      if (tokens.length === 1) {
        // Complete command
        const match = COMMANDS.find((c) => c.startsWith(tokens[0]));
        if (match) setInputVal(match + " ");
      } else {
        // Complete file/dir name in cwd
        try {
          const items = vfs.readDir(cwd);
          const lastToken = tokens[tokens.length - 1];
          const match = items.find((i) => i.name.startsWith(lastToken));
          if (match) {
            tokens[tokens.length - 1] = match.name;
            setInputVal(tokens.join(" ") + (match.type === "dir" ? "/" : " "));
          }
        } catch {
          // ignore
        }
      }
    }
  };

  return (
    <div
      className="terminal-container"
      onClick={focusInput}
      onMouseDown={focusInput}
      onKeyDown={handleContainerKeyDown}
      tabIndex={0}
    >
      {/* Top Terminal Subheader with Shell Tab & Quick Action Chips */}
      <div className="terminal-header-bar">
        <div className="terminal-tabs">
          <div className="terminal-tab active">
            <span className="term-tab-dot">●</span>
            <span className="term-tab-title">webos-sh (bash)</span>
          </div>
        </div>
        <div className="terminal-quick-chips">
          <button type="button" onClick={() => handleCommand("help")} title="Show available commands">
            help
          </button>
          <button type="button" onClick={() => handleCommand("ls")} title="List files">
            ls
          </button>
          <button type="button" onClick={() => handleCommand("neofetch")} title="System Specs">
            neofetch
          </button>
          <button type="button" onClick={() => handleCommand("hire")} title="Developer Portfolio">
            hire
          </button>
          <button type="button" onClick={() => handleCommand("clear")} title="Clear Terminal">
            clear
          </button>
        </div>
      </div>

      {/* Main Terminal Scroll Body */}
      <div className="terminal-body" ref={terminalBodyRef} onClick={focusInput}>
        {history.map((entry, idx) => {
          if (entry.type === "banner") {
            return (
              <pre key={idx} className="term-banner">
                {entry.text}
              </pre>
            );
          }
          if (entry.type === "prompt") {
            return (
              <div key={idx} className="term-line">
                <span className="term-prompt">{entry.prompt}</span>
                <span className="term-cmd">{entry.text}</span>
              </div>
            );
          }
          if (entry.type === "error") {
            return (
              <div key={idx} className="term-error">
                {entry.text}
              </div>
            );
          }
          return (
            <pre key={idx} className="term-output">
              {entry.text}
            </pre>
          );
        })}

        <div className="term-input-line">
          <span className="term-prompt">{getPrompt()}</span>
          <input
            ref={inputRef}
            type="text"
            className="term-input"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            spellCheck="false"
            autoComplete="off"
            aria-label="Terminal command line input"
          />
        </div>
      </div>
    </div>
  );
};

export default Terminal;
