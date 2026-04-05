# 二维码生成器 - 开发文档

## 目录

1. [项目概述](#1-项目概述)
2. [技术架构](#2-技术架构)
3. [项目结构](#3-项目结构)
4. [核心模块](#4-核心模块)
5. [API 文档](#5-api-文档)
6. [组件说明](#6-组件说明)
7. [状态管理](#7-状态管理)
8. [类型定义](#8-类型定义)
9. [开发指南](#9-开发指南)
10. [构建与部署](#10-构建与部署)

---

## 1. 项目概述

### 1.1 项目简介

二维码生成器是一款跨平台桌面应用程序，支持生成多种类型的二维码，包括文本、网址、名片、WiFi、邮件、电话等。提供丰富的样式定制选项和批量生成功能。

### 1.2 功能特性

| 功能 | 描述 |
|------|------|
| 文本二维码 | 支持任意文本内容生成二维码 |
| 网址二维码 | 支持URL格式，自动识别协议 |
| 名片二维码 | 支持vCard格式联系人信息 |
| WiFi二维码 | 支持SSID、密码、加密类型 |
| 邮件二维码 | 支持mailto格式 |
| 电话二维码 | 支持tel格式 |
| 样式定制 | 尺寸、颜色、容错级别、边距 |
| Logo嵌入 | 支持在二维码中心嵌入Logo |
| 批量生成 | 支持CSV/Excel文件导入批量生成 |
| 历史记录 | 本地保存生成历史，最多100条 |
| 多格式导出 | PNG、JPG、SVG |

### 1.3 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Electron | 29.x | 跨平台桌面应用框架 |
| Vue | 3.4.x | 前端框架 |
| TypeScript | 5.x | 类型安全 |
| Element Plus | 2.6.x | UI组件库 |
| Pinia | 2.x | 状态管理 |
| Vite | 5.x | 构建工具 |
| qrcode | 1.5.x | 二维码生成核心库 |
| xlsx | 0.18.x | Excel文件解析 |

---

## 2. 技术架构

### 2.1 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        用户界面层                            │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │TextQRCode│ │UrlQRCode│ │VCardQRCode│ │WifiQRCode│ ...    │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │  QRCodePreview   │  │   OptionsPanel   │                 │
│  └──────────────────┘  └──────────────────┘                 │
├─────────────────────────────────────────────────────────────┤
│                        状态管理层                            │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │   HistoryStore   │  │   OptionsStore   │                 │
│  └──────────────────┘  └──────────────────┘                 │
├─────────────────────────────────────────────────────────────┤
│                        业务逻辑层                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    QRCode Utils                       │   │
│  │  generateQRCode | formatVCard | formatWifi | ...     │   │
│  └──────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                        IPC 通信层                            │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │   Preload Script │◄─►│   Main Process   │                 │
│  └──────────────────┘  └──────────────────┘                 │
├─────────────────────────────────────────────────────────────┤
│                        系统接口层                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  File System | Clipboard | Dialog | Path             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 进程模型

Electron 采用多进程架构：

```
┌─────────────────┐     IPC      ┌─────────────────┐
│  Main Process   │◄────────────►│ Renderer Process│
│  (Node.js)      │              │  (Chromium)     │
│                 │              │                 │
│  - 文件系统操作   │              │  - Vue 应用     │
│  - 原生对话框    │              │  - UI 渲染      │
│  - 剪贴板操作    │              │  - 用户交互     │
└─────────────────┘              └─────────────────┘
        │
        │ contextBridge
        ▼
┌─────────────────┐
│  Preload Script │
│  - API 暴露     │
│  - 安全桥接     │
└─────────────────┘
```

---

## 3. 项目结构

```
f:\TRAE\二维码\
├── src/
│   ├── main/                      # 主进程
│   │   └── index.ts               # 主进程入口，窗口创建、IPC处理
│   │
│   ├── preload/                   # 预加载脚本
│   │   ├── index.ts               # API 暴露给渲染进程
│   │   └── index.d.ts             # 类型声明
│   │
│   └── renderer/                  # 渲染进程（Vue应用）
│       ├── index.html             # HTML入口
│       └── src/
│           ├── main.ts            # Vue应用入口
│           ├── App.vue            # 根组件
│           ├── env.d.ts           # 环境类型声明
│           │
│           ├── components/        # 公共组件
│           │   ├── QRCodePreview.vue    # 二维码预览组件
│           │   └── OptionsPanel.vue     # 样式设置面板
│           │
│           ├── views/             # 页面视图
│           │   ├── TextQRCode.vue       # 文本二维码
│           │   ├── UrlQRCode.vue        # 网址二维码
│           │   ├── VCardQRCode.vue      # 名片二维码
│           │   ├── WifiQRCode.vue       # WiFi二维码
│           │   ├── EmailQRCode.vue      # 邮件二维码
│           │   ├── PhoneQRCode.vue      # 电话二维码
│           │   ├── BatchGenerator.vue   # 批量生成
│           │   └── HistoryList.vue      # 历史记录
│           │
│           ├── stores/            # Pinia状态管理
│           │   └── index.ts
│           │
│           ├── utils/             # 工具函数
│           │   └── qrcode.ts      # 二维码生成核心逻辑
│           │
│           ├── types/             # TypeScript类型
│           │   └── qrcode.ts
│           │
│           └── styles/            # 样式文件
│               └── main.css
│
├── out/                           # 编译输出目录
├── dist/                          # 打包输出目录
├── build/                         # 构建资源目录
│
├── package.json                   # 项目配置
├── electron.vite.config.ts        # Vite配置
├── electron-builder.yml           # 打包配置
├── tsconfig.json                  # TypeScript配置
├── tsconfig.node.json             # 主进程TS配置
└── tsconfig.web.json              # 渲染进程TS配置
```

---

## 4. 核心模块

### 4.1 主进程 (Main Process)

**文件**: `src/main/index.ts`

主进程负责：
- 创建应用窗口
- 处理原生对话框
- 文件系统操作
- 剪贴板操作

```typescript
// 创建窗口
function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })
}

// IPC 处理示例
ipcMain.handle('dialog:saveFile', async (_, options) => {
  return await dialog.showSaveDialog(options)
})
```

### 4.2 预加载脚本 (Preload Script)

**文件**: `src/preload/index.ts`

通过 `contextBridge` 安全地暴露 API 给渲染进程：

```typescript
const api = {
  saveFile: (options?) => ipcRenderer.invoke('dialog:saveFile', options),
  openFile: (options?) => ipcRenderer.invoke('dialog:openFile', options),
  copyImageToClipboard: (dataUrl) => ipcRenderer.invoke('clipboard:writeImage', dataUrl),
  // ... 更多 API
}

contextBridge.exposeInMainWorld('electronAPI', api)
```

### 4.3 二维码生成工具

**文件**: `src/renderer/src/utils/qrcode.ts`

核心函数：

| 函数 | 参数 | 返回值 | 描述 |
|------|------|--------|------|
| `generateQRCode` | QRCodeData | Promise\<string\> | 生成二维码 DataURL |
| `generateQRCodeSvg` | QRCodeData | Promise\<string\> | 生成 SVG 字符串 |
| `formatVCard` | VCardData | string | 格式化 vCard 内容 |
| `formatWifi` | WifiData | string | 格式化 WiFi 配置 |
| `formatEmail` | EmailData | string | 格式化邮件链接 |
| `formatPhone` | string | string | 格式化电话链接 |
| `validateUrl` | string | boolean | 验证 URL 格式 |
| `validateEmail` | string | boolean | 验证邮箱格式 |

---

## 5. API 文档

### 5.1 Electron API

渲染进程通过 `window.electronAPI` 访问以下方法：

#### 对话框 API

```typescript
// 保存文件对话框
window.electronAPI.saveFile(options?: {
  defaultName?: string
  filters?: Array<{ name: string; extensions: string[] }>
}): Promise<{ canceled: boolean; filePath: string; filePaths: string[] }>

// 打开文件对话框
window.electronAPI.openFile(options?: {
  filters?: Array<{ name: string; extensions: string[] }>
  multiple?: boolean
}): Promise<{ canceled: boolean; filePath: string; filePaths: string[] }>

// 选择目录对话框
window.electronAPI.openDirectory(): Promise<{ canceled: boolean; filePaths: string[] }>
```

#### 文件操作 API

```typescript
// 保存 Base64 数据到文件
window.electronAPI.saveToFile(filePath: string, data: string): Promise<{ success: boolean; error?: string }>

// 保存 SVG 内容到文件
window.electronAPI.saveSvgToFile(filePath: string, content: string): Promise<{ success: boolean; error?: string }>

// 读取文本文件
window.electronAPI.readTextFile(filePath: string): Promise<{ success: boolean; data?: string; error?: string }>

// 读取文件为 Base64
window.electronAPI.readBufferFile(filePath: string): Promise<{ success: boolean; data?: string; error?: string }>
```

#### 剪贴板 API

```typescript
// 复制图片到剪贴板
window.electronAPI.copyImageToClipboard(dataUrl: string): Promise<{ success: boolean; error?: string }>
```

#### 路径工具 API

```typescript
// 连接路径
window.electronAPI.pathJoin(...paths: string[]): Promise<string>

// 获取文件名
window.electronAPI.pathBasename(filePath: string): Promise<string>
```

### 5.2 IPC 通道列表

| 通道 | 方向 | 参数 | 描述 |
|------|------|------|------|
| `dialog:saveFile` | Renderer → Main | SaveFileOptions | 显示保存对话框 |
| `dialog:openFile` | Renderer → Main | OpenFileOptions | 显示打开文件对话框 |
| `dialog:openDirectory` | Renderer → Main | - | 显示选择目录对话框 |
| `file:save` | Renderer → Main | filePath, base64Data | 保存文件 |
| `file:saveSvg` | Renderer → Main | filePath, content | 保存SVG文件 |
| `file:readText` | Renderer → Main | filePath | 读取文本文件 |
| `file:readBuffer` | Renderer → Main | filePath | 读取文件为Buffer |
| `clipboard:writeImage` | Renderer → Main | dataUrl | 写入图片到剪贴板 |
| `path:join` | Renderer → Main | ...paths | 连接路径 |
| `path:basename` | Renderer → Main | filePath | 获取文件名 |

---

## 6. 组件说明

### 6.1 QRCodePreview 组件

**路径**: `src/renderer/src/components/QRCodePreview.vue`

二维码预览和操作组件。

**Props**:

| 属性 | 类型 | 必填 | 描述 |
|------|------|------|------|
| qrData | QRCodeData \| null | 是 | 二维码数据 |

**功能**:
- 实时生成二维码预览
- 复制到剪贴板
- 导出为 PNG/JPG/SVG
- 自动保存到历史记录

**使用示例**:

```vue
<template>
  <QRCodePreview :qr-data="qrData" />
</template>

<script setup>
import QRCodePreview from '@/components/QRCodePreview.vue'

const qrData = computed(() => ({
  type: 'text',
  content: 'Hello World',
  options: {
    errorCorrectionLevel: 'M',
    width: 300,
    margin: 4,
    color: { dark: '#000000', light: '#ffffff' }
  }
}))
</script>
```

### 6.2 OptionsPanel 组件

**路径**: `src/renderer/src/components/OptionsPanel.vue`

二维码样式设置面板。

**Props**:

| 属性 | 类型 | 必填 | 描述 |
|------|------|------|------|
| modelValue | QRCodeOptions | 是 | 样式选项 |

**Events**:

| 事件 | 参数 | 描述 |
|------|------|------|
| update:modelValue | QRCodeOptions | 样式选项更新 |
| update:logo | { src: string; size: number } \| undefined | Logo更新 |

**使用示例**:

```vue
<template>
  <OptionsPanel
    v-model="options"
    @update:logo="handleLogoUpdate"
  />
</template>
```

---

## 7. 状态管理

### 7.1 HistoryStore

**用途**: 管理二维码生成历史记录

**State**:

```typescript
history: HistoryItem[]  // 历史记录列表
```

**Actions**:

| 方法 | 参数 | 返回值 | 描述 |
|------|------|--------|------|
| `addHistory` | Omit\<HistoryItem, 'id' \| 'createdAt'\> | HistoryItem | 添加历史记录 |
| `deleteHistory` | id: string | void | 删除指定记录 |
| `clearHistory` | - | void | 清空所有记录 |

**持久化**: 使用 localStorage 存储，key 为 `qrcode-history`

**使用示例**:

```typescript
import { useHistoryStore } from '@/stores'

const historyStore = useHistoryStore()

// 添加记录
historyStore.addHistory({
  type: 'text',
  content: 'Hello',
  options: { ... },
  dataUrl: 'data:image/png;base64,...'
})

// 删除记录
historyStore.deleteHistory('record-id')

// 清空记录
historyStore.clearHistory()
```

### 7.2 OptionsStore

**用途**: 管理二维码样式选项

**State**:

```typescript
options: QRCodeOptions  // 当前样式选项
```

**Actions**:

| 方法 | 参数 | 返回值 | 描述 |
|------|------|--------|------|
| `updateOptions` | Partial\<QRCodeOptions\> | void | 更新选项 |
| `resetOptions` | - | void | 重置为默认值 |

---

## 8. 类型定义

### 8.1 核心类型

**文件**: `src/renderer/src/types/qrcode.ts`

```typescript
// 容错级别
type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'

// 二维码选项
interface QRCodeOptions {
  errorCorrectionLevel: ErrorCorrectionLevel
  width: number
  margin: number
  color: {
    dark: string
    light: string
  }
}

// 二维码数据
interface QRCodeData {
  type: 'text' | 'url' | 'vcard' | 'wifi' | 'email' | 'phone' | 'sms'
  content: string
  options: QRCodeOptions
  logo?: {
    src: string
    size: number
  }
}

// 名片数据
interface VCardData {
  name: string
  phone?: string
  email?: string
  organization?: string
  title?: string
  address?: string
  website?: string
}

// WiFi数据
interface WifiData {
  ssid: string
  password: string
  encryption: 'WPA' | 'WEP' | 'nopass'
  hidden: boolean
}

// 邮件数据
interface EmailData {
  to: string
  subject?: string
  body?: string
}

// 历史记录项
interface HistoryItem {
  id: string
  type: QRCodeData['type']
  content: string
  options: QRCodeOptions
  dataUrl: string
  createdAt: number
}

// 批量生成项
interface BatchItem {
  id: string
  content: string
  type: QRCodeData['type']
  status: 'pending' | 'success' | 'error'
  error?: string
}
```

### 8.2 默认值

```typescript
const DEFAULT_OPTIONS: QRCodeOptions = {
  errorCorrectionLevel: 'M',
  width: 300,
  margin: 4,
  color: {
    dark: '#000000',
    light: '#ffffff'
  }
}
```

---

## 9. 开发指南

### 9.1 环境要求

- Node.js >= 18.x
- npm >= 9.x

### 9.2 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 9.3 代码规范

```bash
# 代码检查
npm run lint

# 代码格式化
npm run format

# 类型检查
npm run typecheck
```

### 9.4 添加新的二维码类型

1. 在 `types/qrcode.ts` 中添加数据类型
2. 在 `utils/qrcode.ts` 中添加格式化函数
3. 在 `views/` 中创建新的视图组件
4. 在 `App.vue` 中添加菜单项和路由

**示例**：添加短信二维码

```typescript
// 1. types/qrcode.ts - 已有 SmsData 类型

// 2. utils/qrcode.ts - 已有 formatSms 函数

// 3. views/SmsQRCode.vue
<template>
  <div class="qrcode-generator">
    <div class="generator-form">
      <el-form>
        <el-form-item label="电话号码">
          <el-input v-model="sms.number" />
        </el-form-item>
        <el-form-item label="短信内容">
          <el-input v-model="sms.message" type="textarea" />
        </el-form-item>
      </el-form>
    </div>
    <QRCodePreview :qr-data="qrData" />
  </div>
</template>

// 4. App.vue - 添加菜单
<el-menu-item index="sms">
  <el-icon><ChatDotRound /></el-icon>
  <span>短信二维码</span>
</el-menu-item>

// 添加组件
<SmsQRCode v-else-if="activeMenu === 'sms'" />
```

---

## 10. 构建与部署

### 10.1 构建命令

```bash
# 构建但不打包
npm run build

# 打包 Windows 版本
npm run build:win

# 打包 macOS 版本
npm run build:mac

# 打包 Linux 版本
npm run build:linux
```

### 10.2 输出目录

| 平台 | 输出格式 | 输出目录 |
|------|----------|----------|
| Windows | .exe | dist/ |
| macOS | .dmg | dist/ |
| Linux | .AppImage, .deb | dist/ |

### 10.3 打包配置

**文件**: `electron-builder.yml`

```yaml
appId: com.qrcode.generator
productName: 二维码生成器

win:
  executableName: 二维码生成器
  target:
    - nsis

nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true

mac:
  target:
    - dmg

linux:
  target:
    - AppImage
    - deb
```

### 10.4 代码签名

生产环境发布前需要配置代码签名：

**Windows**:
```yaml
win:
  certificateFile: path/to/certificate.pfx
  certificatePassword: ${env.CERT_PASSWORD}
```

**macOS**:
```yaml
mac:
  identity: "Developer ID Application: Your Name (TeamID)"
  hardenedRuntime: true
  gatekeeperAssess: false
```

---

## 附录

### A. 常见问题

**Q: Electron 下载失败？**

A: 使用国内镜像：
```bash
$env:ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
npm install
```

**Q: 打包后应用无法启动？**

A: 检查 `electron-builder.yml` 中的 `appId` 和 `productName` 配置。

**Q: 历史记录丢失？**

A: 历史记录存储在 localStorage，清除浏览器数据会导致丢失。

### B. 参考资料

- [Electron 官方文档](https://www.electronjs.org/docs)
- [Vue 3 官方文档](https://vuejs.org/)
- [Element Plus 文档](https://element-plus.org/)
- [qrcode 库文档](https://www.npmjs.com/package/qrcode)
- [QR Code 规范 ISO/IEC 18004:2015](https://www.iso.org/standard/62021.html)

---

**文档版本**: v1.0  
**更新日期**: 2026-04-05
