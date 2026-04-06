<template>
  <div class="barcode-generator">
    <div class="generator-form">
      <div class="form-section">
        <div class="form-section-title">条形码内容</div>
        <el-form label-width="80px">
          <el-form-item label="条码类型">
            <el-select v-model="barcodeType" style="width: 100%" @change="handleTypeChange">
              <el-option
                v-for="item in BARCODE_TYPE_OPTIONS"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
                <div class="barcode-type-option">
                  <span class="type-label">{{ item.label }}</span>
                  <span class="type-desc">{{ item.description }}</span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="内容">
            <el-input
              v-model="content"
              :placeholder="getPlaceholder"
              clearable
              @input="validateContent"
            />
          </el-form-item>

          <el-alert
            v-if="validationMessage"
            :title="validationMessage"
            :type="isValid ? 'success' : 'error'"
            :closable="false"
            show-icon
            style="margin-bottom: 16px"
          />
        </el-form>
      </div>

      <div class="form-section">
        <div class="form-section-title">样式设置</div>
        <el-form label-width="80px">
          <el-form-item label="条宽">
            <el-slider v-model="options.width" :min="1" :max="5" :step="0.5" show-input />
          </el-form-item>

          <el-form-item label="高度">
            <el-slider v-model="options.height" :min="50" :max="200" :step="10" show-input />
          </el-form-item>

          <el-form-item label="显示文字">
            <el-switch v-model="options.showText" />
          </el-form-item>

          <el-form-item v-if="options.showText" label="字号">
            <el-slider v-model="options.fontSize" :min="10" :max="24" :step="1" show-input />
          </el-form-item>

          <el-form-item label="条码颜色">
            <el-color-picker v-model="options.barColor" />
          </el-form-item>

          <el-form-item label="背景颜色">
            <el-color-picker v-model="options.backgroundColor" show-alpha />
          </el-form-item>
        </el-form>
      </div>
    </div>

    <div class="generator-preview">
      <div class="preview-container">
        <div v-if="loading" class="loading-placeholder">
          <el-icon class="is-loading" :size="40"><Loading /></el-icon>
          <span>生成中...</span>
        </div>
        <div v-else-if="error" class="error-placeholder">
          <el-icon :size="40"><WarningFilled /></el-icon>
          <span>{{ error }}</span>
        </div>
        <div v-else-if="dataUrl" class="barcode-display">
          <img :src="dataUrl" alt="Barcode" />
        </div>
        <div v-else class="empty-placeholder">
          <el-icon :size="60"><Tickets /></el-icon>
          <span>输入内容生成条形码</span>
        </div>
      </div>

      <div v-if="dataUrl" class="preview-actions">
        <el-button type="primary" @click="handleCopy">
          <el-icon><CopyDocument /></el-icon>
          复制
        </el-button>
        <el-button @click="handleSave('png')">
          <el-icon><Download /></el-icon>
          保存PNG
        </el-button>
        <el-button @click="handleSave('svg')">
          <el-icon><Download /></el-icon>
          保存SVG
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { BarcodeType, BarcodeOptions } from '../types/barcode'
  import {
    BARCODE_TYPE_OPTIONS,
    DEFAULT_BARCODE_OPTIONS,
    validateBarcodeContent
  } from '../types/barcode'
  import { generateBarcode, generateBarcodeSvg } from '../utils/barcode'

  const content = ref('')
  const barcodeType = ref<BarcodeType>('code128')
  const options = ref<BarcodeOptions>({ ...DEFAULT_BARCODE_OPTIONS })
  const dataUrl = ref('')
  const loading = ref(false)
  const error = ref('')
  const isValid = ref(false)
  const validationMessage = ref('')

  const getPlaceholder = computed(() => {
    const placeholders: Record<BarcodeType, string> = {
      code128: '支持数字、字母和特殊字符',
      code39: '支持数字、大写字母和 - . $ / + %',
      code93: '支持数字、大写字母和 - . $ / + %',
      ean13: '请输入12位数字',
      ean8: '请输入7位数字',
      upca: '请输入11位数字',
      upce: '请输入6位数字',
      itf: '请输入偶数位数字',
      codabar: '支持数字和 - $ : / . +',
      databar: '请输入数字'
    }
    return placeholders[barcodeType.value]
  })

  function validateContent() {
    if (!content.value.trim()) {
      isValid.value = false
      validationMessage.value = ''
      return
    }

    const result = validateBarcodeContent(content.value, barcodeType.value)
    isValid.value = result.valid
    validationMessage.value = result.valid ? '格式正确' : result.message
  }

  function handleTypeChange() {
    validateContent()
    dataUrl.value = ''
    error.value = ''
  }

  watch(
    [content, options],
    async () => {
      if (!content.value.trim() || !isValid.value) {
        dataUrl.value = ''
        return
      }

      loading.value = true
      error.value = ''

      try {
        dataUrl.value = await generateBarcode(content.value, options.value)
      } catch (e: any) {
        error.value = e.message || '生成失败'
        dataUrl.value = ''
      } finally {
        loading.value = false
      }
    },
    { deep: true }
  )

  async function handleCopy() {
    if (!dataUrl.value) return

    try {
      await window.electronAPI.copyImageToClipboard(dataUrl.value)
      ElMessage.success('已复制到剪贴板')
    } catch {
      ElMessage.error('复制失败')
    }
  }

  async function handleSave(format: 'png' | 'svg') {
    if (!content.value) return

    const filters =
      format === 'svg'
        ? [{ name: 'SVG图片', extensions: ['svg'] }]
        : [{ name: 'PNG图片', extensions: ['png'] }]

    const ext = format === 'svg' ? 'svg' : 'png'

    const result = await window.electronAPI.saveFile({
      defaultName: `barcode.${ext}`,
      filters
    })

    if (result.canceled || !result.filePath) return

    try {
      if (format === 'svg') {
        const svgContent = await generateBarcodeSvg(content.value, options.value)
        await window.electronAPI.saveSvgToFile(result.filePath, svgContent)
      } else {
        const base64 = dataUrl.value.split(',')[1]
        await window.electronAPI.saveToFile(result.filePath, base64)
      }
      ElMessage.success('保存成功')
    } catch {
      ElMessage.error('保存失败')
    }
  }
</script>

<style scoped>
  .barcode-generator {
    display: flex;
    gap: 30px;
    height: 100%;
  }

  .generator-form {
    flex: 1;
    max-width: 500px;
  }

  .generator-preview {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .preview-container {
    background: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    min-width: 400px;
    min-height: 200px;
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

  .barcode-display img {
    max-width: 100%;
    height: auto;
  }

  .preview-actions {
    margin-top: 20px;
    display: flex;
    gap: 10px;
  }

  .form-section {
    margin-bottom: 20px;
  }

  .form-section-title {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #ebeef5;
  }

  .barcode-type-option {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .type-label {
    font-weight: 500;
  }

  .type-desc {
    font-size: 12px;
    color: #909399;
  }
</style>
