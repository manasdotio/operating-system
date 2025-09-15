import "../utils/css/Desktop.css";
import "../index.css";
import { nanoid } from "nanoid";
import RightMenu from "./RightMenu";
import { useState } from "react";
import apps from "../utils/apps"; // ✅ import centralized app definitions

const Desktop = ({ openWindows, setOpenWindows, startMenu, setStartMenu, systemTray, setSystemTray,handleOpenWindow }) => {
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

  return (
    <div
      className="desktop"
      onClick={handleDesktopClick}
      onContextMenu={handleRightClick}
    >
      {rightMenu.visibility && <RightMenu x={rightMenu.x} y={rightMenu.y} />}
      <div className="desktop-icons">
        <div className="thisPC" onClick={() => handleOpenWindow("explorer")}>
          <img src={apps.thisPC.icon} alt="This PC" />
          <label>This PC</label>
        </div>
        <div className="bin" onClick={() => handleOpenWindow("recycleBin")}>
          <img src={apps.recycleBin.icon} alt="Recycle Bin" />
          <label>Recycle Bin</label>
        </div>
        <div className="camera" onClick={() => handleOpenWindow("camera")}>
          <img src={apps.camera.icon} alt="Camera" />
          <label>Camera</label>
        </div>
        <div className="notepad" onClick={() => handleOpenWindow("notepad")}>
          <img src={apps.notepad.icon} alt="Notepad" />
          <label>Notepad</label>
        </div>
        <div className="photos" onClick={() => handleOpenWindow("photos")}>
          <img src={apps.photos.icon} alt="Photos" />
          <label>Photos</label>
        </div>
        <div className="edge" onClick={() => handleOpenWindow("edge")}>
          <img src={apps.edge.icon} alt="Edge" />
          <label>Edge</label>
        </div>
      </div>
    </div>
  );
};

export default Desktop;
