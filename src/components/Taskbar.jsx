import React, { useState, useEffect } from "react";
import "../utils/css/Taskbar.css";
import "../index.css";
import SystemTray from "./SystemTray";
import { useOS } from "../context/OSContext";

const Taskbar = () => {
  const {
    processes,
    activePid,
    openApp,
    focusWindow,
    minimizeWindow,
    startMenu,
    setStartMenu,
    systemTray,
    setSystemTray,
    theme,
    setTheme,
    brightness,
    setBrightness,
    toggleSpotlight,
    spotlightOpen,
  } = useOS();

  const [timeStr, setTimeStr] = useState("");
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
      setDateStr(
        now.toLocaleDateString([], {
          month: "numeric",
          day: "numeric",
          year: "numeric",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAppClick = (appKey) => {
    const running = processes.filter((p) => p.appId === appKey);
    if (running.length === 0) {
      openApp(appKey);
    } else {
      const activeWindow = running.find((p) => p.pid === activePid && !p.minimized);
      if (activeWindow) {
        minimizeWindow(activeWindow.pid);
      } else {
        const target = running.find((p) => p.minimized) || running[0];
        focusWindow(target.pid);
      }
    }
  };

  const isAppRunning = (appKey) => processes.some((p) => p.appId === appKey);
  const isAppActive = (appKey) =>
    processes.some((p) => p.appId === appKey && p.pid === activePid && !p.minimized);

  return (
    <div className="taskbar">
      {/* Left: Widgets & Weather Pill */}
      <div className="widgets" title="Weather & Widgets">
        <img src="/assets/icons/widget.png" alt="Widgets" />
        <span className="widget-label">⛅ 24°C Sunny</span>
      </div>

      {/* Center: Centered Dock */}
      <div className="middle">
        <div
          className={`taskbar-icons start ${startMenu ? "active" : ""}`}
          onClick={() => {
            setStartMenu(!startMenu);
            setSystemTray(false);
          }}
          title="Start"
        >
          <img src="/assets/icons/home.png" alt="Start" />
        </div>

        <div
          className={`taskbar-icons search-btn ${spotlightOpen ? "active" : ""}`}
          onClick={toggleSpotlight}
          title="Search / Spotlight (Ctrl+K)"
        >
          <img src="/assets/icons/search.png" alt="Search" />
        </div>

        <div
          className={`taskbar-icons portfolio-dock ${
            isAppActive("portfolio") ? "active" : isAppRunning("portfolio") ? "running" : ""
          }`}
          onClick={() => handleAppClick("portfolio")}
          title="Developer Portfolio / Hire Me"
        >
          <img
            src="/assets/icons/user.jpeg"
            alt="Hire Me"
            style={{ borderRadius: "50%", border: "1.5px solid #00d2ff" }}
          />
        </div>

        <div
          className={`taskbar-icons terminal ${
            isAppActive("terminal") ? "active" : isAppRunning("terminal") ? "running" : ""
          }`}
          onClick={() => handleAppClick("terminal")}
          title="Terminal (CLI)"
        >
          <img src="/assets/icons/terminal.png" alt="Terminal" />
        </div>

        <div
          className={`taskbar-icons file-explorer ${
            isAppActive("explorer") ? "active" : isAppRunning("explorer") ? "running" : ""
          }`}
          onClick={() => handleAppClick("explorer")}
          title="File Explorer"
        >
          <img src="/assets/icons/explorer.png" alt="File Explorer" />
        </div>

        <div
          className={`taskbar-icons taskmanager-dock ${
            isAppActive("taskmanager") ? "active" : isAppRunning("taskmanager") ? "running" : ""
          }`}
          onClick={() => handleAppClick("taskmanager")}
          title="Task Manager & Activity Monitor"
        >
          <img src="/assets/icons/taskmanager.png" alt="Task Manager" />
        </div>

        <div
          className={`taskbar-icons notepad ${
            isAppActive("notepad") ? "active" : isAppRunning("notepad") ? "running" : ""
          }`}
          onClick={() => handleAppClick("notepad")}
          title="Notepad"
        >
          <img src="/assets/icons/notepad.png" alt="Notepad" />
        </div>

        <div
          className={`taskbar-icons edge ${
            isAppActive("edge") ? "active" : isAppRunning("edge") ? "running" : ""
          }`}
          onClick={() => handleAppClick("edge")}
          title="Microsoft Edge"
        >
          <img src="/assets/icons/edge.png" alt="Edge" />
        </div>

        <div
          className={`taskbar-icons settings ${
            isAppActive("settings") ? "active" : isAppRunning("settings") ? "running" : ""
          }`}
          onClick={() => handleAppClick("settings")}
          title="Settings"
        >
          <img src="/assets/icons/settings.png" alt="Settings" />
        </div>

        {/* Dynamic taskbar icons for other running apps */}
        {processes
          .filter(
            (p, idx, arr) =>
              ![
                "terminal",
                "explorer",
                "notepad",
                "edge",
                "settings",
                "portfolio",
                "taskmanager",
              ].includes(p.appId) && arr.findIndex((x) => x.appId === p.appId) === idx
          )
          .map((p) => (
            <div
              key={p.pid}
              className={`taskbar-icons dynamic-app ${
                isAppActive(p.appId) ? "active" : isAppRunning(p.appId) ? "running" : ""
              }`}
              onClick={() => handleAppClick(p.appId)}
              title={p.name}
            >
              <img src={p.icon} alt={p.name} />
            </div>
          ))}
      </div>

      {/* Right: Quick Settings & Clock */}
      <div className="right">
        {systemTray && (
          <SystemTray
            theme={theme}
            setTheme={setTheme}
            brightness={brightness}
            setBrightness={setBrightness}
          />
        )}
        <div className="hidden-icons" title="Show hidden icons">
          <img src="/assets/icons/uparrow.svg" alt="Up" />
        </div>
        <div
          className="quick-menu"
          onClick={() => {
            setSystemTray(!systemTray);
            setStartMenu(false);
          }}
          title="Internet, Audio, Battery"
        >
          <div className="quick-icons">
            <img src="/assets/icons/ui/wifi.png" alt="WiFi" />
          </div>
          <div className="quick-icons">
            <img src="/assets/icons/ui/audio2.png" alt="Audio" />
          </div>
          <div className="quick-icons">
            <img src="/assets/icons/ui/battery.png" alt="Battery" />
          </div>
        </div>
        <div className="time-date" title={new Date().toDateString()}>
          <span className="time">{timeStr}</span>
          <span className="date">{dateStr}</span>
        </div>
      </div>
    </div>
  );
};

export default Taskbar;
