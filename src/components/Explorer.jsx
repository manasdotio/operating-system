import React, { useState, useMemo, useCallback, useRef } from "react";
import "../utils/css/Explorer.scss";

/* -------- Virtual FS Seed -------- */
const seed = () => ({
  type: "dir",
  name: "root",
  children: [
    {
      type: "dir",
      name: "Documents",
      children: [
        { type: "file", name: "resume.docx", size: 12345, modified: Date.now() - 86400000 },
        { type: "file", name: "notes.txt", size: 950, modified: Date.now() - 3600000 }
      ],
      modified: Date.now() - 860000
    },
    {
      type: "dir",
      name: "Pictures",
      children: [
        { type: "file", name: "holiday.png", size: 202312, modified: Date.now() - 7200000 },
        { type: "file", name: "logo.svg", size: 934, modified: Date.now() - 220000 }
      ],
      modified: Date.now() - 840000
    },
    {
      type: "file",
      name: "readme.md",
      size: 321,
      modified: Date.now() - 500000
    }
  ],
  modified: Date.now() - 900000
});

const clone = (o) => JSON.parse(JSON.stringify(o));

const getNode = (root, pathArr) => {
  if (!pathArr.length) return root;
  let n = root;
  for (const seg of pathArr) {
    if (!n.children) return null;
    n = n.children.find(c => c.name === seg);
    if (!n) return null;
  }
  return n;
};

const formatSize = (b) => {
  if (b == null) return "";
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / 1024 / 1024).toFixed(1) + " MB";
};

const formatDate = (ts) => new Date(ts).toLocaleString();

/* -------- Component -------- */
const Explorer = () => {
  const [fs, setFs] = useState(seed);
  const [path, setPath] = useState([]);
  const [history, setHistory] = useState([[]]);
  const [hIndex, setHIndex] = useState(0);
  const [view, setView] = useState("icons"); // icons | details
  const [sort, setSort] = useState("name");
  const [asc, setAsc] = useState(true);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState([]); // names in current folder
  const [renaming, setRenaming] = useState(null);
  const [clipboard, setClipboard] = useState(null); // {mode:'copy'|'cut', items:[names]}
  const contentRef = useRef(null);
  const contextPosRef = useRef({ x: 0, y: 0 });
  const [ctxOpen, setCtxOpen] = useState(false);

  const current = useMemo(() => getNode(fs, path) || fs, [fs, path]);

  const items = useMemo(() => {
    if (!current.children) return [];
    let list = [...current.children];
    if (filter.trim()) {
      const f = filter.toLowerCase();
      list = list.filter(i => i.name.toLowerCase().includes(f));
    }
    list.sort((a, b) => {
      let va, vb;
      switch (sort) {
        case "type": va = a.type; vb = b.type; break;
        case "size": va = a.size || 0; vb = b.size || 0; break;
        case "modified": va = a.modified; vb = b.modified; break;
        default: va = a.name.toLowerCase(); vb = b.name.toLowerCase();
      }
      if (va < vb) return asc ? -1 : 1;
      if (va > vb) return asc ? 1 : -1;
      return 0;
    });
    return list;
  }, [current, filter, sort, asc]);

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
    if (item.type === "dir") navigate([...path, item.name]);
    else {
      // integrate with other apps here
    }
  };

  const goUp = () => {
    if (!path.length) return;
    navigate(path.slice(0, -1));
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
    const draft = clone(fs);
    const parent = getNode(draft, path);
    const base = "New folder";
    let name = base;
    let i = 1;
    while (parent.children.some(c => c.name === name)) {
      name = `${base} (${i++})`;
    }
    parent.children.push({ type: "dir", name, children: [], modified: Date.now() });
    setFs(draft);
    setRenaming(name);
    setSelected([name]);
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
    const draft = clone(fs);
    const parent = getNode(draft, path);
    if (parent.children.some(c => c.name === newName)) {
      alert("Name already exists");
      return;
    }
    const node = parent.children.find(c => c.name === oldName);
    node.name = newName;
    node.modified = Date.now();
    setFs(draft);
    setSelected([newName]);
    setRenaming(null);
  };

  const deleteItems = () => {
    if (!selected.length) return;
    if (!window.confirm("Delete selected item(s)?")) return;
    const draft = clone(fs);
    const parent = getNode(draft, path);
    parent.children = parent.children.filter(c => !selected.includes(c.name));
    parent.modified = Date.now();
    setFs(draft);
    setSelected([]);
    setRenaming(null);
  };

  const copyCut = (mode) => {
    if (!selected.length) return;
    setClipboard({ mode, items: [...selected], from: [...path] });
  };

  const paste = () => {
    if (!clipboard) return;
    const draft = clone(fs);
    const target = getNode(draft, path);
    const sourceParent = getNode(draft, clipboard.from);
    clipboard.items.forEach(name => {
      const node = sourceParent.children.find(c => c.name === name);
      if (!node) return;
      let copyNode = node;
      if (clipboard.mode === "copy") copyNode = clone(node);
      // name collision
      let base = copyNode.name;
      let finalName = base;
      let idx = 1;
      while (target.children.some(c => c.name === finalName)) {
        const extIdx = base.lastIndexOf(".");
        if (extIdx > 0) {
          const baseName = base.slice(0, extIdx);
          const ext = base.slice(extIdx);
          finalName = `${baseName} - Copy${idx > 1 ? ` (${idx})` : ""}${ext}`;
        } else {
          finalName = `${base} - Copy${idx > 1 ? ` (${idx})` : ""}`;
        }
        idx++;
      }
      if (clipboard.mode === "copy") copyNode.name = finalName;
      if (clipboard.mode === "cut") {
        // moving
        if (sourceParent === target) {
          // same folder rename if collision
          if (finalName !== copyNode.name) copyNode.name = finalName;
        } else {
          sourceParent.children = sourceParent.children.filter(c => c !== node);
          copyNode.name = finalName;
          target.children.push(copyNode);
        }
      } else {
        target.children.push(copyNode);
      }
    });
    target.modified = Date.now();
    setFs(draft);
    if (clipboard.mode === "cut") setClipboard(null);
  };

  const handleSelect = (e, item) => {
    e.stopPropagation();
    if (e.ctrlKey) {
      setSelected(s => s.includes(item.name) ? s.filter(n => n !== item.name) : [...s, item.name]);
    } else if (e.shiftKey && selected.length) {
      const names = items.map(i => i.name);
      const last = selected[selected.length - 1];
      const a = names.indexOf(last);
      const b = names.indexOf(item.name);
      if (a >= 0 && b >= 0) {
        const slice = names.slice(Math.min(a, b), Math.max(a, b) + 1);
        setSelected(slice);
      } else {
        setSelected([item.name]);
      }
    } else {
      setSelected([item.name]);
    }
    setRenaming(null);
  };

  const clearSelection = () => {
    setSelected([]);
    setRenaming(null);
  };

  const handleKey = useCallback((e) => {
    if (e.key === "F2") { startRename(); e.preventDefault(); }
    else if (e.key === "Delete") { deleteItems(); }
    else if (e.key === "Enter" && selected.length === 1) {
      const it = items.find(i => i.name === selected[0]);
      if (it) openItem(it);
    } else if (e.key === "Backspace") {
      goUp();
    } else if (e.ctrlKey && e.key.toLowerCase() === "c") copyCut("copy");
    else if (e.ctrlKey && e.key.toLowerCase() === "x") copyCut("cut");
    else if (e.ctrlKey && e.key.toLowerCase() === "v") paste();
    else if (e.ctrlKey && e.key.toLowerCase() === "n") createFolder();
  }, [items, selected, clipboard, path, fs]);

  const openContext = (e) => {
    e.preventDefault();
    contextPosRef.current = { x: e.clientX, y: e.clientY };
    setCtxOpen(true);
  };

  const breadcrumbs = useMemo(() => ["root", ...path], [path]);

  const gotoCrumb = (i) => {
    if (i === 0) navigate([]);
    else navigate(path.slice(0, i));
  };

  const toggleSort = (field) => {
    if (sort === field) setAsc(a => !a);
    else { setSort(field); setAsc(true); }
  };

  return (
    <div className="explorer-shell" onKeyDown={handleKey} tabIndex={0} onClick={() => setCtxOpen(false)}>
      <div className="ex-toolbar">
        <div className="nav">
          <button onClick={back} disabled={hIndex === 0} title="Back">←</button>
            <button onClick={forward} disabled={hIndex === history.length - 1} title="Forward">→</button>
          <button onClick={goUp} disabled={!path.length} title="Up">⬆</button>
        </div>
        <div className="address-bar">
          {breadcrumbs.map((c, i) => (
            <span key={i} className="crumb" onClick={() => gotoCrumb(i)}>
              {c}{i < breadcrumbs.length - 1 && <span className="sep">›</span>}
            </span>
          ))}
        </div>
        <div className="actions">
          <button onClick={createFolder} title="New Folder">📁</button>
          <button onClick={() => setView(v => v === "icons" ? "details" : "icons")} title="View">
            {view === "icons" ? "☰" : "🔳"}
          </button>
          <input
            className="filter"
            placeholder="Search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="ex-body">
        <div className="tree">
          <div className={`tree-item ${path.length === 0 ? "active" : ""}`} onClick={() => navigate([])}>root</div>
          {["Documents", "Pictures"].map(n => (
            <div
              key={n}
              className={`tree-item ${path[0] === n ? "active" : ""}`}
              onClick={() => navigate([n])}
            >{n}</div>
          ))}
        </div>

        <div className="content-wrapper" onContextMenu={openContext}>
          {view === "details" && (
            <div className="details-header">
              <div className="col name" onClick={() => toggleSort("name")}>Name {sort === "name" && (asc ? "▲" : "▼")}</div>
              <div className="col type" onClick={() => toggleSort("type")}>Type {sort === "type" && (asc ? "▲" : "▼")}</div>
              <div className="col size" onClick={() => toggleSort("size")}>Size {sort === "size" && (asc ? "▲" : "▼")}</div>
              <div className="col modified" onClick={() => toggleSort("modified")}>Date modified {sort === "modified" && (asc ? "▲" : "▼")}</div>
            </div>
          )}
          <div
            className={`ex-content view-${view}`}
            ref={contentRef}
            onClick={(e) => {
              if (e.target === contentRef.current) clearSelection();
            }}
          >
            {items.map(item => {
              const sel = selected.includes(item.name);
              const ren = renaming === item.name;
              return (
                <div
                  key={item.name}
                  className={`entry ${item.type} ${sel ? "selected" : ""}`}
                  onDoubleClick={() => openItem(item)}
                  onClick={(e) => handleSelect(e, item)}
                  title={item.name}
                >
                  <div className="ico">{item.type === "dir" ? "📁" : "📄"}</div>
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
                      <div className="col type">{item.type}</div>
                      <div className="col size">{item.type === "file" ? formatSize(item.size) : ""}</div>
                      <div className="col modified">{formatDate(item.modified)}</div>
                    </>
                  )}
                </div>
              );
            })}
            {!items.length && <div className="empty">Folder is empty</div>}
          </div>
        </div>
      </div>

      <div className="status-bar">
        <span>{items.length} item(s)</span>
        {selected.length > 0 && <span> | {selected.length} selected</span>}
        {clipboard && <span> | {clipboard.mode === "cut" ? "Cut" : "Copied"} ({clipboard.items.length})</span>}
      </div>

      {ctxOpen && (
        <ul
          className="ctx-menu"
          style={{ left: contextPosRef.current.x, top: contextPosRef.current.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <li onClick={createFolder}>New Folder</li>
          <li onClick={startRename} className={selected.length !== 1 ? "disabled" : ""}>Rename</li>
          <li onClick={() => copyCut("copy")} className={!selected.length ? "disabled" : ""}>Copy</li>
          <li onClick={() => copyCut("cut")} className={!selected.length ? "disabled" : ""}>Cut</li>
          <li onClick={paste} className={!clipboard ? "disabled" : ""}>Paste</li>
          <li onClick={deleteItems} className={!selected.length ? "disabled" : ""}>Delete</li>
          <li onClick={() => setCtxOpen(false)}>Close</li>
        </ul>
      )}
    </div>
  );
};

export default Explorer;