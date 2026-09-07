import React, { useState, useEffect, useRef } from "react";
import { useOS } from "../context/OSContext";
import vfs from "../services/vfs";
import "./spotlight/Spotlight.css";

const SYSTEM_ACTIONS = [
  { id: "action-theme-dark", title: "Switch to Dark Mode", icon: "🌙", action: "theme:dark", category: "System" },
  { id: "action-theme-light", title: "Switch to Light Mode", icon: "☀️", action: "theme:light", category: "System" },
  { id: "action-portfolio", title: "View Manas Singh's Developer Portfolio", icon: "🚀", action: "app:portfolio", category: "Developer" },
  { id: "action-taskmanager", title: "Open Task Manager & Telemetry", icon: "📈", action: "app:taskmanager", category: "System" },
  { id: "action-terminal", title: "Launch WebOS Terminal (CLI)", icon: "💻", action: "app:terminal", category: "Applications" },
  { id: "action-explorer", title: "Open File Explorer (VFS)", icon: "📁", action: "app:explorer", category: "Applications" },
  { id: "action-notepad", title: "Open Notepad Editor", icon: "📝", action: "app:notepad", category: "Applications" },
  { id: "action-settings", title: "Open Settings Panel", icon: "⚙️", action: "app:settings", category: "System" },
  { id: "action-vfs-reset", title: "Restore Virtual File System to Defaults", icon: "⚠️", action: "vfs:reset", category: "Storage" },
];

const Spotlight = ({ isOpen, onClose }) => {
  const { openApp, setTheme } = useOS();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Search across actions and VFS files
  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const actionResults = SYSTEM_ACTIONS.filter(
      (a) => !q || a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q)
    );

    // Search files in VFS
    const fileResults = [];
    if (q) {
      const searchNode = (node, path) => {
        if (node.name.toLowerCase().includes(q) && node.type === "file") {
          fileResults.push({
            id: `file-${node.name}`,
            title: node.name,
            icon: "📄",
            category: "VFS Files",
            filePath: [...path, node.name],
            action: "file:open",
          });
        }
        if (node.type === "dir" && node.children) {
          node.children.forEach((c) => searchNode(c, [...path, node.name === "root" ? [] : node.name].flat()));
        }
      };
      searchNode(vfs.root, []);
    }

    return [...actionResults, ...fileResults];
  }, [query]);

  const handleExecute = (item) => {
    if (!item) return;
    onClose();

    if (item.action === "theme:dark") {
      setTheme("dark");
    } else if (item.action === "theme:light") {
      setTheme("light");
    } else if (item.action.startsWith("app:")) {
      const appKey = item.action.replace("app:", "");
      openApp(appKey);
    } else if (item.action === "file:open") {
      openApp("notepad", { filePath: item.filePath, fileName: item.title });
    } else if (item.action === "vfs:reset") {
      vfs.reset();
      alert("Virtual File System restored to factory seed.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, results.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % Math.max(1, results.length));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      handleExecute(results[selectedIndex]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="spotlight-overlay" onClick={onClose}>
      <div className="spotlight-modal" onClick={(e) => e.stopPropagation()} onKeyDown={handleKeyDown}>
        <div className="spotlight-input-wrap">
          <span className="spotlight-search-icon">🔍</span>
          <input
            ref={inputRef}
            type="text"
            className="spotlight-input"
            placeholder="Type a command, launch an app, or search files..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            spellCheck="false"
          />
          <kbd className="spotlight-kbd">ESC to close</kbd>
        </div>

        <div className="spotlight-results">
          {results.map((item, index) => {
            const isSelected = index === selectedIndex;
            return (
              <div
                key={item.id}
                className={`spotlight-item ${isSelected ? "selected" : ""}`}
                onClick={() => handleExecute(item)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <span className="item-icon">{item.icon}</span>
                <span className="item-title">{item.title}</span>
                <span className="item-category">{item.category}</span>
              </div>
            );
          })}

          {results.length === 0 && (
            <div className="spotlight-empty">No commands or files found matching "{query}"</div>
          )}
        </div>

        <div className="spotlight-footer">
          <span>Navigate with <kbd>↑</kbd> <kbd>↓</kbd></span>
          <span>Select with <kbd>↵ Enter</kbd></span>
        </div>
      </div>
    </div>
  );
};

export default Spotlight;
