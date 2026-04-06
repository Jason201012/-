<template>
  <div class="template-manager">
    <div class="page-header">
      <h2>样式模板</h2>
      <p>管理和应用二维码样式模板</p>
    </div>

    <div class="template-section">
      <div class="section-header">
        <h3>预设模板</h3>
      </div>
      <div class="template-grid">
        <div
          v-for="template in presetTemplates"
          :key="template.id"
          class="template-card"
          :class="{ active: selectedTemplate?.id === template.id }"
          @click="selectTemplate(template)"
        >
          <div class="template-preview" :style="getPreviewStyle(template)">
            <div class="preview-qr">
              <div class="preview-corner tl"></div>
              <div class="preview-corner tr"></div>
              <div class="preview-corner bl"></div>
              <div class="preview-corner br"></div>
              <div class="preview-dots"></div>
            </div>
          </div>
          <div class="template-info">
            <div class="template-name">{{ template.name }}</div>
            <div class="template-desc">{{ template.description }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="customTemplates.length > 0" class="template-section">
      <div class="section-header">
        <h3>自定义模板</h3>
        <el-button text type="danger" @click="clearCustomTemplates">清空全部</el-button>
      </div>
      <div class="template-grid">
        <div
          v-for="template in customTemplates"
          :key="template.id"
          class="template-card"
          :class="{ active: selectedTemplate?.id === template.id }"
          @click="selectTemplate(template)"
        >
          <div class="template-preview" :style="getPreviewStyle(template)">
            <div class="preview-qr">
              <div class="preview-corner tl"></div>
              <div class="preview-corner tr"></div>
              <div class="preview-corner bl"></div>
              <div class="preview-corner br"></div>
              <div class="preview-dots"></div>
            </div>
          </div>
          <div class="template-info">
            <div class="template-name">{{ template.name }}</div>
            <div class="template-desc">{{ formatDate(template.createdAt) }}</div>
          </div>
          <el-button
            class="delete-btn"
            type="danger"
            size="small"
            circle
            @click.stop="deleteTemplate(template.id)"
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <div class="template-section">
      <div class="section-header">
        <h3>导入/导出</h3>
      </div>
      <div class="import-export-actions">
        <el-button @click="importTemplates">
          <el-icon><Upload /></el-icon>
          导入模板
        </el-button>
        <el-button @click="exportTemplates">
          <el-icon><Download /></el-icon>
          导出模板
        </el-button>
      </div>
    </div>

    <div v-if="selectedTemplate" class="template-detail">
      <div class="detail-header">
        <h3>模板详情</h3>
        <el-button type="primary" @click="applyTemplate">
          <el-icon><Check /></el-icon>
          应用此模板
        </el-button>
      </div>
      <el-card>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="模板名称">{{ selectedTemplate.name }}</el-descriptions-item>
          <el-descriptions-item label="码点样式">{{
            getDotStyleName(selectedTemplate.options.dotsStyle)
          }}</el-descriptions-item>
          <el-descriptions-item label="定位点样式">{{
            getCornerSquareStyleName(selectedTemplate.options.cornersSquareStyle)
          }}</el-descriptions-item>
          <el-descriptions-item label="定位内点样式">{{
            getCornerDotStyleName(selectedTemplate.options.cornersDotStyle)
          }}</el-descriptions-item>
          <el-descriptions-item label="码点颜色">
            <div
              class="color-preview"
              :style="{ background: getColorPreview(selectedTemplate.options.dotsColor) }"
            ></div>
          </el-descriptions-item>
          <el-descriptions-item label="背景颜色">
            <div
              class="color-preview"
              :style="{
                background: getColorPreview(selectedTemplate.options.backgroundOptions.color)
              }"
            ></div>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { StyleTemplate } from '../types/style'
  import {
    DOT_STYLE_OPTIONS,
    CORNER_SQUARE_STYLE_OPTIONS,
    CORNER_DOT_STYLE_OPTIONS
  } from '../types/style'
  import { getAllPresetTemplates } from '../data/presetTemplates'

  const presetTemplates = getAllPresetTemplates()
  const customTemplates = ref<StyleTemplate[]>([])
  const selectedTemplate = ref<StyleTemplate | null>(null)

  onMounted(() => {
    loadCustomTemplates()
  })

  function loadCustomTemplates() {
    try {
      const stored = localStorage.getItem('qr-style-templates')
      if (stored) {
        customTemplates.value = JSON.parse(stored)
      }
    } catch (e) {
      console.error('加载自定义模板失败:', e)
    }
  }

  function saveCustomTemplates() {
    localStorage.setItem('qr-style-templates', JSON.stringify(customTemplates.value))
  }

  function selectTemplate(template: StyleTemplate) {
    selectedTemplate.value = template
  }

  async function applyTemplate() {
    if (!selectedTemplate.value) return

    try {
      await ElMessageBox.confirm('应用此模板将覆盖当前样式设置，是否继续？', '确认', {
        type: 'warning'
      })

      localStorage.setItem('qr-current-style', JSON.stringify(selectedTemplate.value.options))
      ElMessage.success('模板已应用，请在生成二维码时查看效果')
    } catch {
      // 用户取消
    }
  }

  async function deleteTemplate(id: string) {
    try {
      await ElMessageBox.confirm('确定删除此模板？', '确认', {
        type: 'warning'
      })

      customTemplates.value = customTemplates.value.filter((t) => t.id !== id)
      saveCustomTemplates()

      if (selectedTemplate.value?.id === id) {
        selectedTemplate.value = null
      }

      ElMessage.success('删除成功')
    } catch {
      // 用户取消
    }
  }

  async function clearCustomTemplates() {
    try {
      await ElMessageBox.confirm('确定清空所有自定义模板？', '确认', {
        type: 'warning'
      })

      customTemplates.value = []
      saveCustomTemplates()
      selectedTemplate.value = null
      ElMessage.success('已清空')
    } catch {
      // 用户取消
    }
  }

  async function importTemplates() {
    const result = await window.electronAPI.openFile({
      filters: [{ name: 'JSON文件', extensions: ['json'] }]
    })

    if (result.canceled || !result.filePaths.length) return

    try {
      const fileResult = await window.electronAPI.readTextFile(result.filePaths[0])
      if (fileResult.success && fileResult.data) {
        const templates: StyleTemplate[] = JSON.parse(fileResult.data)

        for (const template of templates) {
          template.id = `imported-${Date.now()}-${Math.random().toString(36).slice(2)}`
          template.isPreset = false
        }

        customTemplates.value.push(...templates)
        saveCustomTemplates()
        ElMessage.success(`成功导入 ${templates.length} 个模板`)
      }
    } catch (e) {
      ElMessage.error('导入失败：文件格式错误')
    }
  }

  async function exportTemplates() {
    if (customTemplates.value.length === 0) {
      ElMessage.warning('没有可导出的自定义模板')
      return
    }

    const result = await window.electronAPI.saveFile({
      defaultName: `qr-templates-${Date.now()}.json`,
      filters: [{ name: 'JSON文件', extensions: ['json'] }]
    })

    if (result.canceled || !result.filePath) return

    try {
      const content = JSON.stringify(customTemplates.value, null, 2)
      await window.electronAPI.saveSvgToFile(result.filePath, content)
      ElMessage.success('导出成功')
    } catch (e) {
      ElMessage.error('导出失败')
    }
  }

  function getPreviewStyle(template: StyleTemplate) {
    const bgColor =
      typeof template.options.backgroundOptions.color === 'string'
        ? template.options.backgroundOptions.color
        : '#ffffff'

    return {
      backgroundColor: bgColor
    }
  }

  function getColorPreview(color: string | { type: string; colorStops: { color: string }[] }) {
    if (typeof color === 'string') {
      return color
    }
    return `linear-gradient(135deg, ${color.colorStops[0]?.color || '#000'}, ${color.colorStops[1]?.color || '#000'})`
  }

  function getDotStyleName(style: string): string {
    return DOT_STYLE_OPTIONS.find((o) => o.value === style)?.label || style
  }

  function getCornerSquareStyleName(style: string): string {
    return CORNER_SQUARE_STYLE_OPTIONS.find((o) => o.value === style)?.label || style
  }

  function getCornerDotStyleName(style: string): string {
    return CORNER_DOT_STYLE_OPTIONS.find((o) => o.value === style)?.label || style
  }

  function formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString('zh-CN')
  }
</script>

<style scoped>
  .template-manager {
    padding: 20px;
  }

  .page-header {
    text-align: center;
    margin-bottom: 30px;
  }

  .page-header h2 {
    margin: 0 0 8px 0;
    color: #303133;
  }

  .page-header p {
    margin: 0;
    color: #909399;
  }

  .template-section {
    margin-bottom: 30px;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .section-header h3 {
    margin: 0;
    color: #303133;
    font-size: 16px;
  }

  .template-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }

  .template-card {
    position: relative;
    border: 2px solid #e4e7ed;
    border-radius: 8px;
    padding: 12px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .template-card:hover {
    border-color: #c0c4cc;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }

  .template-card.active {
    border-color: #409eff;
    background: #ecf5ff;
  }

  .template-preview {
    width: 100%;
    height: 120px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
  }

  .preview-qr {
    width: 80px;
    height: 80px;
    position: relative;
    background: rgba(0, 0, 0, 0.1);
  }

  .preview-corner {
    position: absolute;
    width: 20px;
    height: 20px;
    background: #000;
  }

  .preview-corner.tl {
    top: 0;
    left: 0;
  }
  .preview-corner.tr {
    top: 0;
    right: 0;
  }
  .preview-corner.bl {
    bottom: 0;
    left: 0;
  }
  .preview-corner.br {
    bottom: 0;
    right: 0;
  }

  .preview-dots {
    position: absolute;
    top: 25px;
    left: 25px;
    right: 25px;
    bottom: 25px;
    background:
      repeating-linear-gradient(0deg, #000 0px, #000 4px, transparent 4px, transparent 8px),
      repeating-linear-gradient(90deg, #000 0px, #000 4px, transparent 4px, transparent 8px);
  }

  .template-info {
    text-align: center;
  }

  .template-name {
    font-weight: 600;
    color: #303133;
    margin-bottom: 4px;
  }

  .template-desc {
    font-size: 12px;
    color: #909399;
  }

  .delete-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .template-card:hover .delete-btn {
    opacity: 1;
  }

  .import-export-actions {
    display: flex;
    gap: 12px;
  }

  .template-detail {
    margin-top: 30px;
  }

  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .detail-header h3 {
    margin: 0;
    color: #303133;
  }

  .color-preview {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
  }
</style>
