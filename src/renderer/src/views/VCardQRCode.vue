<template>
  <div class="qrcode-generator">
    <div class="generator-form">
      <div class="form-section">
        <div class="form-section-title">名片信息</div>
        <el-form label-width="80px">
          <el-form-item label="姓名" required>
            <el-input v-model="vcard.name" placeholder="请输入姓名" />
          </el-form-item>
          <el-form-item label="电话">
            <el-input v-model="vcard.phone" placeholder="请输入电话号码" />
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="vcard.email" placeholder="请输入邮箱地址" />
          </el-form-item>
          <el-form-item label="公司">
            <el-input v-model="vcard.organization" placeholder="请输入公司名称" />
          </el-form-item>
          <el-form-item label="职位">
            <el-input v-model="vcard.title" placeholder="请输入职位" />
          </el-form-item>
          <el-form-item label="地址">
            <el-input v-model="vcard.address" placeholder="请输入地址" />
          </el-form-item>
          <el-form-item label="网站">
            <el-input v-model="vcard.website" placeholder="请输入网站地址" />
          </el-form-item>
        </el-form>
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
  import type { QRCodeData, QRCodeOptions, VCardData } from '../types/qrcode'
  import { DEFAULT_OPTIONS } from '../types/qrcode'
  import { formatVCard } from '../utils/qrcode'

  const vcard = ref<VCardData>({
    name: '',
    phone: '',
    email: '',
    organization: '',
    title: '',
    address: '',
    website: ''
  })

  const options = ref<QRCodeOptions>({ ...DEFAULT_OPTIONS })
  const logo = ref<{ src: string; size: number } | undefined>()

  const qrData = computed<QRCodeData | null>(() => {
    if (!vcard.value.name.trim()) return null

    return {
      type: 'vcard',
      content: formatVCard(vcard.value),
      options: options.value,
      logo: logo.value
    }
  })

  function handleLogoUpdate(value: { src: string; size: number } | undefined) {
    logo.value = value
  }
</script>
