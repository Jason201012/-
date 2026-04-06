<template>
  <div class="qrcode-generator">
    <div class="generator-form">
      <div class="form-section">
        <div class="form-section-title">WiFi信息</div>
        <el-form label-width="80px">
          <el-form-item label="网络名称" required>
            <el-input v-model="wifi.ssid" placeholder="请输入WiFi名称(SSID)" />
          </el-form-item>
          <el-form-item label="密码" required>
            <el-input
              v-model="wifi.password"
              type="password"
              placeholder="请输入WiFi密码"
              show-password
            />
          </el-form-item>
          <el-form-item label="加密类型">
            <el-select v-model="wifi.encryption" style="width: 100%">
              <el-option label="WPA/WPA2" value="WPA" />
              <el-option label="WEP" value="WEP" />
              <el-option label="无密码" value="nopass" />
            </el-select>
          </el-form-item>
          <el-form-item label="隐藏网络">
            <el-switch v-model="wifi.hidden" />
          </el-form-item>
        </el-form>
        <el-alert
          title="扫描此二维码可直接连接WiFi"
          type="info"
          :closable="false"
          show-icon
          style="margin-top: 10px"
        />
      </div>

      <OptionsPanel v-model="options" @update:logo="handleLogoUpdate" />
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
  import type { QRCodeData, QRCodeOptions, WifiData } from '../types/qrcode'
  import { DEFAULT_OPTIONS } from '../types/qrcode'
  import { formatWifi } from '../utils/qrcode'

  const wifi = ref<WifiData>({
    ssid: '',
    password: '',
    encryption: 'WPA',
    hidden: false
  })

  const options = ref<QRCodeOptions>({ ...DEFAULT_OPTIONS })
  const logo = ref<{ src: string; size: number } | undefined>()

  const qrData = computed<QRCodeData | null>(() => {
    if (!wifi.value.ssid.trim()) return null

    return {
      type: 'wifi',
      content: formatWifi(wifi.value),
      options: options.value,
      logo: logo.value
    }
  })

  function handleLogoUpdate(value: { src: string; size: number } | undefined) {
    logo.value = value
  }
</script>
