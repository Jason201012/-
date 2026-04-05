import { app, shell, BrowserWindow, ipcMain, dialog, clipboard, nativeImage } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import * as fs from 'fs'
import * as path from 'path'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    title: '二维码生成器',
    icon: join(__dirname, '../../resources/icon.png'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.qrcode.generator')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.handle('dialog:saveFile', async (_, options: { defaultName?: string; filters?: any[] }) => {
  const result = await dialog.showSaveDialog({
    title: '保存二维码',
    defaultPath: options.defaultName || 'qrcode',
    filters: options.filters || [
      { name: 'PNG图片', extensions: ['png'] },
      { name: 'JPEG图片', extensions: ['jpg', 'jpeg'] },
      { name: 'SVG图片', extensions: ['svg'] }
    ]
  })
  return result
})

ipcMain.handle('dialog:openFile', async (_, options: { filters?: any[]; multiple?: boolean }) => {
  const result = await dialog.showOpenDialog({
    title: '选择文件',
    properties: options.multiple ? ['multiSelections'] : ['openFile'],
    filters: options.filters || [
      { name: '数据文件', extensions: ['csv', 'xlsx', 'xls', 'txt'] },
      { name: '图片文件', extensions: ['png', 'jpg', 'jpeg', 'svg'] }
    ]
  })
  return result
})

ipcMain.handle('dialog:openDirectory', async () => {
  const result = await dialog.showOpenDialog({
    title: '选择保存目录',
    properties: ['openDirectory']
  })
  return result
})

ipcMain.handle('file:save', async (_, filePath: string, data: string) => {
  try {
    const buffer = Buffer.from(data, 'base64')
    fs.writeFileSync(filePath, buffer)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('file:saveSvg', async (_, filePath: string, content: string) => {
  try {
    fs.writeFileSync(filePath, content, 'utf-8')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('clipboard:writeImage', async (_, dataUrl: string) => {
  try {
    const image = nativeImage.createFromDataURL(dataUrl)
    clipboard.writeImage(image)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('file:readText', async (_, filePath: string) => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    return { success: true, data: content }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('file:readBuffer', async (_, filePath: string) => {
  try {
    const buffer = fs.readFileSync(filePath)
    return { success: true, data: buffer.toString('base64') }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('path:join', async (_, ...paths: string[]) => {
  return path.join(...paths)
})

ipcMain.handle('path:basename', async (_, filePath: string) => {
  return path.basename(filePath)
})
