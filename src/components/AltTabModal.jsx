import React from "react";
import { useOS } from "../context/OSContext";
import "./alttab/AltTab.css";

const AltTabModal = () => {
  const { processes, altTabOpen, altTabSelected, focusWindow } = useOS();

  if (!altTabOpen || processes.length === 0) return null;

  return (
    <div className="alttab-overlay">
      <div className="alttab-modal">
        {processes.map((proc, index) => {
          const isSelected = index === altTabSelected;
          return (
            <div
              key={proc.pid}
              className={`alttab-card ${isSelected ? "selected" : ""}`}
              onClick={() => focusWindow(proc.pid)}
            >
              <img src={proc.icon} alt="" className="alttab-icon" />
              <span className="alttab-title">{proc.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AltTabModal;
