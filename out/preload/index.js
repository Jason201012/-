"use strict";
const electron = require("electron");
const api = {
  saveFile: (options) => electron.ipcRenderer.invoke("dialog:saveFile", options),
  openFile: (options) => electron.ipcRenderer.invoke("dialog:openFile", options),
  openDirectory: () => electron.ipcRenderer.invoke("dialog:openDirectory"),
  saveToFile: (filePath, data) => electron.ipcRenderer.invoke("file:save", filePath, data),
  saveSvgToFile: (filePath, content) => electron.ipcRenderer.invoke("file:saveSvg", filePath, content),
  copyImageToClipboard: (dataUrl) => electron.ipcRenderer.invoke("clipboard:writeImage", dataUrl),
  readTextFile: (filePath) => electron.ipcRenderer.invoke("file:readText", filePath),
  readBufferFile: (filePath) => electron.ipcRenderer.invoke("file:readBuffer", filePath),
  pathJoin: (...paths) => electron.ipcRenderer.invoke("path:join", ...paths),
  pathBasename: (filePath) => electron.ipcRenderer.invoke("path:basename", filePath)
};
if (process.contextIsolated) {
  try {
    electron.contextBridge.exposeInMainWorld("electronAPI", api);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electronAPI = api;
}
