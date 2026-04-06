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
      <el-button :type="isFavorited ? 'warning' : 'default'" @click="handleFavorite">
        <el-icon><Star /></el-icon>
        {{ isFavorited ? '已收藏' : '收藏' }}
      </el-button>
      <el-dropdown @command="handleSave">
        <el-button>
          <el-icon><Download /></el-icon>
          保存
          <el-icon class="el-icon--right"><ArrowDown /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="png">保存为 PNG</el-dropdown-item>
            <el-dropdown-item command="jpg">保存为 JPG</el-dropdown-item>
            <el-dropdown-item command="svg">保存为 SVG</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <div class="logo-section">
      <el-divider>Logo设置</el-divider>
      <div class="logo-controls">
        <el-switch v-model="enableLogo" active-text="启用Logo" inactive-text="禁用" />
        <el-upload
          v-if="enableLogo"
          :show-file-list="false"
          :before-upload="handleLogoUpload"
          accept="image/*"
        >
          <el-button size="small">
            <el-icon><Upload /></el-icon>
            选择Logo
          </el-button>
        </el-upload>
        <el-slider
          v-if="enableLogo && logoSrc"
          v-model="logoSize"
          :min="0.1"
          :max="0.4"
          :step="0.05"
          :format-tooltip="(val: number) => `${Math.round(val * 100)}%`"
          style="width: 150px"
        />
        <el-button v-if="logoSrc" size="small" type="danger" @click="clearLogo">
          清除Logo
        </el-button>
      </div>
      <div v-if="logoSrc" class="logo-preview">
        <img :src="logoSrc" alt="Logo" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, onMounted, computed } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { QRCodeData } from '../types/qrcode'
  import type { QRStyleOptions } from '../types/style'
  import { DEFAULT_STYLE_OPTIONS } from '../types/style'
  import { generateQRCode, generateQRCodeSvg } from '../utils/qrcode'
  import { generateStyledQRCodeDataUrl, generateStyledQRCodeSvg } from '../utils/qrStyler'
  import { useHistoryStore, useFavoritesStore } from '../stores'

  const props = defineProps<{
    qrData: QRCodeData | null
  }>()

  const historyStore = useHistoryStore()
  const favoritesStore = useFavoritesStore()
  const dataUrl = ref('')
  const loading = ref(false)
  const error = ref('')
  const styleOptions = ref<QRStyleOptions>({ ...DEFAULT_STYLE_OPTIONS })
  const enableLogo = ref(false)
  const logoSrc = ref('')
  const logoSize = ref(0.25)
  let lastContent = ''

  const isFavorited = computed(() => {
    if (!props.qrData) return false
    return favoritesStore.isFavorite(props.qrData.content)
  })

  onMounted(() => {
    loadStyleOptions()
    loadLogoSettings()
    window.addEventListener('storage', handleStorageChange)
  })

  function loadStyleOptions() {
    try {
      const stored = localStorage.getItem('qr-current-style')
      if (stored) {
        styleOptions.value = { ...DEFAULT_STYLE_OPTIONS, ...JSON.parse(stored) }
      }
    } catch (e) {
      console.error('加载样式设置失败:', e)
    }
  }

  function loadLogoSettings() {
    try {
      const stored = localStorage.getItem('qr-logo-settings')
      if (stored) {
        const settings = JSON.parse(stored)
        enableLogo.value = settings.enabled || false
        logoSrc.value = settings.src || ''
        logoSize.value = settings.size || 0.25
      }
    } catch (e) {
      console.error('加载Logo设置失败:', e)
    }
  }

  function saveLogoSettings() {
    localStorage.setItem(
      'qr-logo-settings',
      JSON.stringify({
        enabled: enableLogo.value,
        src: logoSrc.value,
        size: logoSize.value
      })
    )
  }

  function handleStorageChange(e: StorageEvent) {
    if (e.key === 'qr-current-style') {
      loadStyleOptions()
    } else if (e.key === 'qr-logo-settings') {
      loadLogoSettings()
    }
  }

  function handleLogoUpload(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      logoSrc.value = e.target?.result as string
      saveLogoSettings()
      ElMessage.success('Logo已设置')
      regenerateQRCode()
    }
    reader.readAsDataURL(file)
    return false
  }

  function clearLogo() {
    logoSrc.value = ''
    enableLogo.value = false
    saveLogoSettings()
    ElMessage.success('Logo已清除')
    regenerateQRCode()
  }

  async function regenerateQRCode() {
    if (!props.qrData || !props.qrData.content) return
    lastContent = ''
    await generateQRCodeInternal(props.qrData)
  }

  async function generateQRCodeInternal(newData: QRCodeData) {
    loading.value = true
    error.value = ''

    try {
      loadStyleOptions()

      const useStyled =
        styleOptions.value.dotsStyle !== 'square' ||
        styleOptions.value.cornersSquareStyle !== 'square' ||
        styleOptions.value.cornersDotStyle !== 'square' ||
        typeof styleOptions.value.dotsColor !== 'string' ||
        (typeof styleOptions.value.backgroundOptions.color === 'string' &&
          styleOptions.value.backgroundOptions.color !== '#ffffff')

      const logoOptions =
        enableLogo.value && logoSrc.value
          ? {
              src: logoSrc.value,
              size: logoSize.value
            }
          : undefined

      if (useStyled || logoOptions) {
        dataUrl.value = await generateStyledQRCodeDataUrl(
          newData.content,
          styleOptions.value,
          newData.options.width,
          newData.options.errorCorrectionLevel,
          logoOptions
        )
      } else {
        dataUrl.value = await generateQRCode(newData)
      }

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
  }

  watch(
    () => props.qrData,
    async (newData) => {
      if (!newData || !newData.content) {
        dataUrl.value = ''
        error.value = ''
        return
      }

      if (newData.content === lastContent) {
        return
      }

      await generateQRCodeInternal(newData)
    },
    { immediate: true, deep: true }
  )

  watch([enableLogo, logoSize], () => {
    saveLogoSettings()
    regenerateQRCode()
  })

  async function handleCopy() {
    if (!dataUrl.value) return

    try {
      await window.electronAPI.copyImageToClipboard(dataUrl.value)
      ElMessage.success('已复制到剪贴板')
    } catch (e) {
      ElMessage.error('复制失败')
    }
  }

  function handleFavorite() {
    if (!props.qrData) return

    if (isFavorited.value) {
      const item = favoritesStore.favorites.find((f) => f.content === props.qrData?.content)
      if (item) {
        favoritesStore.removeFavorite(item.id)
        ElMessage.success('已取消收藏')
      }
    } else {
      const content = props.qrData.content.substring(0, 30)
      favoritesStore.addFavorite({
        name: content,
        type: props.qrData.type,
        content: props.qrData.content,
        options: props.qrData.options
      })
      ElMessage.success('已添加到收藏夹')
    }
  }

  async function handleSave(format: 'png' | 'jpg' | 'svg') {
    if (!props.qrData) return

    const filters =
      format === 'svg'
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
        const useStyled =
          styleOptions.value.dotsStyle !== 'square' ||
          styleOptions.value.cornersSquareStyle !== 'square' ||
          styleOptions.value.cornersDotStyle !== 'square'

        const logoOptions =
          enableLogo.value && logoSrc.value
            ? {
                src: logoSrc.value,
                size: logoSize.value
              }
            : undefined

        let svgContent: string
        if (useStyled || logoOptions) {
          svgContent = await generateStyledQRCodeSvg(
            props.qrData.content,
            styleOptions.value,
            props.qrData.options.width,
            props.qrData.options.errorCorrectionLevel,
            logoOptions
          )
        } else {
          svgContent = await generateQRCodeSvg(props.qrData)
        }
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

  .logo-section {
    margin-top: 20px;
    width: 100%;
    max-width: 340px;
  }

  .logo-controls {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .logo-preview {
    margin-top: 12px;
    display: flex;
    justify-content: center;
  }

  .logo-preview img {
    max-width: 80px;
    max-height: 80px;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
  }
</style>
