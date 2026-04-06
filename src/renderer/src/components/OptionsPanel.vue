<template>
  <div class="options-panel">
    <div class="form-section">
      <div class="form-section-title">样式设置</div>

      <el-form label-width="80px" size="default">
        <el-form-item label="尺寸">
          <el-slider
            v-model="localOptions.width"
            :min="100"
            :max="800"
            :step="50"
            show-input
            :show-input-controls="false"
          />
        </el-form-item>

        <el-form-item label="边距">
          <el-slider
            v-model="localOptions.margin"
            :min="0"
            :max="10"
            show-input
            :show-input-controls="false"
          />
        </el-form-item>

        <el-form-item label="容错级别">
          <el-select v-model="localOptions.errorCorrectionLevel" style="width: 100%">
            <el-option
              v-for="item in ERROR_CORRECTION_OPTIONS"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="前景色">
          <div class="color-picker-row">
            <el-color-picker v-model="localOptions.color.dark" show-alpha />
            <el-input v-model="localOptions.color.dark" style="width: 120px" />
          </div>
        </el-form-item>

        <el-form-item label="背景色">
          <div class="color-picker-row">
            <el-color-picker v-model="localOptions.color.light" show-alpha />
            <el-input v-model="localOptions.color.light" style="width: 120px" />
          </div>
        </el-form-item>
      </el-form>
    </div>

    <div class="form-section">
      <div class="form-section-title">Logo设置</div>

      <el-form label-width="80px" size="default">
        <el-form-item label="嵌入Logo">
          <el-switch v-model="enableLogo" />
        </el-form-item>

        <el-form-item v-if="enableLogo" label="选择图片">
          <el-button @click="selectLogo">
            <el-icon><Upload /></el-icon>
            选择Logo
          </el-button>
          <span v-if="logoSrc" class="logo-name">{{ logoName }}</span>
        </el-form-item>

        <el-form-item v-if="enableLogo" label="Logo大小">
          <el-slider
            v-model="logoSize"
            :min="20"
            :max="150"
            :step="5"
            show-input
            :show-input-controls="false"
          />
        </el-form-item>
      </el-form>
    </div>

    <div class="form-section">
      <el-button type="info" @click="resetOptions">
        <el-icon><RefreshRight /></el-icon>
        重置为默认
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import type { QRCodeOptions } from '../types/qrcode'
  import { DEFAULT_OPTIONS, ERROR_CORRECTION_OPTIONS } from '../types/qrcode'

  const props = defineProps<{
    modelValue: QRCodeOptions
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: QRCodeOptions]
    'update:logo': [value: { src: string; size: number } | undefined]
  }>()

  const localOptions = ref<QRCodeOptions>({ ...props.modelValue })
  const enableLogo = ref(false)
  const logoSrc = ref('')
  const logoName = ref('')
  const logoSize = ref(60)

  watch(
    localOptions,
    (val) => {
      emit('update:modelValue', { ...val })
    },
    { deep: true }
  )

  watch([enableLogo, logoSrc, logoSize], () => {
    if (enableLogo.value && logoSrc.value) {
      emit('update:logo', {
        src: logoSrc.value,
        size: logoSize.value
      })
    } else {
      emit('update:logo', undefined)
    }
  })

  async function selectLogo() {
    const result = await window.electronAPI.openFile({
      filters: [{ name: '图片文件', extensions: ['png', 'jpg', 'jpeg', 'gif', 'svg'] }]
    })

    if (!result.canceled && result.filePaths.length > 0) {
      const file = result.filePaths[0]
      const fileResult = await window.electronAPI.readBufferFile(file)

      if (fileResult.success && fileResult.data) {
        logoSrc.value = `data:image/png;base64,${fileResult.data}`
        const basename = await window.electronAPI.pathBasename(file)
        logoName.value = basename
      }
    }
  }

  function resetOptions() {
    localOptions.value = { ...DEFAULT_OPTIONS }
    enableLogo.value = false
    logoSrc.value = ''
    logoName.value = ''
    logoSize.value = 60
  }
</script>

<style scoped>
  .options-panel {
    padding: 10px;
  }

  .logo-name {
    margin-left: 10px;
    color: #606266;
    font-size: 13px;
  }
</style>
