import React, { useState } from "react";
import "../utils/css/Start.css";
import { useOS } from "../context/OSContext";

const PINNED_APPS = [
  { id: "portfolio", name: "Hire Me (Portfolio)", icon: "/assets/icons/user.jpeg" },
  { id: "taskmanager", name: "Task Manager", icon: "/assets/icons/taskmanager.png" },
  { id: "terminal", name: "Terminal", icon: "/assets/icons/terminal.png" },
  { id: "explorer", name: "File Explorer", icon: "/assets/icons/explorer.png" },
  { id: "notepad", name: "Notepad", icon: "/assets/icons/notepad.png" },
  { id: "settings", name: "Settings", icon: "/assets/icons/settings.png" },
  { id: "edge", name: "Microsoft Edge", icon: "/assets/icons/edge.png" },
  { id: "camera", name: "Camera", icon: "/assets/icons/camera.png" },
  { id: "photos", name: "Photos", icon: "/assets/icons/photos.png" },
  { id: "recycleBin", name: "Recycle Bin", icon: "/assets/icons/win/bin.png" },
  { id: "thisPC", name: "This PC", icon: "/assets/icons/win/thispc.png" },
];

const Start = () => {
  const { openApp, setStartMenu } = useOS();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredApps = PINNED_APPS.filter((app) =>
    app.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLaunch = (appId) => {
    openApp(appId);
    setStartMenu(false);
  };

  return (
    <div className="container" onClick={(e) => e.stopPropagation()}>
      <div className="start-menu-cont">
        <div className="comps">
          <div className="search-cont">
            <div className="search">
              <img src="/assets/icons/ui/search.png" alt="" />
              <input
                type="search"
                className="search-input"
                placeholder="Type here to search apps..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <div className="apps">
            <div className="title">
              <span>Pinned</span>
              <span className="all">
                All apps <img src="/assets/icons/right.svg" alt="" />
              </span>
            </div>
            <div className="apps-cont">
              {filteredApps.map((app) => (
                <div
                  key={app.id}
                  className="app"
                  onClick={() => handleLaunch(app.id)}
                  title={app.name}
                  style={{ cursor: "pointer" }}
                >
                  <img src={app.icon} alt={app.name} />
                  <span>{app.name}</span>
                </div>
              ))}
              {filteredApps.length === 0 && (
                <div style={{ color: "#aaa", fontSize: "12px", padding: "1rem" }}>
                  No apps found matching "{searchTerm}"
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="user-cont">
        <div className="user">
          <img src="/assets/icons/user.jpeg" alt="User" />
          <span>Guest User</span>
        </div>
        <div
          className="power-btn"
          title="Sign out / Close menu"
          onClick={() => setStartMenu(false)}
          style={{ cursor: "pointer" }}
        >
          <img src="/assets/icons/ui/power.png" alt="Power" />
        </div>
      </div>
    </div>
  );
};

export default Start;