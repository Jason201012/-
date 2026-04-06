<template>
  <div class="style-panel">
    <div class="panel-section">
      <div class="section-title">码点样式</div>
      <el-select v-model="localOptions.dotsStyle" style="width: 100%">
        <el-option
          v-for="item in DOT_STYLE_OPTIONS"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </div>

    <div class="panel-section">
      <div class="section-title">定位点样式</div>
      <el-form label-width="70px" size="small">
        <el-form-item label="外框">
          <el-select v-model="localOptions.cornersSquareStyle" style="width: 100%">
            <el-option
              v-for="item in CORNER_SQUARE_STYLE_OPTIONS"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="内点">
          <el-select v-model="localOptions.cornersDotStyle" style="width: 100%">
            <el-option
              v-for="item in CORNER_DOT_STYLE_OPTIONS"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <div class="panel-section">
      <div class="section-title">颜色设置</div>
      <el-form label-width="70px" size="small">
        <el-form-item label="码点颜色">
          <div class="color-row">
            <el-color-picker v-model="dotsColorValue" />
            <el-checkbox v-model="dotsUseGradient" size="small">渐变</el-checkbox>
          </div>
        </el-form-item>

        <template v-if="dotsUseGradient">
          <el-form-item label="渐变类型">
            <el-radio-group v-model="dotsGradient.type" size="small">
              <el-radio-button value="linear">线性</el-radio-button>
              <el-radio-button value="radial">径向</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="起始色">
            <el-color-picker v-model="dotsGradient.colorStops[0].color" />
          </el-form-item>
          <el-form-item label="结束色">
            <el-color-picker v-model="dotsGradient.colorStops[1].color" />
          </el-form-item>
        </template>

        <el-form-item label="定位点色">
          <div class="color-row">
            <el-color-picker v-model="cornersSquareColorValue" />
          </div>
        </el-form-item>

        <el-form-item label="定位内点">
          <div class="color-row">
            <el-color-picker v-model="cornersDotColorValue" />
          </div>
        </el-form-item>

        <el-form-item label="背景色">
          <div class="color-row">
            <el-color-picker v-model="backgroundColorValue" show-alpha />
          </div>
        </el-form-item>
      </el-form>
    </div>

    <div class="panel-section">
      <div class="section-title">预设模板</div>
      <div class="template-grid">
        <div
          v-for="template in presetTemplates"
          :key="template.id"
          class="template-item"
          :class="{ active: selectedTemplate === template.id }"
          @click="applyTemplate(template)"
        >
          <div class="template-preview" :style="getTemplatePreviewStyle(template)">
            <div class="preview-dots"></div>
          </div>
          <div class="template-name">{{ template.name }}</div>
        </div>
      </div>
    </div>

    <div class="panel-section">
      <el-button type="primary" size="small" @click="saveAsTemplate">
        <el-icon><FolderAdd /></el-icon>
        保存为模板
      </el-button>
      <el-button size="small" @click="resetStyle">
        <el-icon><RefreshRight /></el-icon>
        重置
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { QRStyleOptions, StyleTemplate, GradientColor } from '../types/style'
  import {
    DEFAULT_STYLE_OPTIONS,
    DOT_STYLE_OPTIONS,
    CORNER_SQUARE_STYLE_OPTIONS,
    CORNER_DOT_STYLE_OPTIONS
  } from '../types/style'
  import { getAllPresetTemplates } from '../data/presetTemplates'

  const props = defineProps<{
    modelValue: QRStyleOptions
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: QRStyleOptions]
  }>()

  const localOptions = ref<QRStyleOptions>({ ...props.modelValue })
  const presetTemplates = getAllPresetTemplates()
  const selectedTemplate = ref<string | null>(null)

  const dotsUseGradient = ref(false)
  const dotsGradient = ref<GradientColor>({
    type: 'linear',
    rotation: 45,
    colorStops: [
      { offset: 0, color: '#667eea' },
      { offset: 1, color: '#764ba2' }
    ]
  })

  const dotsColorValue = computed({
    get: () =>
      typeof localOptions.value.dotsColor === 'string' ? localOptions.value.dotsColor : '#000000',
    set: (val: string) => {
      if (!dotsUseGradient.value) {
        localOptions.value.dotsColor = val
      }
    }
  })

  const cornersSquareColorValue = computed({
    get: () =>
      typeof localOptions.value.cornersSquareColor === 'string'
        ? localOptions.value.cornersSquareColor
        : '#000000',
    set: (val: string) => {
      localOptions.value.cornersSquareColor = val
    }
  })

  const cornersDotColorValue = computed({
    get: () =>
      typeof localOptions.value.cornersDotColor === 'string'
        ? localOptions.value.cornersDotColor
        : '#000000',
    set: (val: string) => {
      localOptions.value.cornersDotColor = val
    }
  })

  const backgroundColorValue = computed({
    get: () =>
      typeof localOptions.value.backgroundOptions.color === 'string'
        ? localOptions.value.backgroundOptions.color
        : '#ffffff',
    set: (val: string) => {
      localOptions.value.backgroundOptions.color = val
    }
  })

  watch(dotsUseGradient, (use) => {
    if (use) {
      localOptions.value.dotsColor = { ...dotsGradient.value }
    } else {
      localOptions.value.dotsColor = dotsColorValue.value
    }
  })

  watch(
    dotsGradient,
    (val) => {
      if (dotsUseGradient.value) {
        localOptions.value.dotsColor = { ...val }
      }
    },
    { deep: true }
  )

  watch(
    localOptions,
    (val) => {
      emit('update:modelValue', { ...val })
    },
    { deep: true }
  )

  function applyTemplate(template: StyleTemplate) {
    localOptions.value = { ...template.options }
    selectedTemplate.value = template.id

    if (typeof template.options.dotsColor !== 'string') {
      dotsUseGradient.value = true
      dotsGradient.value = { ...template.options.dotsColor }
    } else {
      dotsUseGradient.value = false
    }

    ElMessage.success(`已应用模板: ${template.name}`)
  }

  function getTemplatePreviewStyle(template: StyleTemplate) {
    const bgColor =
      typeof template.options.backgroundOptions.color === 'string'
        ? template.options.backgroundOptions.color
        : '#ffffff'
    const dotColor =
      typeof template.options.dotsColor === 'string'
        ? template.options.dotsColor
        : template.options.dotsColor.colorStops[0]?.color || '#000000'

    return {
      backgroundColor: bgColor,
      '--dot-color': dotColor
    }
  }

  async function saveAsTemplate() {
    try {
      const { value } = await ElMessageBox.prompt('请输入模板名称', '保存模板', {
        confirmButtonText: '保存',
        cancelButtonText: '取消',
        inputPattern: /^.{1,20}$/,
        inputErrorMessage: '名称长度为1-20个字符'
      })

      const customTemplates = loadCustomTemplates()
      const newTemplate: StyleTemplate = {
        id: `custom-${Date.now()}`,
        name: value,
        description: '用户自定义模板',
        options: { ...localOptions.value },
        createdAt: Date.now(),
        isPreset: false
      }

      customTemplates.push(newTemplate)
      saveCustomTemplates(customTemplates)
      ElMessage.success('模板保存成功')
    } catch {
      // 用户取消
    }
  }

  function resetStyle() {
    localOptions.value = { ...DEFAULT_STYLE_OPTIONS }
    dotsUseGradient.value = false
    selectedTemplate.value = null
    ElMessage.success('已重置为默认样式')
  }

  function loadCustomTemplates(): StyleTemplate[] {
    try {
      const stored = localStorage.getItem('qr-style-templates')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  function saveCustomTemplates(templates: StyleTemplate[]) {
    localStorage.setItem('qr-style-templates', JSON.stringify(templates))
  }
</script>

<style scoped>
  .style-panel {
    padding: 10px;
  }

  .panel-section {
    margin-bottom: 20px;
  }

  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #ebeef5;
  }

  .color-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .template-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }

  .template-item {
    cursor: pointer;
    border: 2px solid transparent;
    border-radius: 8px;
    padding: 8px;
    text-align: center;
    transition: all 0.2s;
  }

  .template-item:hover {
    border-color: #c0c4cc;
  }

  .template-item.active {
    border-color: #409eff;
    background: #ecf5ff;
  }

  .template-preview {
    width: 50px;
    height: 50px;
    margin: 0 auto 6px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .preview-dots {
    width: 30px;
    height: 30px;
    background: var(--dot-color, #000);
    border-radius: 2px;
  }

  .template-name {
    font-size: 12px;
    color: #606266;
  }
</style>
