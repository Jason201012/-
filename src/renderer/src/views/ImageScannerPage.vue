<template>
  <div class="image-scanner-page">
    <div class="page-header">
      <h2>图片扫码</h2>
      <p>从图片中识别二维码和条形码</p>
    </div>
    
    <div class="scan-area">
      <div 
        class="upload-zone"
        :class="{ 'drag-over': isDragOver }"
        @dragover.prevent="isDragOver = true"
        @dragleave.prevent="isDragOver = false"
        @drop.prevent="handleDrop"
        @click="triggerFileInput"
      >
        <input 
          ref="fileInputRef"
          type="file" 
          accept="image/*" 
          style="display: none;"
          @change="handleFileSelect"
        />
        
        <div v-if="!previewImage" class="upload-placeholder">
          <el-icon :size="48"><UploadFilled /></el-icon>
          <p>点击或拖拽图片到此处</p>
          <p class="sub-text">支持 JPG、PNG、GIF、BMP 格式</p>
        </div>
        
        <div v-else class="preview-container">
          <img :src="previewImage" alt="预览图片" />
          <div v-if="isScanning" class="scanning-overlay">
            <div class="scanning-animation">
              <el-icon class="is-loading" :size="32"><Loading /></el-icon>
              <span>正在识别...</span>
            </div>
          </div>
          <div v-if="scanResult && scanResult.position" class="result-overlay">
            <div 
              class="result-box"
              :style="{
                left: `${(scanResult.position.x / imageWidth) * 100}%`,
                top: `${(scanResult.position.y / imageHeight) * 100}%`,
                width: `${(scanResult.position.width / imageWidth) * 100}%`,
                height: `${(scanResult.position.height / imageHeight) * 100}%`
              }"
            ></div>
          </div>
        </div>
      </div>
      
      <div class="action-buttons">
        <el-button type="primary" @click="triggerFileInput" :disabled="isScanning">
          <el-icon><FolderOpened /></el-icon>
          选择图片
        </el-button>
        <el-button @click="pasteFromClipboard" :disabled="isScanning">
          <el-icon><DocumentCopy /></el-icon>
          从剪贴板粘贴
        </el-button>
        <el-button v-if="previewImage" @click="clearImage" :disabled="isScanning">
          <el-icon><Delete /></el-icon>
          清除
        </el-button>
      </div>
    </div>
    
    <div v-if="error" class="error-area">
      <el-alert type="error" :title="error" show-icon closable @close="error = ''" />
    </div>
    
    <div v-if="scanResult" class="result-area">
      <div class="result-header">
        <h3>识别结果</h3>
        <div class="result-tags">
          <el-tag :type="getResultTagType(scanResult.type)">
            {{ getResultTypeLabel(scanResult.type) }}
          </el-tag>
          <el-tag type="info">
            {{ getBarcodeFormatName(scanResult.format) }}
          </el-tag>
          <el-tag v-if="scanResult.confidence < 0.8" type="warning">
            置信度: {{ Math.round(scanResult.confidence * 100) }}%
          </el-tag>
        </div>
      </div>
      
      <el-card class="result-card">
        <div class="result-content">
          <div v-if="scanResult.type === 'wifi'" class="parsed-result">
            <div class="result-item">
              <span class="label">网络名称:</span>
              <span class="value">{{ scanResult.parsedData?.data?.ssid }}</span>
            </div>
            <div class="result-item">
              <span class="label">密码:</span>
              <span class="value">{{ scanResult.parsedData?.data?.password }}</span>
            </div>
            <div class="result-item">
              <span class="label">加密类型:</span>
              <span class="value">{{ scanResult.parsedData?.data?.encryption }}</span>
            </div>
          </div>
          
          <div v-else-if="scanResult.type === 'vcard'" class="parsed-result">
            <div class="result-item" v-if="scanResult.parsedData?.data?.name">
              <span class="label">姓名:</span>
              <span class="value">{{ scanResult.parsedData?.data?.name }}</span>
            </div>
            <div class="result-item" v-if="scanResult.parsedData?.data?.phone">
              <span class="label">电话:</span>
              <span class="value">{{ scanResult.parsedData?.data?.phone }}</span>
            </div>
            <div class="result-item" v-if="scanResult.parsedData?.data?.email">
              <span class="label">邮箱:</span>
              <span class="value">{{ scanResult.parsedData?.data?.email }}</span>
            </div>
          </div>
          
          <div v-else-if="scanResult.type === 'barcode'" class="parsed-result">
            <div class="result-item">
              <span class="label">条形码内容:</span>
              <span class="value">{{ scanResult.rawContent }}</span>
            </div>
          </div>
          
          <div v-else class="raw-result">
            <div class="result-item">
              <span class="label">内容:</span>
              <span class="value">{{ scanResult.rawContent }}</span>
            </div>
          </div>
        </div>
        
        <div class="result-actions">
          <el-button type="primary" @click="copyResult">
            <el-icon><CopyDocument /></el-icon>
            复制内容
          </el-button>
          <el-button v-if="scanResult.type === 'url'" @click="openUrl">
            <el-icon><Link /></el-icon>
            打开链接
          </el-button>
          <el-button v-if="scanResult.type === 'phone'" @click="dialPhone">
            <el-icon><Phone /></el-icon>
            拨打电话
          </el-button>
          <el-button v-if="scanResult.type === 'email'" @click="sendEmail">
            <el-icon><Message /></el-icon>
            发送邮件
          </el-button>
        </div>
      </el-card>
    </div>
    
    <div v-if="scanHistory.length > 0" class="history-area">
      <div class="history-header">
        <h3>扫描历史</h3>
        <el-button text type="danger" @click="clearHistory">清空</el-button>
      </div>
      
      <div class="history-grid">
        <div 
          v-for="item in scanHistory" 
          :key="item.timestamp"
          class="history-item"
          @click="showHistoryItem(item)"
        >
          <el-tag size="small" :type="getResultTagType(item.type)">
            {{ getResultTypeLabel(item.type) }}
          </el-tag>
          <span class="history-text">{{ getPreviewText(item.rawContent) }}</span>
          <span class="history-time">{{ formatTime(item.timestamp) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { ImageScanResult } from '../types/imageScanner'
import { getBarcodeFormatName, isBarcode } from '../utils/imageScanner'
import { scanImageFromBlob } from '../utils/imageScanner'

const fileInputRef = ref<HTMLInputElement | null>(null)
const previewImage = ref('')
const isScanning = ref(false)
const isDragOver = ref(false)
const error = ref('')
const scanResult = ref<ImageScanResult | null>(null)
const scanHistory = ref<ImageScanResult[]>([])
const imageWidth = ref(1)
const imageHeight = ref(1)

function triggerFileInput() {
  fileInputRef.value?.click()
}

async function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return
  
  const file = input.files[0]
  await processImage(file)
  input.value = ''
}

async function handleDrop(event: DragEvent) {
  isDragOver.value = false
  
  const files = event.dataTransfer?.files
  if (!files?.length) return
  
  const file = files[0]
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请上传图片文件')
    return
  }
  
  await processImage(file)
}

async function pasteFromClipboard() {
  try {
    const clipboardItems = await navigator.clipboard.read()
    
    for (const item of clipboardItems) {
      const imageType = item.types.find(type => type.startsWith('image/'))
      if (imageType) {
        const blob = await item.getType(imageType)
        await processImage(blob)
        return
      }
    }
    
    ElMessage.warning('剪贴板中没有图片')
  } catch (e) {
    ElMessage.error('无法读取剪贴板内容')
  }
}

async function processImage(file: Blob) {
  error.value = ''
  scanResult.value = null
  
  previewImage.value = URL.createObjectURL(file)
  isScanning.value = true
  
  const img = new Image()
  img.onload = async () => {
    imageWidth.value = img.naturalWidth
    imageHeight.value = img.naturalHeight
  }
  img.src = previewImage.value
  
  try {
    const result = await scanImageFromBlob(file, { tryHarder: true })
    
    if (result) {
      if (isBarcode(result.format)) {
        result.type = 'barcode'
      }
      scanResult.value = result
      scanHistory.value.unshift(result)
      
      if (scanHistory.value.length > 30) {
        scanHistory.value = scanHistory.value.slice(0, 30)
      }
      
      saveHistory()
      ElMessage.success('识别成功！')
    } else {
      error.value = '未能识别出二维码或条形码，请尝试：\n1. 确保图片清晰\n2. 二维码/条形码区域足够大\n3. 光线均匀、对比度高'
    }
  } catch (e: any) {
    error.value = `识别失败: ${e.message || '未知错误'}`
  } finally {
    isScanning.value = false
  }
}

function clearImage() {
  if (previewImage.value) {
    URL.revokeObjectURL(previewImage.value)
  }
  previewImage.value = ''
  scanResult.value = null
  error.value = ''
}

function getResultTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    url: '网址',
    wifi: 'WiFi',
    vcard: '名片',
    email: '邮件',
    phone: '电话',
    sms: '短信',
    text: '文本',
    barcode: '条形码',
    unknown: '未知'
  }
  return labels[type] || '未知'
}

function getResultTagType(type: string): '' | 'success' | 'warning' | 'info' | 'danger' {
  const types: Record<string, '' | 'success' | 'warning' | 'info' | 'danger'> = {
    url: 'primary',
    wifi: 'success',
    vcard: 'warning',
    email: 'info',
    phone: 'danger',
    sms: 'warning',
    text: 'info',
    barcode: '',
    unknown: 'info'
  }
  return types[type] || 'info'
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getPreviewText(content: string): string {
  if (content.length > 30) {
    return content.substring(0, 30) + '...'
  }
  return content
}

async function copyResult() {
  if (!scanResult.value) return
  
  try {
    await navigator.clipboard.writeText(scanResult.value.rawContent)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

function openUrl() {
  if (!scanResult.value || scanResult.value.type !== 'url') return
  window.open(scanResult.value.rawContent, '_blank')
}

function dialPhone() {
  if (!scanResult.value || scanResult.value.type !== 'phone') return
  window.location.href = scanResult.value.rawContent
}

function sendEmail() {
  if (!scanResult.value || scanResult.value.type !== 'email') return
  window.location.href = scanResult.value.rawContent
}

function showHistoryItem(item: ImageScanResult) {
  scanResult.value = item
}

function clearHistory() {
  scanHistory.value = []
  localStorage.removeItem('image-scan-history')
  ElMessage.success('历史记录已清空')
}

function saveHistory() {
  try {
    localStorage.setItem('image-scan-history', JSON.stringify(scanHistory.value))
  } catch (e) {
    console.error('保存历史记录失败:', e)
  }
}

function loadHistory() {
  try {
    const stored = localStorage.getItem('image-scan-history')
    if (stored) {
      scanHistory.value = JSON.parse(stored)
    }
  } catch (e) {
    console.error('加载历史记录失败:', e)
  }
}

loadHistory()
</script>

<style scoped>
.image-scanner-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  color: #303133;
}

.page-header p {
  margin: 0;
  color: #909399;
}

.scan-area {
  margin-bottom: 20px;
}

.upload-zone {
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #fafafa;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-zone:hover,
.upload-zone.drag-over {
  border-color: #409eff;
  background: #ecf5ff;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #909399;
}

.upload-placeholder .sub-text {
  font-size: 12px;
  color: #c0c4cc;
}

.preview-container {
  position: relative;
  width: 100%;
  max-height: 400px;
}

.preview-container img {
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
  border-radius: 4px;
}

.scanning-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.scanning-animation {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: white;
}

.result-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.result-box {
  position: absolute;
  border: 3px solid #67c23a;
  border-radius: 4px;
  background: rgba(103, 194, 58, 0.1);
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
}

.error-area {
  margin-bottom: 20px;
}

.result-area {
  margin-bottom: 20px;
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.result-header h3 {
  margin: 0;
  color: #303133;
}

.result-tags {
  display: flex;
  gap: 8px;
}

.result-card {
  margin-bottom: 16px;
}

.result-content {
  margin-bottom: 16px;
}

.parsed-result,
.raw-result {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-item {
  display: flex;
  gap: 12px;
}

.result-item .label {
  color: #909399;
  min-width: 80px;
}

.result-item .value {
  color: #303133;
  word-break: break-all;
}

.result-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.history-area {
  margin-top: 30px;
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.history-header h3 {
  margin: 0;
  color: #303133;
}

.history-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
}

.history-item {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.history-item:hover {
  background: #ecf5ff;
}

.history-text {
  display: block;
  color: #606266;
  font-size: 14px;
  margin: 8px 0 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-time {
  font-size: 12px;
  color: #909399;
}
</style>
