<template>
  <div class="qrcode-generator">
    <div class="generator-form">
      <div class="form-section">
        <div class="form-section-title">文本内容</div>
        <el-input
          v-model="text"
          type="textarea"
          :rows="5"
          placeholder="请输入要生成二维码的文本内容..."
          maxlength="2000"
          show-word-limit
        />
      </div>
      
      <OptionsPanel
        v-model="options"
        @update:logo="handleLogoUpdate"
      />
    </div>
    
    <div class="generator-preview">
      <QRCodePreview :qr-data="qrData" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import QRCodePreview from '../components/QRCodePreview.vue'
import OptionsPanel from '../components/OptionsPanel.vue'
import type { QRCodeData, QRCodeOptions } from '../types/qrcode'
import { DEFAULT_OPTIONS } from '../types/qrcode'
import { useHistoryStore } from '../stores'

const text = ref('')
const options = ref<QRCodeOptions>({ ...DEFAULT_OPTIONS })
const logo = ref<{ src: string; size: number } | undefined>()

const historyStore = useHistoryStore()

const qrData = computed<QRCodeData | null>(() => {
  if (!text.value.trim()) return null
  
  return {
    type: 'text',
    content: text.value,
    options: options.value,
    logo: logo.value
  }
})

function handleLogoUpdate(value: { src: string; size: number } | undefined) {
  logo.value = value
}
</script>
