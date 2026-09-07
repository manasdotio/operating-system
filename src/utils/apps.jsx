// src/utils/apps.jsx
import Camera from "../components/Camera";
import Edge from "../components/Edge";
import Notepad from "../components/Notepad";
import Photos from "../components/Photos";
import Explorer from "../components/Explorer";
import Terminal from "../components/Terminal";
import Settings from "../components/Settings";
import Portfolio from "../components/Portfolio";
import TaskManager from "../components/TaskManager";

const apps = {
  portfolio: {
    id: "portfolio",
    name: "Manas Singh - Portfolio",
    icon: "/assets/icons/user.jpeg",
    component: Portfolio,
    singleInstance: true,
    defaultWidth: 840,
    defaultHeight: 560,
  },
  taskmanager: {
    id: "taskmanager",
    name: "Task Manager",
    icon: "/assets/icons/taskmanager.png",
    component: TaskManager,
    singleInstance: true,
    defaultWidth: 700,
    defaultHeight: 480,
  },
  explorer: {
    id: "explorer",
    name: "File Explorer",
    icon: "/assets/icons/explorer.png",
    component: Explorer,
    singleInstance: false,
    defaultWidth: 840,
    defaultHeight: 540,
  },
  terminal: {
    id: "terminal",
    name: "Terminal",
    icon: "/assets/icons/terminal.png",
    component: Terminal,
    singleInstance: false,
    defaultWidth: 760,
    defaultHeight: 460,
  },
  notepad: {
    id: "notepad",
    name: "Notepad",
    icon: "/assets/icons/notepad.png",
    component: Notepad,
    singleInstance: false,
    defaultWidth: 740,
    defaultHeight: 490,
  },
  settings: {
    id: "settings",
    name: "Settings",
    icon: "/assets/icons/settings.png",
    component: Settings,
    singleInstance: true,
    defaultWidth: 780,
    defaultHeight: 520,
  },
  camera: {
    id: "camera",
    name: "Camera",
    icon: "/assets/icons/camera.png",
    component: Camera,
    singleInstance: true,
    defaultWidth: 640,
    defaultHeight: 500,
  },
  photos: {
    id: "photos",
    name: "Photos",
    icon: "/assets/icons/photos.png",
    component: Photos,
    singleInstance: true,
    defaultWidth: 760,
    defaultHeight: 500,
  },
  edge: {
    id: "edge",
    name: "Microsoft Edge",
    icon: "/assets/icons/edge.png",
    component: Edge,
    singleInstance: false,
    defaultWidth: 900,
    defaultHeight: 580,
  },
  recycleBin: {
    id: "recycleBin",
    name: "Recycle Bin",
    icon: "/assets/icons/win/bin.png",
    component: Explorer,
    singleInstance: false,
    defaultWidth: 750,
    defaultHeight: 480,
  },
  thisPC: {
    id: "thisPC",
    name: "This PC",
    icon: "/assets/icons/win/thispc.png",
    component: Explorer,
    singleInstance: false,
    defaultWidth: 800,
    defaultHeight: 500,
  },
};

export default apps;
