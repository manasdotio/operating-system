import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import apps from "../utils/apps";

const OSContext = createContext(null);

let nextPid = 100;
let highestZIndex = 10;

export const OSProvider = ({ children }) => {
  const [processes, setProcesses] = useState([]);
  const [activePid, setActivePid] = useState(null);
  const [startMenu, setStartMenu] = useState(false);
  const [systemTray, setSystemTray] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("web_os_theme") || "dark");
  const [brightness, setBrightness] = useState(100);
  const [wallpaper, setWallpaper] = useState(
    () => localStorage.getItem("web_os_wallpaper") || "default"
  );
  const [altTabOpen, setAltTabOpen] = useState(false);
  const [altTabSelected, setAltTabSelected] = useState(0);
  const [spotlightOpen, setSpotlightOpen] = useState(false);

  const toggleSpotlight = useCallback(() => {
    setSpotlightOpen((prev) => !prev);
    setStartMenu(false);
    setSystemTray(false);
  }, []);

  // Sync theme
  useEffect(() => {
    localStorage.setItem("web_os_theme", theme);
  }, [theme]);

  // Sync wallpaper
  useEffect(() => {
    localStorage.setItem("web_os_wallpaper", wallpaper);
  }, [wallpaper]);

  const focusWindow = useCallback((pid) => {
    highestZIndex += 1;
    setActivePid(pid);
    setProcesses((prev) =>
      prev.map((p) => (p.pid === pid ? { ...p, zIndex: highestZIndex, minimized: false } : p))
    );
  }, []);

  const openApp = useCallback(
    (appKey, initialData = null) => {
      const app = apps[appKey];
      if (!app) return;

      // Close start menu and spotlight when launching app
      setStartMenu(false);
      setSystemTray(false);
      setSpotlightOpen(false);

      const isSingleInstance = app.singleInstance ?? false;

      setProcesses((prev) => {
        if (isSingleInstance) {
          const existing = prev.find((p) => p.appId === appKey);
          if (existing) {
            highestZIndex += 1;
            setActivePid(existing.pid);
            return prev.map((p) =>
              p.pid === existing.pid
                ? { ...p, minimized: false, zIndex: highestZIndex, initialData: initialData || p.initialData }
                : p
            );
          }
        }

        highestZIndex += 1;
        const pid = nextPid++;
        const newProcess = {
          pid,
          appId: appKey,
          name: app.name,
          icon: app.icon,
          component: app.component,
          minimized: false,
          maximized: false,
          zIndex: highestZIndex,
          initialData: initialData,
          defaultWidth: app.defaultWidth || 800,
          defaultHeight: app.defaultHeight || 520,
        };

        setActivePid(pid);
        return [...prev, newProcess];
      });
    },
    []
  );

  const closeWindow = useCallback((pid) => {
    setProcesses((prev) => {
      const remaining = prev.filter((p) => p.pid !== pid);
      if (remaining.length > 0) {
        // focus the highest z-index remaining window
        const sorted = [...remaining].sort((a, b) => b.zIndex - a.zIndex);
        setActivePid(sorted[0].pid);
      } else {
        setActivePid(null);
      }
      return remaining;
    });
  }, []);

  const minimizeWindow = useCallback((pid) => {
    setProcesses((prev) =>
      prev.map((p) => {
        if (p.pid === pid) {
          return { ...p, minimized: !p.minimized };
        }
        return p;
      })
    );
  }, []);

  const maximizeWindow = useCallback((pid) => {
    setProcesses((prev) =>
      prev.map((p) => {
        if (p.pid === pid) {
          return { ...p, maximized: !p.maximized };
        }
        return p;
      })
    );
  }, []);

  const killProcess = useCallback(
    (pid) => {
      closeWindow(Number(pid));
    },
    [closeWindow]
  );

  // Alt + Tab Handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.key === "Tab") {
        e.preventDefault();
        setProcesses((cur) => {
          if (cur.length === 0) return cur;
          setAltTabOpen(true);
          setAltTabSelected((prevIdx) => (prevIdx + 1) % cur.length);
          return cur;
        });
      }

      // Ctrl+K / Cmd+K Spotlight shortcut
      if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setSpotlightOpen((prev) => !prev);
        setStartMenu(false);
        setSystemTray(false);
      }
    };

    const handleKeyUp = (e) => {
      if (!e.altKey && altTabOpen) {
        setAltTabOpen(false);
        setProcesses((cur) => {
          if (cur.length > 0 && cur[altTabSelected]) {
            focusWindow(cur[altTabSelected].pid);
          }
          return cur;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [altTabOpen, altTabSelected, focusWindow]);

  const value = {
    processes,
    activePid,
    openApp,
    closeWindow,
    focusWindow,
    minimizeWindow,
    maximizeWindow,
    killProcess,
    startMenu,
    setStartMenu,
    systemTray,
    setSystemTray,
    theme,
    setTheme,
    brightness,
    setBrightness,
    wallpaper,
    setWallpaper,
    altTabOpen,
    altTabSelected,
    spotlightOpen,
    setSpotlightOpen,
    toggleSpotlight,
  };

  return <OSContext.Provider value={value}>{children}</OSContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useOS = () => {
  const context = useContext(OSContext);
  if (!context) {
    throw new Error("useOS must be used within an OSProvider");
  }
  return context;
};

export default OSContext;
