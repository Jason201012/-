<template>
  <div class="qrcode-generator">
    <div class="generator-form">
      <div class="form-section">
        <div class="form-section-title">电话信息</div>
        <el-form label-width="80px">
          <el-form-item label="电话号码" required>
            <el-input
              v-model="phone"
              placeholder="请输入电话号码，如 +86 138 0000 0000"
              clearable
            >
              <template #prepend>
                <el-icon><Phone /></el-icon>
              </template>
            </el-input>
          </el-form-item>
        </el-form>
        <el-alert
          title="扫描此二维码可直接拨打电话"
          type="info"
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
import { formatPhone } from '../utils/qrcode'

const phone = ref('')
const options = ref<QRCodeOptions>({ ...DEFAULT_OPTIONS })
const logo = ref<{ src: string; size: number } | undefined>()

const qrData = computed<QRCodeData | null>(() => {
  if (!phone.value.trim()) return null
  
  return {
    type: 'phone',
    content: formatPhone(phone.value),
    options: options.value,
    logo: logo.value
  }
})

function handleLogoUpdate(value: { src: string; size: number } | undefined) {
  logo.value = value
}
</script>
