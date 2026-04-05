<template>
  <div class="app-container">
    <el-container>
      <el-header class="app-header">
        <div class="logo">
          <el-icon :size="24"><Grid /></el-icon>
          <span>二维码工具</span>
        </div>
        <div class="header-actions">
          <el-button text @click="showAbout = true">
            <el-icon><InfoFilled /></el-icon>
            关于
          </el-button>
        </div>
      </el-header>
      
      <el-container class="main-container">
        <el-aside width="220px" class="sidebar">
          <el-menu
            :default-active="activeMenu"
            @select="handleMenuSelect"
            class="sidebar-menu"
          >
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
          <ScannerPage v-else-if="activeMenu === 'scanner'" />
          <ImageScannerPage v-else-if="activeMenu === 'image-scanner'" />
          <HistoryList v-else-if="activeMenu === 'history'" />
        </el-main>
      </el-container>
    </el-container>
    
    <el-dialog v-model="showAbout" title="关于" width="400px">
      <div class="about-content">
        <h3>二维码工具 v1.2.0</h3>
        <p>一款功能完善的跨平台二维码生成与扫描软件</p>
        <el-divider />
        <p>支持多种二维码类型：文本、网址、名片、WiFi等</p>
        <p>支持自定义样式、批量生成、Logo嵌入</p>
        <p>支持摄像头扫描和图片识别二维码/条形码</p>
        <p>支持多种条形码格式：EAN、UPC、Code128等</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TextQRCode from './views/TextQRCode.vue'
import UrlQRCode from './views/UrlQRCode.vue'
import VCardQRCode from './views/VCardQRCode.vue'
import WifiQRCode from './views/WifiQRCode.vue'
import EmailQRCode from './views/EmailQRCode.vue'
import PhoneQRCode from './views/PhoneQRCode.vue'
import BatchGenerator from './views/BatchGenerator.vue'
import ScannerPage from './views/ScannerPage.vue'
import ImageScannerPage from './views/ImageScannerPage.vue'
import HistoryList from './views/HistoryList.vue'

const activeMenu = ref('text')
const showAbout = ref(false)

const handleMenuSelect = (index: string) => {
  activeMenu.value = index
}
</script>
