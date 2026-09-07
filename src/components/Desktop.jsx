import React, { useState } from "react";
import "../utils/css/Desktop.css";
import "../index.css";
import RightMenu from "./RightMenu";
import apps from "../utils/apps";
import { useOS } from "../context/OSContext";

const Desktop = () => {
  const { openApp, setStartMenu, setSystemTray, wallpaper } = useOS();
  const [rightMenu, setRightMenu] = useState({ visibility: false, x: 0, y: 0 });

  const handleDesktopClick = () => {
    setStartMenu(false);
    setRightMenu({ visibility: false, x: 0, y: 0 });
    setSystemTray(false);
  };

  const handleRightClick = (e) => {
    e.preventDefault();
    setRightMenu({ visibility: true, x: e.clientX, y: e.clientY });
  };

  const getWallpaperStyle = () => {
    if (wallpaper === "nature") {
      return {
        backgroundImage: `linear-gradient(135deg, rgba(20,40,20,0.6), rgba(10,25,15,0.85)), radial-gradient(circle at 50% 30%, #2e7d32 0%, #1b5e20 50%, #0d2810 100%)`,
        backgroundSize: "cover",
      };
    }
    if (wallpaper === "dark") {
      return {
        backgroundImage: `linear-gradient(135deg, #09090b 0%, #18181b 50%, #09090b 100%)`,
        backgroundSize: "cover",
      };
    }
    if (wallpaper === "sunset") {
      return {
        backgroundImage: `linear-gradient(135deg, rgba(30,10,0,0.6), rgba(20,5,0,0.85)), radial-gradient(circle at 60% 40%, #e65100 0%, #bf360c 50%, #260c05 100%)`,
        backgroundSize: "cover",
      };
    }
    return {}; // default css wallpaper
  };

  return (
    <div
      className={`desktop wallpaper-${wallpaper}`}
      style={getWallpaperStyle()}
      onClick={handleDesktopClick}
      onContextMenu={handleRightClick}
    >
      {rightMenu.visibility && <RightMenu x={rightMenu.x} y={rightMenu.y} />}
      <div className="desktop-icons">
        <div className="desktop-icon-item highlight-portfolio" onClick={() => openApp("portfolio")}>
          <img src={apps.portfolio.icon} alt="Hire Me" style={{ borderRadius: "50%", border: "2px solid #00d2ff" }} />
          <label style={{ color: "#00d2ff", fontWeight: 600 }}>Hire Me</label>
        </div>
        <div className="desktop-icon-item" onClick={() => openApp("explorer")}>
          <img src={apps.thisPC.icon} alt="This PC" />
          <label>This PC</label>
        </div>
        <div className="desktop-icon-item" onClick={() => openApp("recycleBin")}>
          <img src={apps.recycleBin.icon} alt="Recycle Bin" />
          <label>Recycle Bin</label>
        </div>
        <div className="desktop-icon-item" onClick={() => openApp("terminal")}>
          <img src={apps.terminal.icon} alt="Terminal" />
          <label>Terminal</label>
        </div>
        <div className="desktop-icon-item" onClick={() => openApp("taskmanager")}>
          <img src={apps.taskmanager.icon} alt="Task Manager" />
          <label>Task Mgr</label>
        </div>
        <div className="desktop-icon-item" onClick={() => openApp("explorer")}>
          <img src={apps.explorer.icon} alt="File Explorer" />
          <label>Explorer</label>
        </div>
        <div className="desktop-icon-item" onClick={() => openApp("notepad")}>
          <img src={apps.notepad.icon} alt="Notepad" />
          <label>Notepad</label>
        </div>
        <div className="desktop-icon-item" onClick={() => openApp("photos")}>
          <img src={apps.photos.icon} alt="Photos" />
          <label>Photos</label>
        </div>
        <div className="desktop-icon-item" onClick={() => openApp("camera")}>
          <img src={apps.camera.icon} alt="Camera" />
          <label>Camera</label>
        </div>
        <div className="desktop-icon-item" onClick={() => openApp("edge")}>
          <img src={apps.edge.icon} alt="Edge" />
          <label>Edge</label>
        </div>
        <div className="desktop-icon-item" onClick={() => openApp("settings")}>
          <img src={apps.settings.icon} alt="Settings" />
          <label>Settings</label>
        </div>
      </div>
    </div>
  );
};

export default Desktop;
