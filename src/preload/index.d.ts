export interface SaveFileOptions {
  defaultName?: string
  filters?: Array<{ name: string; extensions: string[] }>
}

export interface OpenFileOptions {
  filters?: Array<{ name: string; extensions: string[] }>
  multiple?: boolean
}

export interface DialogResult {
  canceled: boolean
  filePath: string
  filePaths: string[]
}

export interface FileResult {
  success: boolean
  data?: string
  error?: string
}

interface ElectronAPI {
  saveFile: (options?: SaveFileOptions) => Promise<DialogResult>
  openFile: (options?: OpenFileOptions) => Promise<DialogResult>
  openDirectory: () => Promise<DialogResult>
  saveToFile: (filePath: string, data: string) => Promise<FileResult>
  saveSvgToFile: (filePath: string, content: string) => Promise<FileResult>
  copyImageToClipboard: (dataUrl: string) => Promise<FileResult>
  readTextFile: (filePath: string) => Promise<FileResult>
  readBufferFile: (filePath: string) => Promise<FileResult>
  pathJoin: (...paths: string[]) => Promise<string>
  pathBasename: (filePath: string) => Promise<string>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
