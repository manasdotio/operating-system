import React from "react";
import Desktop from "./components/Desktop";
import Taskbar from "./components/Taskbar";
import Window from "./components/Window";
import Start from "./components/Start";
import AltTabModal from "./components/AltTabModal";
import Spotlight from "./components/Spotlight";
import { OSProvider, useOS } from "./context/OSContext";

function OSDesktop() {
  const { processes, startMenu, theme, brightness, spotlightOpen, setSpotlightOpen } = useOS();

  return (
    <div
      className={`theme ${theme}` + (brightness !== 100 ? " brightness" : "")}
      style={{ filter: `brightness(${Math.max(brightness, 20)}%)` }}
    >
      <Desktop />
      <Taskbar />

      {startMenu && <Start />}

      {processes.map((proc) => (
        <Window key={proc.pid} win={proc} />
      ))}

      <AltTabModal />
      <Spotlight isOpen={spotlightOpen} onClose={() => setSpotlightOpen(false)} />
    </div>
  );
}

function App() {
  return (
    <OSProvider>
      <main>
        <OSDesktop />
      </main>
    </OSProvider>
  );
}

export default App;
