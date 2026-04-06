# 二维码工具

一款功能完善的跨平台二维码生成与扫描桌面应用程序。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)
![Electron](https://img.shields.io/badge/Electron-29.x-blue.svg)
![Vue](https://img.shields.io/badge/Vue-3.4.x-green.svg)

## 功能特性

### 二维码生成
- 📝 **文本二维码** - 支持任意文本内容
- 🔗 **网址二维码** - 支持 URL 格式，自动识别协议
- 👤 **名片二维码** - 支持 vCard 格式联系人信息
- 📶 **WiFi二维码** - 扫码即可连接 WiFi
- 📧 **邮件二维码** - 支持 mailto 格式
- 📞 **电话二维码** - 支持 tel 格式
- 🎨 **样式定制** - 尺寸、颜色、容错级别、边距
- 🖼️ **Logo嵌入** - 在二维码中心嵌入 Logo
- 📦 **批量生成** - 支持 CSV/Excel 文件导入
- 📋 **历史记录** - 本地保存生成历史
- 💾 **多格式导出** - PNG、JPG、SVG

### 二维码扫描
- 📷 **摄像头扫描** - 实时扫描二维码
- 🖼️ **图片识别** - 从图片中识别二维码和条形码
- 📊 **条形码支持** - EAN-13、UPC-A、Code128 等
- 🔍 **智能解析** - 自动解析 WiFi、名片、邮件等格式
- 💡 **闪光灯控制** - 支持设备闪光灯开关
- 🔄 **前后摄像头切换** - 灵活选择摄像头

## 下载安装

### Windows

下载 `.exe` 安装包，双击安装即可。

### macOS

下载 `.dmg` 文件，拖拽到应用程序文件夹。

### Linux

下载 `.AppImage` 或 `.deb` 文件安装。

## 开发

### 环境要求

- Node.js >= 18.x
- npm >= 9.x

### 本地运行

```bash
# 克隆仓库
git clone https://github.com/your-username/qr-code-generator.git
cd qr-code-generator

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 构建

```bash
# 构建 Windows 版本
npm run build:win

# 构建 macOS 版本
npm run build:mac

# 构建 Linux 版本
npm run build:linux
```

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Electron | 29.x | 跨平台桌面应用框架 |
| Vue | 3.4.x | 前端框架 |
| TypeScript | 5.x | 类型安全 |
| Element Plus | 2.6.x | UI组件库 |
| Pinia | 2.x | 状态管理 |
| Vite | 5.x | 构建工具 |
| qrcode | 1.5.x | 二维码生成核心库 |
| jsQR | 1.4.x | 二维码识别库 |

## 项目结构

```
├── src/
│   ├── main/           # Electron 主进程
│   ├── preload/        # 预加载脚本
│   └── renderer/       # Vue 渲染进程
│       ├── components/ # 公共组件
│       ├── views/      # 页面视图
│       ├── stores/     # 状态管理
│       ├── utils/      # 工具函数
│       └── types/      # 类型定义
├── build/              # 构建资源
├── dist/               # 打包输出
└── out/                # 编译输出
```

## 许可证

[MIT License](LICENSE)

## 贡献

欢迎提交 Issue 和 Pull Request！

## 致谢

- [Electron](https://www.electronjs.org/)
- [Vue.js](https://vuejs.org/)
- [Element Plus](https://element-plus.org/)
- [qrcode](https://www.npmjs.com/package/qrcode)
- [jsQR](https://www.npmjs.com/package/jsqr)
