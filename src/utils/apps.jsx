// src/utils/apps.js
import Camera from "../components/Camera";
import Edge from "../components/Edge";
import Notepad from "../components/Notepad";
import Photos from "../components/Photos";
import Explorer from "../components/Explorer";

const apps = {
  settings: {
    name: "Settings",
    icon: "/assets/icons/settings.png",
    component: () => <p>Settings App Coming Soon...</p>,
  },
  explorer: {
    name: "File Explorer",
    icon: "/assets/icons/explorer.png",
    component: Explorer,
  },
  camera: {
    name: "Camera",
    icon: "/assets/icons/camera.png",
    component: Camera,
  },
  recycleBin: {
    id: "recycle-bin",
    name: "Recycle Bin",
    icon: "/assets/icons/win/bin.png",
    component: () => <p>This is the Recycle Bin</p>,
  },
  thisPC: {
    id: "this-pc",
    name: "This PC",
    icon: "/assets/icons/win/thispc.png",
    component: () => <p>This is This PC</p>,
  },
  notepad: {
    id: "notepad",
    name: "Notepad",
    icon: "/assets/icons/notepad.png",
    component: Notepad,
  },
  photos: {
    id: "photos",
    name: "Photos",
    icon: "/assets/icons/photos.png",
    component: Photos,
  },
  edge: {
    id: "edge",
    name: "Micriosoft Edge",
    icon: "/assets/icons/edge.png",
    component: Edge,
  },
};

export default apps;
