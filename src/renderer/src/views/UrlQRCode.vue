<template>
  <div class="qrcode-generator">
    <div class="generator-form">
      <div class="form-section">
        <div class="form-section-title">网址信息</div>
        <el-form label-width="80px">
          <el-form-item label="网址">
            <el-input
              v-model="url"
              placeholder="请输入网址，如 https://example.com"
              clearable
            >
              <template #prepend>
                <el-select v-model="protocol" style="width: 100px">
                  <el-option label="https://" value="https://" />
                  <el-option label="http://" value="http://" />
                </el-select>
              </template>
            </el-input>
          </el-form-item>
        </el-form>
        <el-alert
          v-if="url && !isValidUrl"
          title="请输入有效的网址格式"
          type="warning"
          :closable="false"
          show-icon
          style="margin-top: 10px"
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
import { validateUrl } from '../utils/qrcode'

const url = ref('')
const protocol = ref('https://')
const options = ref<QRCodeOptions>({ ...DEFAULT_OPTIONS })
const logo = ref<{ src: string; size: number } | undefined>()

const isValidUrl = computed(() => {
  if (!url.value) return true
  const fullUrl = protocol.value + url.value.replace(/^https?:\/\//, '')
  return validateUrl(fullUrl)
})

const qrData = computed<QRCodeData | null>(() => {
  if (!url.value.trim()) return null
  
  const fullUrl = protocol.value + url.value.replace(/^https?:\/\//, '')
  
  return {
    type: 'url',
    content: fullUrl,
    options: options.value,
    logo: logo.value
  }
})

function handleLogoUpdate(value: { src: string; size: number } | undefined) {
  logo.value = value
}
</script>
