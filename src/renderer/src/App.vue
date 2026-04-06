<template>
  <div class="app-container" :class="{ 'dark-mode': themeStore.isDark }">
    <el-container>
      <el-header class="app-header">
        <div class="logo">
          <el-icon :size="24"><Grid /></el-icon>
          <span>二维码工具 v1.4.0</span>
        </div>
        <div class="header-actions">
          <el-tooltip :content="themeStore.isDark ? '切换到亮色模式' : '切换到暗黑模式'">
            <el-button text @click="themeStore.toggleTheme()">
              <el-icon v-if="themeStore.isDark"><Sunny /></el-icon>
              <el-icon v-else><Moon /></el-icon>
            </el-button>
          </el-tooltip>
          <el-button text @click="showAbout = true">
            <el-icon><InfoFilled /></el-icon>
            关于
          </el-button>
        </div>
      </el-header>

      <el-container class="main-container">
        <el-aside width="220px" class="sidebar">
          <el-menu :default-active="activeMenu" class="sidebar-menu" @select="handleMenuSelect">
            <el-sub-menu index="generate">
              <template #title>
                <el-icon><Plus /></el-icon>
                <span>生成二维码</span>
              </template>
              <el-menu-item index="text">
                <el-icon><Edit /></el-icon>
                <span>文本二维码</span>
              </el-menu-item>
              <el-menu-item index="url">
                <el-icon><Link /></el-icon>
                <span>网址二维码</span>
              </el-menu-item>
              <el-menu-item index="vcard">
                <el-icon><User /></el-icon>
                <span>名片二维码</span>
              </el-menu-item>
              <el-menu-item index="wifi">
                <el-icon><Connection /></el-icon>
                <span>WiFi二维码</span>
              </el-menu-item>
              <el-menu-item index="email">
                <el-icon><Message /></el-icon>
                <span>邮件二维码</span>
              </el-menu-item>
              <el-menu-item index="phone">
                <el-icon><Phone /></el-icon>
                <span>电话二维码</span>
              </el-menu-item>
              <el-menu-item index="batch">
                <el-icon><Files /></el-icon>
                <span>批量生成</span>
              </el-menu-item>
            </el-sub-menu>

            <el-sub-menu index="barcode">
              <template #title>
                <el-icon><Tickets /></el-icon>
                <span>条形码</span>
              </template>
              <el-menu-item index="barcode-generator">
                <el-icon><Tickets /></el-icon>
                <span>条形码生成</span>
              </el-menu-item>
            </el-sub-menu>

            <el-sub-menu index="scan">
              <template #title>
                <el-icon><Camera /></el-icon>
                <span>扫描识别</span>
              </template>
              <el-menu-item index="scanner">
                <el-icon><VideoCamera /></el-icon>
                <span>摄像头扫描</span>
              </el-menu-item>
              <el-menu-item index="image-scanner">
                <el-icon><Picture /></el-icon>
                <span>图片识别</span>
              </el-menu-item>
            </el-sub-menu>

            <el-menu-item index="templates">
              <el-icon><Collection /></el-icon>
              <span>样式模板</span>
            </el-menu-item>

            <el-menu-item index="print">
              <el-icon><Printer /></el-icon>
              <span>打印标签</span>
            </el-menu-item>

            <el-menu-item index="favorites">
              <el-icon><Star /></el-icon>
              <span>收藏夹</span>
            </el-menu-item>

            <el-menu-item index="history">
              <el-icon><Clock /></el-icon>
              <span>历史记录</span>
            </el-menu-item>
          </el-menu>
        </el-aside>

        <el-main class="content-main">
          <TextQRCode v-if="activeMenu === 'text'" />
          <UrlQRCode v-else-if="activeMenu === 'url'" />
          <VCardQRCode v-else-if="activeMenu === 'vcard'" />
          <WifiQRCode v-else-if="activeMenu === 'wifi'" />
          <EmailQRCode v-else-if="activeMenu === 'email'" />
          <PhoneQRCode v-else-if="activeMenu === 'phone'" />
          <BatchGenerator v-else-if="activeMenu === 'batch'" />
          <BarcodeGenerator v-else-if="activeMenu === 'barcode-generator'" />
          <ScannerPage v-else-if="activeMenu === 'scanner'" />
          <ImageScannerPage v-else-if="activeMenu === 'image-scanner'" />
          <TemplateManager v-else-if="activeMenu === 'templates'" />
          <PrintPreview v-else-if="activeMenu === 'print'" />
          <FavoritesList v-else-if="activeMenu === 'favorites'" />
          <HistoryList v-else-if="activeMenu === 'history'" />
        </el-main>
      </el-container>
    </el-container>

    <el-dialog v-model="showAbout" title="关于" width="450px">
      <div class="about-content">
        <h3>二维码工具 v1.4.0</h3>
        <p>一款功能完善的跨平台二维码生成与扫描软件</p>
        <el-divider />
        <h4>功能特性</h4>
        <ul class="feature-list">
          <li>🌙 暗黑模式：护眼夜间模式</li>
          <li>🖼️ Logo嵌入：二维码中心嵌入图片</li>
          <li>⌨️ 快捷键：提升操作效率</li>
          <li>⭐ 收藏夹：常用二维码快速访问</li>
          <li>✨ 二维码美化：渐变色、圆点、艺术风格</li>
          <li>📋 样式模板：预设模板、自定义保存</li>
          <li>🖨️ 打印标签：批量排版、多种尺寸</li>
          <li>📊 条形码生成：Code128、EAN、UPC等</li>
        </ul>
        <el-divider />
        <h4>快捷键</h4>
        <ul class="feature-list">
          <li><kbd>Ctrl+G</kbd> - 生成二维码</li>
          <li><kbd>Ctrl+S</kbd> - 保存二维码</li>
          <li><kbd>Ctrl+C</kbd> - 复制二维码</li>
          <li><kbd>Ctrl+D</kbd> - 切换暗黑模式</li>
        </ul>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'
  import { useThemeStore } from './stores'
  import TextQRCode from './views/TextQRCode.vue'
  import UrlQRCode from './views/UrlQRCode.vue'
  import VCardQRCode from './views/VCardQRCode.vue'
  import WifiQRCode from './views/WifiQRCode.vue'
  import EmailQRCode from './views/EmailQRCode.vue'
  import PhoneQRCode from './views/PhoneQRCode.vue'
  import BatchGenerator from './views/BatchGenerator.vue'
  import BarcodeGenerator from './views/BarcodeGenerator.vue'
  import ScannerPage from './views/ScannerPage.vue'
  import ImageScannerPage from './views/ImageScannerPage.vue'
  import TemplateManager from './views/TemplateManager.vue'
  import PrintPreview from './views/PrintPreview.vue'
  import FavoritesList from './views/FavoritesList.vue'
  import HistoryList from './views/HistoryList.vue'

  const themeStore = useThemeStore()
  const activeMenu = ref('text')
  const showAbout = ref(false)

  const emit = defineEmits<{
    (e: 'generate'): void
    (e: 'save'): void
    (e: 'copy'): void
  }>()

  const handleMenuSelect = (index: string) => {
    activeMenu.value = index
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'g':
          e.preventDefault()
          emit('generate')
          break
        case 's':
          e.preventDefault()
          emit('save')
          break
        case 'c':
          if (e.shiftKey) {
            e.preventDefault()
            emit('copy')
          }
          break
        case 'd':
          e.preventDefault()
          themeStore.toggleTheme()
          break
      }
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })
</script>

<style>
  .app-container {
    height: 100vh;
    background-color: #f5f7fa;
    transition: background-color 0.3s;
  }

  .app-container.dark-mode {
    background-color: #1a1a1a;
  }

  .app-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 0 20px;
  }

  .dark-mode .app-header {
    background: linear-gradient(135deg, #2c3e50 0%, #1a1a2e 100%);
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 18px;
    font-weight: 600;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .header-actions .el-button {
    color: white;
  }

  .main-container {
    height: calc(100vh - 60px);
  }

  .sidebar {
    background-color: #fff;
    border-right: 1px solid #e4e7ed;
    overflow-y: auto;
  }

  .dark-mode .sidebar {
    background-color: #252526;
    border-right-color: #3c3c3c;
  }

  .sidebar-menu {
    border-right: none;
    height: 100%;
  }

  .dark-mode .sidebar-menu {
    background-color: #252526;
  }

  .dark-mode .sidebar-menu .el-menu-item,
  .dark-mode .sidebar-menu .el-sub-menu__title {
    color: #cccccc;
  }

  .dark-mode .sidebar-menu .el-menu-item:hover,
  .dark-mode .sidebar-menu .el-sub-menu__title:hover {
    background-color: #2a2d2e;
  }

  .dark-mode .sidebar-menu .el-menu-item.is-active {
    color: #667eea;
    background-color: #2a2d2e;
  }

  .content-main {
    padding: 20px;
    overflow-y: auto;
    background-color: #f5f7fa;
  }

  .dark-mode .content-main {
    background-color: #1e1e1e;
  }

  .about-content {
    text-align: center;
  }

  .about-content h3 {
    margin-bottom: 10px;
    color: #303133;
  }

  .dark-mode .about-content h3,
  .dark-mode .about-content h4 {
    color: #e0e0e0;
  }

  .about-content h4 {
    margin: 16px 0 8px;
    color: #303133;
  }

  .about-content p {
    color: #606266;
    margin: 8px 0;
  }

  .dark-mode .about-content p,
  .dark-mode .feature-list li {
    color: #a0a0a0;
  }

  .feature-list {
    text-align: left;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .feature-list li {
    padding: 6px 0;
    color: #606266;
    font-size: 14px;
  }

  .feature-list kbd {
    background-color: #f0f0f0;
    border: 1px solid #d0d0d0;
    border-radius: 4px;
    padding: 2px 6px;
    font-family: monospace;
    font-size: 12px;
  }

  .dark-mode .feature-list kbd {
    background-color: #3c3c3c;
    border-color: #555;
    color: #e0e0e0;
  }
</style>
