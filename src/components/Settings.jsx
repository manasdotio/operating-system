import React, { useState, useEffect } from "react";
import { useOS } from "../context/OSContext";
import vfs from "../services/vfs";
import "./settings/Settings.css";

const WALLPAPERS = [
  { id: "default", name: "Windows Flow", preview: "#0078d4" },
  { id: "nature", name: "Nature Minimal", preview: "#2e7d32" },
  { id: "dark", name: "Midnight Dark", preview: "#121212" },
  { id: "sunset", name: "Sunset Horizon", preview: "#d84315" },
];

const Settings = () => {
  const {
    theme,
    setTheme,
    brightness,
    setBrightness,
    wallpaper,
    setWallpaper,
    processes,
  } = useOS();

  const [activeTab, setActiveTab] = useState("personalization");
  const [stats, setStats] = useState(vfs.getStorageStats());
  const [resetMsg, setResetMsg] = useState("");

  useEffect(() => {
    setStats(vfs.getStorageStats());
  }, []);

  const handleResetVFS = () => {
    if (window.confirm("Reset Virtual File System? All created files will be restored to defaults.")) {
      vfs.reset();
      setStats(vfs.getStorageStats());
      setResetMsg("File system reset successfully!");
      setTimeout(() => setResetMsg(""), 3000);
    }
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(vfs.exportJson());
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "webos_vfs_backup.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        vfs.importJson(event.target.result);
        setStats(vfs.getStorageStats());
        alert("Virtual File System restored from backup!");
      } catch (err) {
        alert("Failed to import JSON: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="settings-shell">
      <div className="settings-sidebar">
        <div className="settings-user-preview">
          <img src="/assets/icons/user.jpeg" alt="User" />
          <div>
            <h4>Guest User</h4>
            <p>Administrator</p>
          </div>
        </div>
        <nav className="settings-nav">
          <button
            className={activeTab === "personalization" ? "active" : ""}
            onClick={() => setActiveTab("personalization")}
          >
            🎨 Personalization
          </button>
          <button
            className={activeTab === "system" ? "active" : ""}
            onClick={() => setActiveTab("system")}
          >
            💻 System & Display
          </button>
          <button
            className={activeTab === "storage" ? "active" : ""}
            onClick={() => setActiveTab("storage")}
          >
            💾 Virtual Storage (VFS)
          </button>
          <button
            className={activeTab === "about" ? "active" : ""}
            onClick={() => setActiveTab("about")}
          >
            ℹ️ About WebOS
          </button>
        </nav>
      </div>

      <div className="settings-content">
        {activeTab === "personalization" && (
          <div className="settings-section">
            <h3>Personalization</h3>
            <p className="subtitle">Customize the look and feel of your desktop.</p>

            <div className="setting-card">
              <h4>Theme Mode</h4>
              <div className="theme-toggle-group">
                <button
                  className={`btn-toggle ${theme === "dark" ? "selected" : ""}`}
                  onClick={() => setTheme("dark")}
                >
                  🌙 Dark Mode
                </button>
                <button
                  className={`btn-toggle ${theme === "light" ? "selected" : ""}`}
                  onClick={() => setTheme("light")}
                >
                  ☀️ Light Mode
                </button>
              </div>
            </div>

            <div className="setting-card">
              <h4>Wallpaper Theme</h4>
              <div className="wallpaper-grid">
                {WALLPAPERS.map((wp) => (
                  <div
                    key={wp.id}
                    className={`wp-card ${wallpaper === wp.id ? "selected" : ""}`}
                    onClick={() => setWallpaper(wp.id)}
                  >
                    <div className="wp-color-swatch" style={{ background: wp.preview }} />
                    <span>{wp.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "system" && (
          <div className="settings-section">
            <h3>System & Display</h3>
            <p className="subtitle">Adjust screen brightness and monitor performance.</p>

            <div className="setting-card">
              <h4>Screen Brightness ({brightness}%)</h4>
              <input
                type="range"
                min="20"
                max="100"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="range-slider"
              />
            </div>

            <div className="setting-card">
              <h4>Display Resolution</h4>
              <p>{window.innerWidth} x {window.innerHeight} px</p>
            </div>
          </div>
        )}

        {activeTab === "storage" && (
          <div className="settings-section">
            <h3>Virtual File System (VFS)</h3>
            <p className="subtitle">Inspect storage telemetry and manage persistent data.</p>

            <div className="stats-grid">
              <div className="stat-box">
                <span className="stat-number">{stats.fileCount}</span>
                <span className="stat-label">Files</span>
              </div>
              <div className="stat-box">
                <span className="stat-number">{stats.dirCount}</span>
                <span className="stat-label">Folders</span>
              </div>
              <div className="stat-box">
                <span className="stat-number">{(stats.totalBytes / 1024).toFixed(1)} KB</span>
                <span className="stat-label">Payload Size</span>
              </div>
              <div className="stat-box">
                <span className="stat-number">{(stats.localStorageBytes / 1024).toFixed(1)} KB</span>
                <span className="stat-label">Indexed / Stored</span>
              </div>
            </div>

            <div className="setting-card actions-card">
              <h4>Storage Actions</h4>
              <div className="btn-row">
                <button className="btn primary" onClick={handleExportJson}>
                  📥 Export VFS Backup (.json)
                </button>
                <label className="btn secondary file-label">
                  📤 Import Backup
                  <input type="file" accept=".json" onChange={handleImportJson} hidden />
                </label>
                <button className="btn danger" onClick={handleResetVFS}>
                  ⚠️ Reset VFS to Defaults
                </button>
              </div>
              {resetMsg && <p className="success-msg">{resetMsg}</p>}
            </div>
          </div>
        )}

        {activeTab === "about" && (
          <div className="settings-section">
            <h3>About WebOS</h3>
            <p className="subtitle">Technical architecture and environment specifications.</p>

            <div className="setting-card">
              <div className="info-row">
                <strong>System Version:</strong>
                <span>WebOS Simulation Engine v1.2.0</span>
              </div>
              <div className="info-row">
                <strong>Kernel / Core:</strong>
                <span>React 19 Virtual DOM & POSIX VFS Layer</span>
              </div>
              <div className="info-row">
                <strong>Active Window Processes:</strong>
                <span>{processes.length} running processes</span>
              </div>
              <div className="info-row">
                <strong>Host Platform:</strong>
                <span>{navigator.userAgent}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
