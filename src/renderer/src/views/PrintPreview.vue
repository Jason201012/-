<template>
  <div class="print-preview">
    <div class="page-header">
      <h2>打印标签</h2>
      <p>批量排版打印二维码标签</p>
    </div>

    <div class="print-content">
      <div class="settings-panel">
        <el-card>
          <template #header>
            <span>打印设置</span>
          </template>

          <el-form label-width="80px" size="small">
            <el-form-item label="纸张尺寸">
              <el-select v-model="paperSize" style="width: 100%">
                <el-option label="A4 (210mm × 297mm)" value="a4" />
                <el-option label="A5 (148mm × 210mm)" value="a5" />
                <el-option label="不干胶标签 (100mm × 70mm)" value="label-100x70" />
                <el-option label="不干胶标签 (70mm × 50mm)" value="label-70x50" />
                <el-option label="自定义尺寸" value="custom" />
              </el-select>
            </el-form-item>

            <template v-if="paperSize === 'custom'">
              <el-form-item label="宽度">
                <el-input-number v-model="customWidth" :min="50" :max="300" />
              </el-form-item>
              <el-form-item label="高度">
                <el-input-number v-model="customHeight" :min="50" :max="300" />
              </el-form-item>
            </template>

            <el-form-item label="标签尺寸">
              <div class="size-inputs">
                <el-input-number v-model="labelWidth" :min="20" :max="100" />
                <span>×</span>
                <el-input-number v-model="labelHeight" :min="20" :max="100" />
                <span>mm</span>
              </div>
            </el-form-item>

            <el-form-item label="边距">
              <div class="size-inputs">
                <el-input-number v-model="marginTop" :min="0" :max="50" />
                <span>×</span>
                <el-input-number v-model="marginLeft" :min="0" :max="50" />
                <span>mm</span>
              </div>
            </el-form-item>

            <el-form-item label="间距">
              <div class="size-inputs">
                <el-input-number v-model="gapX" :min="0" :max="20" />
                <span>×</span>
                <el-input-number v-model="gapY" :min="0" :max="20" />
                <span>mm</span>
              </div>
            </el-form-item>

            <el-form-item label="二维码大小">
              <el-slider v-model="qrSize" :min="30" :max="80" />
            </el-form-item>

            <el-form-item label="显示文字">
              <el-switch v-model="showText" />
            </el-form-item>

            <el-form-item v-if="showText" label="字号">
              <el-slider v-model="fontSize" :min="8" :max="16" />
            </el-form-item>
          </el-form>
        </el-card>

        <el-card style="margin-top: 16px">
          <template #header>
            <span>数据源</span>
          </template>

          <el-button type="primary" style="width: 100%" @click="importData">
            <el-icon><Upload /></el-icon>
            导入数据文件
          </el-button>

          <div v-if="dataList.length > 0" class="data-info">
            <el-tag>已导入 {{ dataList.length }} 条数据</el-tag>
            <el-button text type="danger" @click="clearData">清空</el-button>
          </div>

          <div v-else class="data-tip">
            <p>支持 CSV、Excel、TXT 文件</p>
            <p>第一列为二维码内容，第二列为标签文字（可选）</p>
          </div>
        </el-card>

        <div class="action-buttons">
          <el-button
            type="primary"
            size="large"
            :disabled="dataList.length === 0"
            @click="handlePrint"
          >
            <el-icon><Printer /></el-icon>
            打印
          </el-button>
          <el-button size="large" :disabled="dataList.length === 0" @click="handlePreview">
            <el-icon><View /></el-icon>
            预览
          </el-button>
        </div>
      </div>

      <div class="preview-panel">
        <div class="preview-header">
          <span>打印预览</span>
          <span class="preview-info">
            {{ columns }}列 × {{ rows }}行 = {{ columns * rows }}个标签/页
          </span>
        </div>
        <div ref="previewRef" class="preview-container">
          <div class="preview-page" :style="getPageStyle()">
            <div
              v-for="(item, index) in previewData"
              :key="index"
              class="preview-label"
              :style="getLabelStyle()"
            >
              <div class="label-qr" :style="{ width: qrSize + 'mm', height: qrSize + 'mm' }">
                <img v-if="item.dataUrl" :src="item.dataUrl" alt="QR" />
                <div v-else class="qr-placeholder">
                  <el-icon><Grid /></el-icon>
                </div>
              </div>
              <div
                v-if="showText && item.text"
                class="label-text"
                :style="{ fontSize: fontSize + 'pt' }"
              >
                {{ item.text }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import QRCode from 'qrcode'
  import * as XLSX from 'xlsx'

  interface DataItem {
    content: string
    text?: string
    dataUrl?: string
  }

  const paperSize = ref('a4')
  const customWidth = ref(210)
  const customHeight = ref(297)
  const labelWidth = ref(50)
  const labelHeight = ref(30)
  const marginTop = ref(10)
  const marginLeft = ref(10)
  const gapX = ref(3)
  const gapY = ref(3)
  const qrSize = ref(50)
  const showText = ref(true)
  const fontSize = ref(10)

  const dataList = ref<DataItem[]>([])
  const previewRef = ref<HTMLElement | null>(null)

  const paperSizes: Record<string, { width: number; height: number }> = {
    a4: { width: 210, height: 297 },
    a5: { width: 148, height: 210 },
    'label-100x70': { width: 100, height: 70 },
    'label-70x50': { width: 70, height: 50 },
    custom: { width: customWidth.value, height: customHeight.value }
  }

  const currentPaperSize = computed(() => {
    if (paperSize.value === 'custom') {
      return { width: customWidth.value, height: customHeight.value }
    }
    return paperSizes[paperSize.value] || paperSizes['a4']
  })

  const columns = computed(() => {
    const availableWidth = currentPaperSize.value.width - marginLeft.value * 2
    return Math.floor((availableWidth + gapX.value) / (labelWidth.value + gapX.value))
  })

  const rows = computed(() => {
    const availableHeight = currentPaperSize.value.height - marginTop.value * 2
    return Math.floor((availableHeight + gapY.value) / (labelHeight.value + gapY.value))
  })

  const previewData = computed(() => {
    const count = columns.value * rows.value
    return dataList.value.slice(0, count)
  })

  watch(
    [dataList, qrSize],
    async () => {
      for (const item of dataList.value) {
        if (!item.dataUrl && item.content) {
          try {
            item.dataUrl = await QRCode.toDataURL(item.content, {
              width: qrSize.value * 3.78,
              margin: 1
            })
          } catch (e) {
            console.error('生成二维码失败:', e)
          }
        }
      }
    },
    { deep: true }
  )

  async function importData() {
    const result = await window.electronAPI.openFile({
      filters: [{ name: '数据文件', extensions: ['csv', 'xlsx', 'xls', 'txt'] }]
    })

    if (result.canceled || !result.filePaths.length) return

    const file = result.filePaths[0]
    const ext = file.split('.').pop()?.toLowerCase()

    try {
      if (ext === 'txt') {
        const fileResult = await window.electronAPI.readTextFile(file)
        if (fileResult.success && fileResult.data) {
          const lines = fileResult.data.split('\n').filter((line: string) => line.trim())
          dataList.value = lines.map((line: string) => {
            const parts = line.split('\t')
            return {
              content: parts[0]?.trim() || '',
              text: parts[1]?.trim() || parts[0]?.trim() || ''
            }
          })
        }
      } else {
        const buffer = await fetch(`file://${file}`).then((r) => r.arrayBuffer())
        const workbook = XLSX.read(buffer, { type: 'array' })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][]

        dataList.value = rows
          .filter((row) => row[0])
          .map((row) => ({
            content: String(row[0] || ''),
            text: String(row[1] || row[0] || '')
          }))
      }

      ElMessage.success(`成功导入 ${dataList.value.length} 条数据`)
    } catch (e) {
      ElMessage.error('导入失败：文件格式错误')
    }
  }

  function clearData() {
    dataList.value = []
  }

  function getPageStyle() {
    return {
      width: currentPaperSize.value.width + 'mm',
      height: currentPaperSize.value.height + 'mm'
    }
  }

  function getLabelStyle() {
    return {
      width: labelWidth.value + 'mm',
      height: labelHeight.value + 'mm',
      marginRight: gapX.value + 'mm',
      marginBottom: gapY.value + 'mm'
    }
  }

  function handlePreview() {
    ElMessage.info('预览功能：请使用打印预览查看实际效果')
  }

  async function handlePrint() {
    if (dataList.value.length === 0) {
      ElMessage.warning('请先导入数据')
      return
    }

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      ElMessage.error('无法打开打印窗口')
      return
    }

    const pages: DataItem[][] = []
    const itemsPerPage = columns.value * rows.value

    for (let i = 0; i < dataList.value.length; i += itemsPerPage) {
      pages.push(dataList.value.slice(i, i + itemsPerPage))
    }

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>二维码标签打印</title>
      <style>
        @page {
          size: ${currentPaperSize.value.width}mm ${currentPaperSize.value.height}mm;
          margin: 0;
        }
        body {
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
        }
        .page {
          width: ${currentPaperSize.value.width}mm;
          height: ${currentPaperSize.value.height}mm;
          padding: ${marginTop.value}mm 0 0 ${marginLeft.value}mm;
          box-sizing: border-box;
          page-break-after: always;
        }
        .label {
          display: inline-block;
          width: ${labelWidth.value}mm;
          height: ${labelHeight.value}mm;
          margin-right: ${gapX.value}mm;
          margin-bottom: ${gapY.value}mm;
          text-align: center;
          vertical-align: top;
        }
        .label img {
          width: ${qrSize.value}mm;
          height: ${qrSize.value}mm;
        }
        .label-text {
          font-size: ${fontSize.value}pt;
          margin-top: 2mm;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        @media print {
          .page { margin: 0; }
        }
      </style>
    </head>
    <body>
      ${pages
        .map(
          (page) => `
        <div class="page">
          ${page
            .map(
              (item) => `
            <div class="label">
              <img src="${item.dataUrl}" alt="QR" />
              ${showText.value && item.text ? `<div class="label-text">${item.text}</div>` : ''}
            </div>
          `
            )
            .join('')}
        </div>
      `
        )
        .join('')}
    </body>
    </html>
  `

    printWindow.document.write(html)
    printWindow.document.close()

    printWindow.onload = () => {
      printWindow.print()
    }
  }
</script>

<style scoped>
  .print-preview {
    padding: 20px;
    height: 100%;
  }

  .page-header {
    text-align: center;
    margin-bottom: 20px;
  }

  .page-header h2 {
    margin: 0 0 8px 0;
    color: #303133;
  }

  .page-header p {
    margin: 0;
    color: #909399;
  }

  .print-content {
    display: flex;
    gap: 20px;
    height: calc(100% - 80px);
  }

  .settings-panel {
    width: 320px;
    flex-shrink: 0;
  }

  .size-inputs {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .size-inputs span {
    color: #606266;
  }

  .data-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;
  }

  .data-tip {
    margin-top: 12px;
    text-align: center;
    color: #909399;
    font-size: 12px;
  }

  .data-tip p {
    margin: 4px 0;
  }

  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 20px;
  }

  .action-buttons .el-button {
    width: 100%;
  }

  .preview-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #f5f7fa;
    border-radius: 8px;
    overflow: hidden;
  }

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: white;
    border-bottom: 1px solid #e4e7ed;
  }

  .preview-info {
    color: #909399;
    font-size: 14px;
  }

  .preview-container {
    flex: 1;
    overflow: auto;
    padding: 20px;
    display: flex;
    justify-content: center;
  }

  .preview-page {
    background: white;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    padding: 10mm 0 0 10mm;
    box-sizing: border-box;
  }

  .preview-label {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 1px dashed #dcdfe6;
    vertical-align: top;
  }

  .label-qr {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .label-qr img {
    max-width: 100%;
    max-height: 100%;
  }

  .qr-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f7fa;
    color: #c0c4cc;
  }

  .label-text {
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
    padding: 0 4px;
  }
</style>
