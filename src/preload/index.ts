import { contextBridge, ipcRenderer } from 'electron'

const api = {
  saveFile: (options?: { defaultName?: string; filters?: any[] }) =>
    ipcRenderer.invoke('dialog:saveFile', options),

  openFile: (options?: { filters?: any[]; multiple?: boolean }) =>
    ipcRenderer.invoke('dialog:openFile', options),

  openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),

  saveToFile: (filePath: string, data: string) => ipcRenderer.invoke('file:save', filePath, data),

  saveSvgToFile: (filePath: string, content: string) =>
    ipcRenderer.invoke('file:saveSvg', filePath, content),

  copyImageToClipboard: (dataUrl: string) => ipcRenderer.invoke('clipboard:writeImage', dataUrl),

  readTextFile: (filePath: string) => ipcRenderer.invoke('file:readText', filePath),

  readBufferFile: (filePath: string) => ipcRenderer.invoke('file:readBuffer', filePath),

  pathJoin: (...paths: string[]) => ipcRenderer.invoke('path:join', ...paths),

  pathBasename: (filePath: string) => ipcRenderer.invoke('path:basename', filePath)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electronAPI', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.electronAPI = api
}
