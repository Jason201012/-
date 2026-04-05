<template>
  <div class="qrcode-preview">
    <div class="qrcode-display">
      <div v-if="loading" class="loading-placeholder">
        <el-icon class="is-loading" :size="40"><Loading /></el-icon>
        <span>生成中...</span>
      </div>
      <div v-else-if="error" class="error-placeholder">
        <el-icon :size="40"><WarningFilled /></el-icon>
        <span>{{ error }}</span>
      </div>
      <div v-else-if="dataUrl" class="qrcode-image">
        <img :src="dataUrl" alt="QR Code" />
      </div>
      <div v-else class="empty-placeholder">
        <el-icon :size="60"><Grid /></el-icon>
        <span>输入内容生成二维码</span>
      </div>
    </div>
    
    <div v-if="dataUrl" class="qrcode-actions">
      <el-button type="primary" @click="handleCopy">
        <el-icon><CopyDocument /></el-icon>
        复制
      </el-button>
      <el-button @click="handleSave('png')">
        <el-icon><Download /></el-icon>
        保存PNG
      </el-button>
      <el-button @click="handleSave('jpg')">
        <el-icon><Download /></el-icon>
        保存JPG
      </el-button>
      <el-button @click="handleSave('svg')">
        <el-icon><Download /></el-icon>
        保存SVG
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { QRCodeData } from '../types/qrcode'
import { generateQRCode, generateQRCodeSvg } from '../utils/qrcode'
import { useHistoryStore } from '../stores'

const props = defineProps<{
  qrData: QRCodeData | null
}>()

const historyStore = useHistoryStore()
const dataUrl = ref('')
const loading = ref(false)
const error = ref('')
let lastContent = ''

watch(() => props.qrData, async (newData) => {
  if (!newData || !newData.content) {
    dataUrl.value = ''
    error.value = ''
    return
  }
  
  if (newData.content === lastContent) {
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    dataUrl.value = await generateQRCode(newData)
    lastContent = newData.content
    
    historyStore.addHistory({
      type: newData.type,
      content: newData.content,
      options: newData.options,
      dataUrl: dataUrl.value
    })
  } catch (e: any) {
    error.value = e.message || '生成失败'
    dataUrl.value = ''
  } finally {
    loading.value = false
  }
}, { immediate: true, deep: true })

async function handleCopy() {
  if (!dataUrl.value) return
  
  try {
    await window.electronAPI.copyImageToClipboard(dataUrl.value)
    ElMessage.success('已复制到剪贴板')
  } catch (e) {
    ElMessage.error('复制失败')
  }
}

async function handleSave(format: 'png' | 'jpg' | 'svg') {
  if (!props.qrData) return
  
  const filters = format === 'svg' 
    ? [{ name: 'SVG图片', extensions: ['svg'] }]
    : format === 'jpg'
      ? [{ name: 'JPEG图片', extensions: ['jpg', 'jpeg'] }]
      : [{ name: 'PNG图片', extensions: ['png'] }]
  
  const ext = format === 'svg' ? 'svg' : format === 'jpg' ? 'jpg' : 'png'
  
  const result = await window.electronAPI.saveFile({
    defaultName: `qrcode.${ext}`,
    filters
  })
  
  if (result.canceled || !result.filePath) return
  
  try {
    if (format === 'svg') {
      const svgContent = await generateQRCodeSvg(props.qrData)
      await window.electronAPI.saveSvgToFile(result.filePath, svgContent)
    } else {
      const base64 = dataUrl.value.split(',')[1]
      await window.electronAPI.saveToFile(result.filePath, base64)
    }
    ElMessage.success('保存成功')
  } catch (e) {
    ElMessage.error('保存失败')
  }
}
</script>

<style scoped>
.qrcode-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qrcode-display {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  min-width: 340px;
  min-height: 340px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-placeholder,
.error-placeholder,
.empty-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #909399;
}

.error-placeholder {
  color: #f56c6c;
}

.qrcode-image img {
  max-width: 300px;
  max-height: 300px;
}

.qrcode-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}
</style>
