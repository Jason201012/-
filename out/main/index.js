"use strict";
const electron = require("electron");
const path = require("path");
const utils = require("@electron-toolkit/utils");
const fs = require("fs");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const path__namespace = /* @__PURE__ */ _interopNamespaceDefault(path);
const fs__namespace = /* @__PURE__ */ _interopNamespaceDefault(fs);
function createWindow() {
  const mainWindow = new electron.BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    title: "二维码生成器",
    icon: path.join(__dirname, "../../resources/icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });
  mainWindow.webContents.setWindowOpenHandler((details) => {
    electron.shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (utils.is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}
electron.app.whenReady().then(() => {
  utils.electronApp.setAppUserModelId("com.qrcode.generator");
  electron.app.on("browser-window-created", (_, window) => {
    utils.optimizer.watchWindowShortcuts(window);
  });
  createWindow();
  electron.app.on("activate", function() {
    if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.ipcMain.handle("dialog:saveFile", async (_, options) => {
  const result = await electron.dialog.showSaveDialog({
    title: "保存二维码",
    defaultPath: options.defaultName || "qrcode",
    filters: options.filters || [
      { name: "PNG图片", extensions: ["png"] },
      { name: "JPEG图片", extensions: ["jpg", "jpeg"] },
      { name: "SVG图片", extensions: ["svg"] }
    ]
  });
  return result;
});
electron.ipcMain.handle("dialog:openFile", async (_, options) => {
  const result = await electron.dialog.showOpenDialog({
    title: "选择文件",
    properties: options.multiple ? ["multiSelections"] : ["openFile"],
    filters: options.filters || [
      { name: "数据文件", extensions: ["csv", "xlsx", "xls", "txt"] },
      { name: "图片文件", extensions: ["png", "jpg", "jpeg", "svg"] }
    ]
  });
  return result;
});
electron.ipcMain.handle("dialog:openDirectory", async () => {
  const result = await electron.dialog.showOpenDialog({
    title: "选择保存目录",
    properties: ["openDirectory"]
  });
  return result;
});
electron.ipcMain.handle("file:save", async (_, filePath, data) => {
  try {
    const buffer = Buffer.from(data, "base64");
    fs__namespace.writeFileSync(filePath, buffer);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
electron.ipcMain.handle("file:saveSvg", async (_, filePath, content) => {
  try {
    fs__namespace.writeFileSync(filePath, content, "utf-8");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
electron.ipcMain.handle("clipboard:writeImage", async (_, dataUrl) => {
  try {
    const image = electron.nativeImage.createFromDataURL(dataUrl);
    electron.clipboard.writeImage(image);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
electron.ipcMain.handle("file:readText", async (_, filePath) => {
  try {
    const content = fs__namespace.readFileSync(filePath, "utf-8");
    return { success: true, data: content };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
electron.ipcMain.handle("file:readBuffer", async (_, filePath) => {
  try {
    const buffer = fs__namespace.readFileSync(filePath);
    return { success: true, data: buffer.toString("base64") };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
electron.ipcMain.handle("path:join", async (_, ...paths) => {
  return path__namespace.join(...paths);
});
electron.ipcMain.handle("path:basename", async (_, filePath) => {
  return path__namespace.basename(filePath);
});
