// src/components/Edge.jsx
import React, { useRef, useState } from "react";
import "./Edge/Edge.css";

// ✅ Whitelisted domains
const ALLOWED_DOMAINS = {
  "Wikipedia": "https://wikipedia.org",
  "MDN": "https://developer.mozilla.org",
  "Archive": "https://archive.org",
  "Example": "https://example.com"
};

const normalizeUrl = (input) => {
  if (!input) return "about:blank";
  const trimmed = input.trim();

  // If input matches bookmark name
  if (ALLOWED_DOMAINS[trimmed]) return ALLOWED_DOMAINS[trimmed];

  // If it looks like a URL
  if (/^(https?:\/\/)/i.test(trimmed)) return trimmed;

  // Default: prefix with https://
  return `https://${trimmed}`;
};

const isAllowed = (url) => {
  return Object.values(ALLOWED_DOMAINS).some((allowed) =>
    url.startsWith(allowed)
  );
};

const Edge = () => {
  const iframeRef = useRef(null);
  const [address, setAddress] = useState(ALLOWED_DOMAINS["Wikipedia"]); // homepage
  const [history, setHistory] = useState([ALLOWED_DOMAINS["Wikipedia"]]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const navigate = (targetUrl, addToHistory = true) => {
    const url = normalizeUrl(targetUrl);

    if (!isAllowed(url)) {
      alert("❌ This site cannot be opened inside Edge clone.\nTry a whitelisted site.");
      return;
    }

    setAddress(url);
    if (addToHistory) {
      const newHistory = history.slice(0, index + 1).concat(url);
      setHistory(newHistory);
      setIndex(newHistory.length - 1);
    }
    setLoading(true);
  };

  const goBack = () => {
    if (index > 0) {
      const newIndex = index - 1;
      setIndex(newIndex);
      setAddress(history[newIndex]);
      setLoading(true);
    }
  };

  const goForward = () => {
    if (index < history.length - 1) {
      const newIndex = index + 1;
      setIndex(newIndex);
      setAddress(history[newIndex]);
      setLoading(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(address, true);
  };

  const handleReload = () => {
    if (iframeRef.current) {
      setLoading(true);
      iframeRef.current.src = address;
    }
  };

  const onLoad = () => {
    setLoading(false);
  };

  return (
    <div className="edge-app">
      {/* Toolbar */}
      <div className="edge-toolbar">
        <div className="nav-buttons">
          <button onClick={goBack} disabled={index <= 0} title="Back">◀</button>
          <button onClick={goForward} disabled={index >= history.length - 1} title="Forward">▶</button>
          <button onClick={handleReload} title="Reload">⟳</button>
        </div>

        <form className="address-bar" onSubmit={handleSubmit}>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Search or enter web address"
            aria-label="Address"
          />
        </form>

        <div className="toolbar-right">
          <button
            className="new-tab"
            onClick={() => navigate(ALLOWED_DOMAINS["Wikipedia"], true)}
            title="New tab"
          >
            ➕
          </button>
        </div>
      </div>



      {/* Content */}
      <div className="edge-content">
        {loading && <div className="loading-indicator">Loading…</div>}
        <iframe
          ref={iframeRef}
          title="Edge Webview"
          src={address}
          onLoad={onLoad}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        />
      </div>
    </div>
  );
};

export default Edge;
