import React, { useState, useEffect, useRef } from "react";
import vfs from "../services/vfs";
import "./notepad/Notepad.css";

const Notepad = ({ initialData, setStatusText }) => {
  const [tabs, setTabs] = useState([
    {
      id: "tab-1",
      fileName: initialData?.fileName || "Untitled.txt",
      filePath: initialData?.filePath || null,
      content:
        initialData?.content ||
        "# Welcome to WebOS Notepad\n\nStart typing your notes here, or open files directly from File Explorer.\n\nTips:\n- Press Ctrl+S to save directly to the Virtual File System.\n- Use the tabs above to work on multiple documents.",
      isDirty: false,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState("tab-1");
  const [wordWrap, setWordWrap] = useState(true);
  const [statusMsg, setStatusMsg] = useState("");
  const textareaRef = useRef(null);
  const lineGutterRef = useRef(null);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  useEffect(() => {
    if (initialData?.filePath) {
      try {
        const text = vfs.readFile(initialData.filePath);
        const name = Array.isArray(initialData.filePath)
          ? initialData.filePath[initialData.filePath.length - 1]
          : initialData.filePath;

        setTabs((prev) => {
          const existing = prev.find(
            (t) => JSON.stringify(t.filePath) === JSON.stringify(initialData.filePath)
          );
          if (existing) {
            setActiveTabId(existing.id);
            return prev;
          }
          const newTab = {
            id: `tab-${Date.now()}`,
            fileName: name,
            filePath: initialData.filePath,
            content: text,
            isDirty: false,
          };
          setActiveTabId(newTab.id);
          return [...prev, newTab];
        });
      } catch (err) {
        console.error("Failed to load file into Notepad:", err);
      }
    }
  }, [initialData]);

  const updateActiveContent = (newContent) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, content: newContent, isDirty: true } : t))
    );
  };

  const handleSave = () => {
    if (!activeTab) return;
    try {
      const target = activeTab.filePath || ["Documents", activeTab.fileName];
      vfs.writeFile(target, activeTab.content);
      setTabs((prev) =>
        prev.map((t) =>
          t.id === activeTabId ? { ...t, filePath: target, isDirty: false } : t
        )
      );
      setStatusMsg("Saved to VFS!");
      setTimeout(() => setStatusMsg(""), 2000);
    } catch (err) {
      alert(`Error saving file: ${err.message}`);
    }
  };

  const handleSaveAs = () => {
    if (!activeTab) return;
    const input = window.prompt("Enter file name (e.g. notes.txt):", activeTab.fileName);
    if (!input) return;
    try {
      const target = ["Documents", input.trim()];
      vfs.writeFile(target, activeTab.content);
      setTabs((prev) =>
        prev.map((t) =>
          t.id === activeTabId
            ? { ...t, fileName: input.trim(), filePath: target, isDirty: false }
            : t
        )
      );
      setStatusMsg("Saved!");
      setTimeout(() => setStatusMsg(""), 2000);
    } catch (err) {
      alert(`Error saving file: ${err.message}`);
    }
  };

  const handleNewTab = () => {
    const newId = `tab-${Date.now()}`;
    const newTab = {
      id: newId,
      fileName: `Untitled ${tabs.length + 1}.txt`,
      filePath: null,
      content: "",
      isDirty: false,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
  };

  const handleCloseTab = (e, tabId) => {
    e.stopPropagation();
    if (tabs.length === 1) {
      setTabs([
        {
          id: `tab-${Date.now()}`,
          fileName: "Untitled.txt",
          filePath: null,
          content: "",
          isDirty: false,
        },
      ]);
      return;
    }
    const nextTabs = tabs.filter((t) => t.id !== tabId);
    setTabs(nextTabs);
    if (activeTabId === tabId) {
      setActiveTabId(nextTabs[0].id);
    }
  };

  const handleScroll = () => {
    if (textareaRef.current && lineGutterRef.current) {
      lineGutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      handleSave();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "n") {
      e.preventDefault();
      handleNewTab();
    }
  };

  const lines = (activeTab?.content || "").split("\n");
  const lineCount = lines.length;
  const charCount = (activeTab?.content || "").length;
  const wordCount = (activeTab?.content || "").trim().split(/\s+/).filter(Boolean).length;

  useEffect(() => {
    if (setStatusText) {
      setStatusText(
        `Ln ${lineCount}, Col ${charCount} • ${wordCount} words • ${charCount} chars • UTF-8`
      );
    }
  }, [lineCount, charCount, wordCount, setStatusText]);

  return (
    <div className="notepad-shell" onKeyDown={handleKeyDown}>
      {/* Modern Tabs Bar */}
      <div className="notepad-tabs-bar">
        <div className="tabs-list">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`notepad-tab ${tab.id === activeTabId ? "active" : ""}`}
              onClick={() => setActiveTabId(tab.id)}
            >
              <span className="tab-title">
                {tab.fileName}
                {tab.isDirty ? " *" : ""}
              </span>
              <button
                className="tab-close-btn"
                onClick={(e) => handleCloseTab(e, tab.id)}
                title="Close tab"
              >
                ×
              </button>
            </div>
          ))}
          <button className="new-tab-btn" onClick={handleNewTab} title="New tab (Ctrl+N)">
            +
          </button>
        </div>
      </div>

      {/* Menu & Action Bar */}
      <div className="notepad-header">
        <div className="menu-item" onClick={handleNewTab} title="Create new tab">
          New
        </div>
        <div className="menu-item" onClick={handleSave} title="Save to VFS (Ctrl+S)">
          Save
        </div>
        <div className="menu-item" onClick={handleSaveAs} title="Save As new file">
          Save As...
        </div>
        <div
          className={`menu-item ${wordWrap ? "active-toggle" : ""}`}
          onClick={() => setWordWrap((w) => !w)}
          title="Toggle Word Wrap"
        >
          Wrap: {wordWrap ? "On" : "Off"}
        </div>
        {statusMsg && <span className="save-indicator">{statusMsg}</span>}
      </div>

      {/* Editor Body with Line Number Gutter */}
      <div className="notepad-editor-body">
        <div className="notepad-gutter" ref={lineGutterRef}>
          {lines.map((_, i) => (
            <div key={i} className="gutter-num">
              {i + 1}
            </div>
          ))}
        </div>

        <div className="notepad-textarea-wrap">
          <textarea
            ref={textareaRef}
            className={`notepad-textarea ${wordWrap ? "wrap" : "no-wrap"}`}
            value={activeTab?.content || ""}
            onChange={(e) => updateActiveContent(e.target.value)}
            onScroll={handleScroll}
            placeholder="Start typing your notes or code here..."
            spellCheck="false"
            autoFocus
          />
        </div>
      </div>
    </div>
  );
};

export default Notepad;