import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import "../utils/css/Explorer.scss";
import vfs from "../services/vfs";
import { useOS } from "../context/OSContext";

const formatSize = (b) => {
  if (b == null) return "";
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / 1024 / 1024).toFixed(1) + " MB";
};

const formatDate = (ts) => (ts ? new Date(ts).toLocaleString() : "");

const getFileIcon = (name, isDir) => {
  if (isDir) return "📁";
  const ext = name.split(".").pop().toLowerCase();
  switch (ext) {
    case "txt":
    case "md":
    case "log":
      return "📝";
    case "png":
    case "jpg":
    case "jpeg":
    case "webp":
      return "🖼️";
    case "svg":
      return "🎨";
    case "docx":
    case "doc":
      return "📄";
    case "xlsx":
    case "csv":
      return "📊";
    case "pdf":
      return "📕";
    case "mp3":
    case "wav":
      return "🎵";
    case "mp4":
    case "mkv":
      return "🎬";
    case "exe":
      return "⚙️";
    case "js":
    case "jsx":
    case "json":
      return "💻";
    default:
      return "📄";
  }
};

const QUICK_ACCESS = [
  { name: "Home", path: [], icon: "🏠" },
  { name: "Documents", path: ["Documents"], icon: "📄" },
  { name: "Downloads", path: ["Downloads"], icon: "📥" },
  { name: "Pictures", path: ["Pictures"], icon: "🖼️" },
  { name: "Music", path: ["Music"], icon: "🎵" },
  { name: "Videos", path: ["Videos"], icon: "🎬" },
];

const Explorer = ({ setStatusText }) => {
  const { openApp } = useOS();
  const [fsVersion, setFsVersion] = useState(0);
  const [path, setPath] = useState([]);
  const [history, setHistory] = useState([[]]);
  const [hIndex, setHIndex] = useState(0);
  const [view, setView] = useState("icons"); // icons | details
  const [sort, setSort] = useState("name");
  const [asc, setAsc] = useState(true);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState([]); // names in current folder
  const [renaming, setRenaming] = useState(null);
  const [clipboard, setClipboard] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showPreviewPane, setShowPreviewPane] = useState(true);
  const contentRef = useRef(null);
  const contextPosRef = useRef({ x: 0, y: 0 });
  const [ctxOpen, setCtxOpen] = useState(false);

  // Subscribe to VFS modifications
  useEffect(() => {
    const unsubscribe = vfs.subscribe(() => {
      setFsVersion((v) => v + 1);
    });
    return unsubscribe;
  }, []);

  const current = useMemo(() => {
    void fsVersion;
    return vfs.getNode(path) || vfs.root;
  }, [path, fsVersion]);

  const items = useMemo(() => {
    if (!current || current.type !== "dir" || !current.children) return [];
    let list = [...current.children];
    if (filter.trim()) {
      const f = filter.toLowerCase();
      list = list.filter((i) => i.name.toLowerCase().includes(f));
    }
    list.sort((a, b) => {
      let va, vb;
      switch (sort) {
        case "type":
          va = a.type;
          vb = b.type;
          break;
        case "size":
          va = a.size || 0;
          vb = b.size || 0;
          break;
        case "modified":
          va = a.modified || 0;
          vb = b.modified || 0;
          break;
        default:
          va = a.name.toLowerCase();
          vb = b.name.toLowerCase();
      }
      if (va < vb) return asc ? -1 : 1;
      if (va > vb) return asc ? 1 : -1;
      return 0;
    });
    return list;
  }, [current, filter, sort, asc]);

  const selectedItem = useMemo(() => {
    if (selected.length !== 1) return null;
    return items.find((i) => i.name === selected[0]) || null;
  }, [selected, items]);

  useEffect(() => {
    if (setStatusText) {
      const selStr = selected.length > 0 ? ` • ${selected.length} selected` : "";
      const pathStr = path.length === 0 ? "Local Disk (C:)" : `/${path.join("/")}`;
      setStatusText(`${items.length} items${selStr} in ${pathStr}`);
    }
  }, [items.length, selected.length, path, setStatusText]);

  const pushHistory = (nextPath) => {
    const trimmed = history.slice(0, hIndex + 1);
    trimmed.push(nextPath);
    setHistory(trimmed);
    setHIndex(trimmed.length - 1);
  };

  const navigate = (nextPath) => {
    setPath(nextPath);
    pushHistory(nextPath);
    setSelected([]);
    setRenaming(null);
  };

  const openItem = (item) => {
    if (item.type === "dir") {
      navigate([...path, item.name]);
    } else {
      const filePath = [...path, item.name];
      const isText = /\.(txt|md|js|jsx|json|html|css|scss|log|py|csv)$/i.test(item.name);
      if (isText) {
        openApp("notepad", { filePath, fileName: item.name });
      } else if (/\.(png|jpg|jpeg|webp|svg)$/i.test(item.name)) {
        openApp("photos");
      } else {
        alert(`File: ${item.name}\nSize: ${formatSize(item.size)}\nType: ${item.mimeType || "Binary"}`);
      }
    }
  };

  const goUp = () => {
    if (!path.length) return;
    navigate(path.slice(0, -1));
  };

  const handleSort = (field) => {
    if (sort === field) {
      setAsc((prev) => !prev);
    } else {
      setSort(field);
      setAsc(true);
    }
  };

  const back = () => {
    if (hIndex > 0) {
      const ni = hIndex - 1;
      setHIndex(ni);
      setPath(history[ni]);
      setSelected([]);
    }
  };

  const forward = () => {
    if (hIndex < history.length - 1) {
      const ni = hIndex + 1;
      setHIndex(ni);
      setPath(history[ni]);
      setSelected([]);
    }
  };

  const createFolder = () => {
    const base = "New folder";
    let name = base;
    let i = 1;
    while (current.children?.some((c) => c.name === name)) {
      name = `${base} (${i++})`;
    }
    try {
      vfs.mkdir([...path, name]);
      setRenaming(name);
      setSelected([name]);
    } catch (err) {
      alert(err.message);
    }
  };

  const createNewTextFile = () => {
    const base = "New Text Document.txt";
    let name = base;
    let i = 1;
    while (current.children?.some((c) => c.name === name)) {
      name = `New Text Document (${i++}).txt`;
    }
    try {
      vfs.writeFile([...path, name], "");
      setRenaming(name);
      setSelected([name]);
    } catch (err) {
      alert(err.message);
    }
  };

  const startRename = () => {
    if (selected.length === 1) setRenaming(selected[0]);
  };

  const applyRename = (oldName, newName) => {
    newName = newName.trim();
    if (!newName || newName === oldName) {
      setRenaming(null);
      return;
    }
    try {
      vfs.rename([...path, oldName], newName);
      setSelected([newName]);
    } catch (err) {
      alert(err.message);
    } finally {
      setRenaming(null);
    }
  };

  const deleteItems = () => {
    if (!selected.length) return;
    if (!window.confirm(`Delete ${selected.length} selected item(s)?`)) return;
    try {
      selected.forEach((name) => {
        vfs.unlink([...path, name]);
      });
      setSelected([]);
      setRenaming(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const copyCut = (mode) => {
    if (!selected.length) return;
    setClipboard({ mode, items: [...selected], from: [...path] });
  };

  const paste = () => {
    if (!clipboard) return;
    try {
      clipboard.items.forEach((name) => {
        const sourcePath = [...clipboard.from, name];
        const sourceNode = vfs.getNode(sourcePath);
        if (!sourceNode) return;

        let finalName = name;
        let idx = 1;
        while (current.children?.some((c) => c.name === finalName)) {
          const extIdx = name.lastIndexOf(".");
          if (extIdx > 0) {
            const baseName = name.slice(0, extIdx);
            const ext = name.slice(extIdx);
            finalName = `${baseName} - Copy${idx > 1 ? ` (${idx})` : ""}${ext}`;
          } else {
            finalName = `${name} - Copy${idx > 1 ? ` (${idx})` : ""}`;
          }
          idx++;
        }

        if (clipboard.mode === "copy") {
          if (sourceNode.type === "file") {
            vfs.writeFile([...path, finalName], sourceNode.content || "", sourceNode.mimeType);
          } else {
            vfs.mkdir([...path, finalName]);
          }
        } else if (clipboard.mode === "cut") {
          if (sourceNode.type === "file") {
            vfs.writeFile([...path, finalName], sourceNode.content || "", sourceNode.mimeType);
            vfs.unlink(sourcePath);
          } else {
            vfs.unlink(sourcePath);
            vfs.mkdir([...path, finalName]);
          }
        }
      });
      if (clipboard.mode === "cut") setClipboard(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      try {
        const isText = file.type.startsWith("text/") || /\.(txt|md|json|js|html|css|csv)$/i.test(file.name);
        if (isText) {
          const text = await file.text();
          vfs.writeFile([...path, file.name], text, file.type || "text/plain");
        } else {
          const reader = new FileReader();
          reader.onload = () => {
            vfs.writeFile([...path, file.name], reader.result, file.type);
          };
          reader.readAsDataURL(file);
        }
      } catch (err) {
        console.error("Error ingesting host file:", err);
      }
    }
  };

  const handleSelect = (e, item) => {
    e.stopPropagation();
    if (e.ctrlKey) {
      setSelected((s) => (s.includes(item.name) ? s.filter((n) => n !== item.name) : [...s, item.name]));
    } else {
      setSelected([item.name]);
    }
    setRenaming(null);
  };

  const clearSelection = () => {
    setSelected([]);
    setRenaming(null);
  };

  const handleKey = useCallback(
    (e) => {
      if (e.key === "F2") {
        startRename();
        e.preventDefault();
      } else if (e.key === "Delete") {
        deleteItems();
      } else if (e.key === "Enter" && selected.length === 1) {
        const it = items.find((i) => i.name === selected[0]);
        if (it) openItem(it);
      } else if (e.key === "Backspace") {
        goUp();
      } else if (e.ctrlKey && e.key.toLowerCase() === "c") copyCut("copy");
      else if (e.ctrlKey && e.key.toLowerCase() === "x") copyCut("cut");
      else if (e.ctrlKey && e.key.toLowerCase() === "v") paste();
      else if (e.ctrlKey && e.key.toLowerCase() === "n") createFolder();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, selected, clipboard, path]
  );

  const openContext = (e) => {
    e.preventDefault();
    contextPosRef.current = { x: e.clientX, y: e.clientY };
    setCtxOpen(true);
  };

  const breadcrumbs = useMemo(() => ["This PC", ...path], [path]);

  const gotoCrumb = (i) => {
    if (i === 0) navigate([]);
    else navigate(path.slice(0, i));
  };

  const isAtRoot = path.length === 0;

  return (
    <div className="explorer-shell" onKeyDown={handleKey} tabIndex={0} onClick={() => setCtxOpen(false)}>
      {/* Top Navigation & Action Toolbar */}
      <div className="ex-toolbar">
        <div className="nav">
          <button onClick={back} disabled={hIndex === 0} title="Back">
            ←
          </button>
          <button onClick={forward} disabled={hIndex === history.length - 1} title="Forward">
            →
          </button>
          <button onClick={goUp} disabled={!path.length} title="Up">
            ⬆
          </button>
        </div>
        <div className="address-bar">
          {breadcrumbs.map((c, i) => (
            <span key={i} className="crumb" onClick={() => gotoCrumb(i)}>
              {c}
              {i < breadcrumbs.length - 1 && <span className="sep">›</span>}
            </span>
          ))}
        </div>
        <div className="actions">
          <button onClick={createFolder} title="New Folder">
            📁 New Folder
          </button>
          <button onClick={createNewTextFile} title="New Text Document">
            📄 New Document
          </button>
          <button onClick={() => setView((v) => (v === "icons" ? "details" : "icons"))} title="Toggle View">
            {view === "icons" ? "☰ Details" : "🔳 Icons"}
          </button>
          <button
            onClick={() => setShowPreviewPane((p) => !p)}
            className={showPreviewPane ? "btn-active" : ""}
            title="Toggle Details Pane"
          >
            📋 Details Pane
          </button>
          <input
            className="filter"
            placeholder="Search files..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="ex-body">
        {/* Left Sidebar: Quick Access & Drives */}
        <div className="tree">
          <div className="nav-group-title">Quick Access</div>
          {QUICK_ACCESS.map((qa) => {
            const isMatch =
              (qa.path.length === 0 && path.length === 0) ||
              (qa.path.length > 0 && path[0] === qa.path[0]);
            return (
              <div
                key={qa.name}
                className={`tree-item ${isMatch ? "active" : ""}`}
                onClick={() => navigate(qa.path)}
              >
                <span className="tree-ico">{qa.icon}</span>
                <span className="tree-lbl">{qa.name}</span>
              </div>
            );
          })}

          <div className="nav-group-title">This PC</div>
          <div
            className={`tree-item ${path.length === 0 ? "active" : ""}`}
            onClick={() => navigate([])}
          >
            <span className="tree-ico">🖥️</span>
            <span className="tree-lbl">Local Disk (C:)</span>
          </div>
          <div
            className="tree-item"
            onClick={() => navigate(["Documents"])}
          >
            <span className="tree-ico">💾</span>
            <span className="tree-lbl">Virtual VFS Drive</span>
          </div>

          <div className="nav-group-title">System</div>
          <div className="tree-item" onClick={() => navigate(["Downloads"])}>
            <span className="tree-ico">🗑️</span>
            <span className="tree-lbl">Recycle Bin</span>
          </div>
        </div>

        {/* Center: File Browser Area */}
        <div
          className={`content-wrapper ${isDragOver ? "drag-over" : ""}`}
          onContextMenu={openContext}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isDragOver && (
            <div className="drag-overlay">
              <p>Drop files here to upload into VFS</p>
            </div>
          )}

          {/* If at root, show Devices & Drives overview card */}
          {isAtRoot && !filter && (
            <div className="drives-section">
              <div className="section-title">Devices and drives</div>
              <div className="drive-card" onDoubleClick={() => navigate(["Documents"])}>
                <div className="drive-icon">🖥️</div>
                <div className="drive-info">
                  <div className="drive-name">Local Disk (C:)</div>
                  <div className="drive-progress-bar">
                    <div className="drive-progress-fill" style={{ width: "34%" }} />
                  </div>
                  <div className="drive-space">338 GB free of 512 GB</div>
                </div>
              </div>
              <div className="drive-card" onDoubleClick={() => navigate(["Downloads"])}>
                <div className="drive-icon">💾</div>
                <div className="drive-info">
                  <div className="drive-name">VFS Storage (D:)</div>
                  <div className="drive-progress-bar">
                    <div className="drive-progress-fill" style={{ width: "12%" }} />
                  </div>
                  <div className="drive-space">4.8 MB used of 10 MB quota</div>
                </div>
              </div>
            </div>
          )}

          {view === "details" && (
            <div className="details-header">
              <div className="col name" onClick={() => handleSort("name")}>
                Name {sort === "name" && (asc ? "▲" : "▼")}
              </div>
              <div className="col type" onClick={() => handleSort("type")}>
                Type {sort === "type" && (asc ? "▲" : "▼")}
              </div>
              <div className="col size" onClick={() => handleSort("size")}>
                Size {sort === "size" && (asc ? "▲" : "▼")}
              </div>
              <div className="col modified" onClick={() => handleSort("modified")}>
                Date modified {sort === "modified" && (asc ? "▲" : "▼")}
              </div>
            </div>
          )}

          <div
            className={`ex-content view-${view}`}
            ref={contentRef}
            onClick={(e) => {
              if (e.target === contentRef.current) clearSelection();
            }}
          >
            {isAtRoot && !filter && (
              <div className="section-title" style={{ gridColumn: "1 / -1", margin: "6px 0 2px" }}>
                Folders & Files
              </div>
            )}

            {items.map((item) => {
              const sel = selected.includes(item.name);
              const ren = renaming === item.name;
              const icon = getFileIcon(item.name, item.type === "dir");
              return (
                <div
                  key={item.name}
                  className={`entry ${item.type} ${sel ? "selected" : ""}`}
                  onDoubleClick={() => openItem(item)}
                  onClick={(e) => handleSelect(e, item)}
                  title={item.name}
                >
                  <div className="ico">{icon}</div>
                  {ren ? (
                    <input
                      autoFocus
                      defaultValue={item.name}
                      onBlur={(e) => applyRename(item.name, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") applyRename(item.name, e.currentTarget.value);
                        if (e.key === "Escape") setRenaming(null);
                      }}
                    />
                  ) : (
                    <div className="label">{item.name}</div>
                  )}
                  {view === "details" && (
                    <>
                      <div className="col type">{item.type === "dir" ? "File folder" : "File"}</div>
                      <div className="col size">{item.type === "file" ? formatSize(item.size) : ""}</div>
                      <div className="col modified">{formatDate(item.modified)}</div>
                    </>
                  )}
                </div>
              );
            })}

            {!items.length && (
              <div className="empty-state">
                <div className="empty-icon">📂</div>
                <h3>This folder is empty</h3>
                <p>Drag & drop files from your desktop here, or create a new file or folder using the toolbar.</p>
                <div className="empty-actions">
                  <button className="btn-empty" onClick={createFolder}>
                    📁 New Folder
                  </button>
                  <button className="btn-empty" onClick={createNewTextFile}>
                    📄 New Document
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Details & Preview Pane */}
        {showPreviewPane && (
          <div className="preview-pane">
            <div className="preview-header">Details</div>
            {selectedItem ? (
              <div className="preview-body">
                <div className="preview-icon">
                  {getFileIcon(selectedItem.name, selectedItem.type === "dir")}
                </div>
                <div className="preview-name">{selectedItem.name}</div>
                <div className="preview-meta">
                  <div className="meta-row">
                    <span className="meta-label">Type:</span>
                    <span className="meta-val">
                      {selectedItem.type === "dir" ? "File folder" : selectedItem.mimeType || "Document"}
                    </span>
                  </div>
                  {selectedItem.type === "file" && (
                    <div className="meta-row">
                      <span className="meta-label">Size:</span>
                      <span className="meta-val">{formatSize(selectedItem.size)}</span>
                    </div>
                  )}
                  <div className="meta-row">
                    <span className="meta-label">Modified:</span>
                    <span className="meta-val">{formatDate(selectedItem.modified)}</span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-label">Location:</span>
                    <span className="meta-val">/{path.join("/")}</span>
                  </div>
                </div>

                <div className="preview-actions">
                  <button className="preview-btn" onClick={() => openItem(selectedItem)}>
                    {selectedItem.type === "dir" ? "Open Folder" : "Open in App"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="preview-empty">
                <p>Select a file or folder to view its details and properties.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Context Menu */}
      {ctxOpen && (
        <ul
          className="ctx-menu"
          style={{ left: contextPosRef.current.x, top: contextPosRef.current.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <li onClick={createFolder}>📁 New Folder</li>
          <li onClick={createNewTextFile}>📄 New Text Document</li>
          <li onClick={startRename} className={selected.length !== 1 ? "disabled" : ""}>
            ✏️ Rename
          </li>
          <li onClick={() => copyCut("copy")} className={!selected.length ? "disabled" : ""}>
            📋 Copy
          </li>
          <li onClick={() => copyCut("cut")} className={!selected.length ? "disabled" : ""}>
            ✂️ Cut
          </li>
          <li onClick={paste} className={!clipboard ? "disabled" : ""}>
            📥 Paste
          </li>
          <li onClick={deleteItems} className={!selected.length ? "disabled" : ""}>
            🗑️ Delete
          </li>
          <li onClick={() => setCtxOpen(false)}>Close</li>
        </ul>
      )}
    </div>
  );
};

export default Explorer;