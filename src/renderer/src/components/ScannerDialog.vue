<template>
  <el-dialog
    v-model="visible"
    title="扫描二维码"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="scanner-container">
      <div v-if="error" class="error-state">
        <el-icon :size="48"><WarningFilled /></el-icon>
        <p>{{ error }}</p>
        <el-button type="primary" @click="requestCamera">重新请求权限</el-button>
      </div>
      
      <div v-else-if="!hasPermission" class="permission-request">
        <el-icon :size="48"><Camera /></el-icon>
        <p>需要摄像头权限才能扫描二维码</p>
        <el-button type="primary" @click="requestCamera" :loading="requesting">
          授权摄像头
        </el-button>
      </div>
      
      <div v-else class="scanner-view">
        <div class="video-wrapper">
          <video ref="videoRef" autoplay playsinline muted></video>
          <canvas ref="canvasRef" style="display: none;"></canvas>
          
          <div class="scan-overlay">
            <div class="scan-frame">
              <div class="corner top-left"></div>
              <div class="corner top-right"></div>
              <div class="corner bottom-left"></div>
              <div class="corner bottom-right"></div>
              <div class="scan-line" :class="{ scanning: isScanning }"></div>
            </div>
          </div>
          
          <div class="scan-tips">
            <el-icon><InfoFilled /></el-icon>
            <span>将二维码放入框内自动扫描</span>
          </div>
        </div>
        
        <div class="scanner-controls">
          <el-button @click="toggleCamera" :disabled="!isScanning">
            <el-icon><Refresh /></el-icon>
            切换摄像头
          </el-button>
          <el-button @click="toggleFlash" :disabled="!isScanning">
            <el-icon><Sunny /></el-icon>
            {{ flashEnabled ? '关闭闪光灯' : '开启闪光灯' }}
          </el-button>
        </div>
      </div>
    </div>
    
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { ScanResult } from '../types/scanner'
import { DEFAULT_SCANNER_CONFIG } from '../types/scanner'
import { scanFromCanvas, parseScanContent } from '../utils/scanner'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'scan-success': [result: ScanResult]
}>()

const visible = ref(props.modelValue)
const videoRef = ref<HTMLVideoElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const hasPermission = ref<boolean | null>(null)
const isScanning = ref(false)
const error = ref('')
const requesting = ref(false)
const flashEnabled = ref(false)

let mediaStream: MediaStream | null = null
let scanInterval: number | null = null
let currentFacingMode: 'user' | 'environment' = DEFAULT_SCANNER_CONFIG.facingMode
let track: MediaStreamTrack | null = null

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    requestCamera()
  } else {
    stopScanning()
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

async function requestCamera() {
  requesting.value = true
  error.value = ''
  
  try {
    const constraints: MediaStreamConstraints = {
      video: {
        facingMode: currentFacingMode,
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    }
    
    mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
    hasPermission.value = true
    
    if (videoRef.value) {
      videoRef.value.srcObject = mediaStream
      await videoRef.value.play()
      
      track = mediaStream.getVideoTracks()[0]
      startScanning()
    }
  } catch (e: any) {
    hasPermission.value = false
    
    if (e.name === 'NotAllowedError') {
      error.value = '摄像头权限被拒绝，请在浏览器设置中允许访问摄像头'
    } else if (e.name === 'NotFoundError') {
      error.value = '未找到可用的摄像头设备'
    } else if (e.name === 'NotReadableError') {
      error.value = '摄像头被其他应用程序占用'
    } else {
      error.value = `无法访问摄像头: ${e.message || '未知错误'}`
    }
  } finally {
    requesting.value = false
  }
}

function startScanning() {
  if (!videoRef.value || !canvasRef.value) return
  
  isScanning.value = true
  
  scanInterval = window.setInterval(async () => {
    if (!videoRef.value || !canvasRef.value || !isScanning.value) return
    
    try {
      const code = await scanFromCanvas(canvasRef.value, videoRef.value)
      
      if (code) {
        handleScanSuccess(code)
      }
    } catch (e) {
      console.error('扫描错误:', e)
    }
  }, DEFAULT_SCANNER_CONFIG.scanInterval)
}

function stopScanning() {
  isScanning.value = false
  
  if (scanInterval) {
    clearInterval(scanInterval)
    scanInterval = null
  }
  
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop())
    mediaStream = null
  }
  
  track = null
  flashEnabled.value = false
}

function handleScanSuccess(code: string) {
  stopScanning()
  
  try {
    const result = parseScanContent(code)
    emit('scan-success', result)
    ElMessage.success('扫描成功！')
    handleClose()
  } catch (e) {
    ElMessage.error('解析二维码失败')
  }
}

async function toggleCamera() {
  currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user'
  stopScanning()
  await requestCamera()
}

async function toggleFlash() {
  if (!track) return
  
  try {
    const capabilities = track.getCapabilities()
    if ('torch' in capabilities) {
      flashEnabled.value = !flashEnabled.value
      await track.applyConstraints({
        advanced: [{ torch: flashEnabled.value } as any]
      })
    } else {
      ElMessage.warning('当前设备不支持闪光灯')
    }
  } catch (e) {
    ElMessage.error('无法控制闪光灯')
  }
}

function handleClose() {
  stopScanning()
  visible.value = false
}

onUnmounted(() => {
  stopScanning()
})
</script>

<style scoped>
.scanner-container {
  min-height: 350px;
}

.error-state,
.permission-request {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 350px;
  gap: 16px;
  color: #909399;
}

.error-state {
  color: #f56c6c;
}

.scanner-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.video-wrapper {
  position: relative;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  background: #000;
}

.video-wrapper video {
  width: 100%;
  height: 300px;
  object-fit: cover;
}

.scan-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.scan-frame {
  width: 200px;
  height: 200px;
  position: relative;
}

.corner {
  position: absolute;
  width: 20px;
  height: 20px;
  border-color: #409eff;
  border-style: solid;
  border-width: 0;
}

.corner.top-left {
  top: 0;
  left: 0;
  border-top-width: 3px;
  border-left-width: 3px;
  border-top-left-radius: 8px;
}

.corner.top-right {
  top: 0;
  right: 0;
  border-top-width: 3px;
  border-right-width: 3px;
  border-top-right-radius: 8px;
}

.corner.bottom-left {
  bottom: 0;
  left: 0;
  border-bottom-width: 3px;
  border-left-width: 3px;
  border-bottom-left-radius: 8px;
}

.corner.bottom-right {
  bottom: 0;
  right: 0;
  border-bottom-width: 3px;
  border-right-width: 3px;
  border-bottom-right-radius: 8px;
}

.scan-line {
  position: absolute;
  left: 10px;
  right: 10px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #409eff, transparent);
  top: 10px;
}

.scan-line.scanning {
  animation: scan 2s linear infinite;
}

@keyframes scan {
  0% {
    top: 10px;
  }
  50% {
    top: calc(100% - 12px);
  }
  100% {
    top: 10px;
  }
}

.scan-tips {
  position: absolute;
  bottom: 16px;
  left: 0;
  right: 0;
  text-align: center;
  color: #fff;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.scanner-controls {
  display: flex;
  justify-content: center;
  gap: 12px;
}
</style>
