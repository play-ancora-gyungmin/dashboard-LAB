import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("dashboardLabDesktop", {
  isElectron: true,
  versions: {
    chrome: process.versions.chrome,
    electron: process.versions.electron,
    node: process.versions.node,
  },
  platform: process.platform,
});
