/**
 * Virtual File System (VFS)
 * A hierarchical, POSIX-style in-browser virtual file system
 * with localStorage persistence, event subscription, and binary/text support.
 */

const STORAGE_KEY = "web_os_vfs_v1";

const DEFAULT_FS_SEED = {
  type: "dir",
  name: "root",
  modified: Date.now(),
  children: [
    {
      type: "dir",
      name: "Downloads",
      modified: Date.now() - 43200000,
      children: [
        {
          type: "file",
          name: "VSCode-Setup-x64.exe",
          size: 92451820,
          modified: Date.now() - 14400000,
          content: "[Binary Installer]",
        },
        {
          type: "file",
          name: "dataset_sales.csv",
          size: 45210,
          modified: Date.now() - 28800000,
          content: "id,region,units,revenue\n1,North,450,125000\n2,South,320,96000\n3,West,540,162000",
        },
        {
          type: "file",
          name: "annual_report.pdf",
          size: 1420500,
          modified: Date.now() - 36000000,
          content: "[PDF Document: Annual Operating Report]",
        },
      ],
    },
    {
      type: "dir",
      name: "Documents",
      modified: Date.now() - 86400000,
      children: [
        {
          type: "file",
          name: "welcome.txt",
          size: 342,
          modified: Date.now() - 3600000,
          content:
            "Welcome to WebOS!\n\nThis operating system includes:\n- A POSIX-compliant Virtual File System (VFS)\n- An interactive Terminal CLI with piping and process control\n- Host OS drag-and-drop file upload\n- Multi-instance window management with z-index stacking\n\nTry editing this file in Notepad or reading it via Terminal (cat welcome.txt)!",
        },
        {
          type: "file",
          name: "projects.md",
          size: 512,
          modified: Date.now() - 7200000,
          content:
            "# My Portfolio Projects\n\n1. **WebOS**: Browser-based desktop simulation featuring POSIX VFS and Terminal.\n2. **Distributed Key-Value Store**: Raft consensus engine in Go.\n3. **Realtime Analytics**: Kafka + ClickHouse streaming pipeline.",
        },
        {
          type: "file",
          name: "resume.docx",
          size: 14280,
          modified: Date.now() - 172800000,
          content: "[Binary DOCX document: Senior Software Engineer Resume]",
        },
        {
          type: "file",
          name: "budget_q3.xlsx",
          size: 32400,
          modified: Date.now() - 250000000,
          content: "[Spreadsheet: Q3 Operating Budget]",
        },
      ],
    },
    {
      type: "dir",
      name: "Pictures",
      modified: Date.now() - 86400000,
      children: [
        {
          type: "file",
          name: "wallpaper.png",
          size: 104857,
          modified: Date.now() - 1200000,
          content: "[Image data: Nature Landscape 4K]",
        },
        {
          type: "file",
          name: "logo.svg",
          size: 934,
          modified: Date.now() - 3400000,
          content:
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#0078d4"/><text x="50" y="55" font-size="20" text-anchor="middle" fill="#fff">OS</text></svg>',
        },
        {
          type: "file",
          name: "architecture_diagram.png",
          size: 204850,
          modified: Date.now() - 5600000,
          content: "[Image data: Architecture Diagram]",
        },
      ],
    },
    {
      type: "dir",
      name: "Music",
      modified: Date.now() - 120000000,
      children: [
        {
          type: "file",
          name: "ambient_synth.mp3",
          size: 4890000,
          modified: Date.now() - 80000000,
          content: "[Audio data: Lo-fi Synthwave]",
        },
      ],
    },
    {
      type: "dir",
      name: "Videos",
      modified: Date.now() - 120000000,
      children: [
        {
          type: "file",
          name: "demo_walkthrough.mp4",
          size: 18450000,
          modified: Date.now() - 70000000,
          content: "[Video data: WebOS Walkthrough]",
        },
      ],
    },
    {
      type: "file",
      name: "readme.txt",
      size: 420,
      modified: Date.now() - 500000,
      content:
        "WebOS Architecture Overview:\n-----------------------------\n* State & Kernel: OSContext with process lifecycle & window z-indexing\n* Storage: VFS with JSON serialization & localStorage fallback\n* Terminal: Custom CLI parser with autocomplete & history\n* Drag & Drop: Native HTML5 File API ingestion directly into VFS\n",
    },
  ],
};

class VirtualFileSystem {
  constructor() {
    this.subscribers = new Set();
    this.root = this._load();
  }

  _load() {
    try {
      if (typeof localStorage !== "undefined") {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.type === "dir" && Array.isArray(parsed.children)) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn("VFS load failed, fallback to default seed", e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_FS_SEED));
  }

  _save() {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.root));
      }
    } catch (e) {
      console.warn("Failed to persist VFS to localStorage", e);
    }
    this._notify();
  }

  _notify() {
    for (const sub of this.subscribers) {
      try {
        sub(this.root);
      } catch (err) {
        console.error("VFS subscriber notification error:", err);
      }
    }
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  /**
   * Normalize path argument from array or string into string array
   * e.g. "/Documents/notes.txt" -> ["Documents", "notes.txt"]
   */
  normalizePath(path) {
    if (Array.isArray(path)) {
      return path.filter(Boolean);
    }
    if (typeof path !== "string") return [];
    return path
      .replace(/\\/g, "/")
      .split("/")
      .filter((seg) => Boolean(seg) && seg !== "." && seg !== "~");
  }

  resolvePath(currentPathArr, targetPathStr) {
    if (!targetPathStr || targetPathStr === "." || targetPathStr === "./") {
      return [...currentPathArr];
    }
    const isAbsolute = targetPathStr.startsWith("/") || targetPathStr.startsWith("~");
    let base = isAbsolute ? [] : [...currentPathArr];
    const parts = targetPathStr.replace(/\\/g, "/").split("/").filter(Boolean);

    for (const part of parts) {
      if (part === "." || part === "~") continue;
      if (part === "..") {
        if (base.length > 0) base.pop();
      } else {
        base.push(part);
      }
    }
    return base;
  }

  getNode(path) {
    const pathArr = this.normalizePath(path);
    let curr = this.root;
    for (const seg of pathArr) {
      if (!curr || curr.type !== "dir" || !Array.isArray(curr.children)) {
        return null;
      }
      curr = curr.children.find((c) => c.name === seg);
      if (!curr) return null;
    }
    return curr;
  }

  exists(path) {
    return this.getNode(path) !== null;
  }

  readDir(path = []) {
    const node = this.getNode(path);
    if (!node) throw new Error(`Directory not found: ${JSON.stringify(path)}`);
    if (node.type !== "dir") throw new Error(`Path is not a directory`);
    return [...node.children];
  }

  readFile(path) {
    const node = this.getNode(path);
    if (!node) throw new Error(`File not found: ${JSON.stringify(path)}`);
    if (node.type !== "file") throw new Error(`Path is a directory, not a file`);
    return node.content ?? "";
  }

  writeFile(path, content = "", mimeType = "text/plain") {
    const pathArr = this.normalizePath(path);
    if (pathArr.length === 0) throw new Error("Cannot write to root directory");

    const fileName = pathArr[pathArr.length - 1];
    const parentPath = pathArr.slice(0, -1);
    const parent = this.getNode(parentPath);

    if (!parent || parent.type !== "dir") {
      throw new Error(`Parent directory not found`);
    }

    const existingIndex = parent.children.findIndex((c) => c.name === fileName);
    const size = typeof content === "string" ? new Blob([content]).size : content.length || 0;
    const fileNode = {
      type: "file",
      name: fileName,
      content,
      size,
      mimeType,
      modified: Date.now(),
    };

    if (existingIndex >= 0) {
      if (parent.children[existingIndex].type === "dir") {
        throw new Error(`Cannot overwrite directory '${fileName}' with a file`);
      }
      parent.children[existingIndex] = fileNode;
    } else {
      parent.children.push(fileNode);
    }

    parent.modified = Date.now();
    this._save();
    return fileNode;
  }

  mkdir(path) {
    const pathArr = this.normalizePath(path);
    if (pathArr.length === 0) return this.root;

    const dirName = pathArr[pathArr.length - 1];
    const parentPath = pathArr.slice(0, -1);
    const parent = this.getNode(parentPath);

    if (!parent || parent.type !== "dir") {
      throw new Error(`Parent directory not found`);
    }

    if (parent.children.some((c) => c.name === dirName)) {
      throw new Error(`Directory or file '${dirName}' already exists`);
    }

    const newDir = {
      type: "dir",
      name: dirName,
      modified: Date.now(),
      children: [],
    };

    parent.children.push(newDir);
    parent.modified = Date.now();
    this._save();
    return newDir;
  }

  unlink(path) {
    const pathArr = this.normalizePath(path);
    if (pathArr.length === 0) throw new Error("Cannot delete root directory");

    const targetName = pathArr[pathArr.length - 1];
    const parentPath = pathArr.slice(0, -1);
    const parent = this.getNode(parentPath);

    if (!parent || parent.type !== "dir") {
      throw new Error("Parent directory not found");
    }

    const index = parent.children.findIndex((c) => c.name === targetName);
    if (index === -1) {
      throw new Error(`No such file or directory: '${targetName}'`);
    }

    const [removed] = parent.children.splice(index, 1);
    parent.modified = Date.now();
    this._save();
    return removed;
  }

  rename(path, newName) {
    newName = newName.trim();
    if (!newName) throw new Error("Name cannot be empty");

    const pathArr = this.normalizePath(path);
    if (pathArr.length === 0) throw new Error("Cannot rename root");

    const oldName = pathArr[pathArr.length - 1];
    if (oldName === newName) return;

    const parentPath = pathArr.slice(0, -1);
    const parent = this.getNode(parentPath);

    if (!parent || parent.type !== "dir") throw new Error("Parent directory not found");
    if (parent.children.some((c) => c.name === newName)) {
      throw new Error(`An item named '${newName}' already exists`);
    }

    const node = parent.children.find((c) => c.name === oldName);
    if (!node) throw new Error(`Item '${oldName}' not found`);

    node.name = newName;
    node.modified = Date.now();
    parent.modified = Date.now();
    this._save();
  }

  reset() {
    this.root = JSON.parse(JSON.stringify(DEFAULT_FS_SEED));
    this._save();
    return this.root;
  }

  exportJson() {
    return JSON.stringify(this.root, null, 2);
  }

  importJson(jsonString) {
    const parsed = JSON.parse(jsonString);
    if (!parsed || parsed.type !== "dir" || !Array.isArray(parsed.children)) {
      throw new Error("Invalid filesystem structure");
    }
    this.root = parsed;
    this._save();
  }

  getStorageStats() {
    const raw = typeof localStorage !== "undefined" ? (localStorage.getItem(STORAGE_KEY) || "") : JSON.stringify(this.root);
    let fileCount = 0;
    let dirCount = 0;
    let totalBytes = 0;

    const traverse = (node) => {
      if (node.type === "dir") {
        dirCount++;
        node.children?.forEach(traverse);
      } else {
        fileCount++;
        totalBytes += node.size || 0;
      }
    };
    traverse(this.root);

    return {
      fileCount,
      dirCount,
      totalBytes,
      localStorageBytes: raw.length * 2, // UTF-16
    };
  }
}

export const vfs = new VirtualFileSystem();
export default vfs;
