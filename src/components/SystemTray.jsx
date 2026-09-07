import React, { useState } from "react";
import "../utils/css/SystemTray.css";

const SystemTray = ({ theme, setTheme, brightness, setBrightness }) => {
  const [volume, setVolume] = useState(50);

  return (
    <div className="system-options">
      <div className="so-container">
        <div className="so-icon">
          <div className="so-img">
            <img src="/assets/icons/ui/wifi.png" />
          </div>
          <p className="heading">WiFi</p>
        </div>
        <div className="so-icon">
          <div className="so-img">
            <img src="/assets/icons/ui/bluetooth.png" />
          </div>
          <p className="heading">Bluetooth</p>
        </div>
        <div className="so-icon">
          <div className="so-img">
            <img src="/assets/icons/ui/airplane.png" />
          </div>
          <p className="heading">Flight Mode</p>
        </div>
        <div className="so-icon">
          <div className="so-img">
            <img src="/assets/icons/ui/saver.png" />
          </div>
          <p className="heading">Battery Saver</p>
        </div>
        <div className="so-icon">
          <div className="so-img theme-btn" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
            <img src={theme === "light" ? "/assets/icons/ui/moon.png" : "/assets/icons/ui/sun.png"} />
          </div>
          <p className="heading">Theme</p>
        </div>
        <div className="so-icon">
          <div className="so-img">
            <img src="/assets/icons/ui/nightlight.png" />
          </div>
          <p className="heading">Night Light</p>
        </div>
      </div>
      <div className="so-indicator">
        <div className="indi-icon">
          <img src="/assets/icons/ui/brightness.png" />
          <input
            type="range"
            min="0"
            max="100"
            value={brightness}
            onChange={(e) => setBrightness(e.target.value)}
            className="brightness-slider"
          />
          <span className="brightness-value">{brightness}%</span>
        </div>
        <div className="indi-icon">
          <img src="/assets/icons/ui/audio3.png" />
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            className="volume-slider"
          />
          <span className="volume-value">{volume}%</span>
        </div>
      </div>
      <div className="battery"></div>
    </div>
  );
};

export default SystemTray;