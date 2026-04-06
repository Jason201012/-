<template>
  <div class="qrcode-generator">
    <div class="generator-form">
      <div class="form-section">
        <div class="form-section-title">邮件信息</div>
        <el-form label-width="80px">
          <el-form-item label="收件人" required>
            <el-input v-model="email.to" placeholder="请输入收件人邮箱" />
          </el-form-item>
          <el-form-item label="主题">
            <el-input v-model="email.subject" placeholder="请输入邮件主题" />
          </el-form-item>
          <el-form-item label="正文">
            <el-input v-model="email.body" type="textarea" :rows="4" placeholder="请输入邮件正文" />
          </el-form-item>
        </el-form>
        <el-alert
          v-if="email.to && !isValidEmail"
          title="请输入有效的邮箱格式"
          type="warning"
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
  import type { QRCodeData, QRCodeOptions, EmailData } from '../types/qrcode'
  import { DEFAULT_OPTIONS } from '../types/qrcode'
  import { formatEmail, validateEmail } from '../utils/qrcode'

  const email = ref<EmailData>({
    to: '',
    subject: '',
    body: ''
  })

  const options = ref<QRCodeOptions>({ ...DEFAULT_OPTIONS })
  const logo = ref<{ src: string; size: number } | undefined>()

  const isValidEmail = computed(() => {
    if (!email.value.to) return true
    return validateEmail(email.value.to)
  })

  const qrData = computed<QRCodeData | null>(() => {
    if (!email.value.to.trim()) return null

    return {
      type: 'email',
      content: formatEmail(email.value),
      options: options.value,
      logo: logo.value
    }
  })

  function handleLogoUpdate(value: { src: string; size: number } | undefined) {
    logo.value = value
  }
</script>
