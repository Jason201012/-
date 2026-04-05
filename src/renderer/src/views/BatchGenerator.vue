<template>
  <div class="batch-generator">
    <div class="batch-header">
      <el-radio-group v-model="inputMode">
        <el-radio-button value="text">文本输入</el-radio-button>
        <el-radio-button value="file">文件导入</el-radio-button>
      </el-radio-group>
    </div>
    
    <div class="batch-content">
      <div v-if="inputMode === 'text'" class="text-input-area">
        <el-input
          v-model="textInput"
          type="textarea"
          :rows="10"
          placeholder="每行输入一个内容，批量生成多个二维码&#10;例如：&#10;https://example1.com&#10;https://example2.com&#10;文本内容1&#10;文本内容2"
        />
      </div>
      
      <div v-else class="file-input-area">
        <el-upload
          drag
          :auto-upload="false"
          :show-file-list="false"
          accept=".csv,.xlsx,.xls,.txt"
          @change="handleFileChange"
        >
          <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
          <div class="el-upload__text">
            拖拽文件到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              支持 CSV、Excel、TXT 文件，第一列为二维码内容
            </div>
          </template>
        </el-upload>
        <div v-if="fileItems.length > 0" class="file-preview">
          <el-tag>已导入 {{ fileItems.length }} 条数据</el-tag>
        </div>
      </div>
      
      <div class="batch-options">
        <el-form inline>
          <el-form-item label="尺寸">
            <el-select v-model="batchOptions.width" style="width: 120px">
              <el-option :value="200" label="200px" />
              <el-option :value="300" label="300px" />
              <el-option :value="400" label="400px" />
              <el-option :value="500" label="500px" />
            </el-select>
          </el-form-item>
          <el-form-item label="容错级别">
            <el-select v-model="batchOptions.errorCorrectionLevel" style="width: 120px">
              <el-option value="L" label="L - 低" />
              <el-option value="M" label="M - 中" />
              <el-option value="Q" label="Q - 较高" />
              <el-option value="H" label="H - 高" />
            </el-select>
          </el-form-item>
          <el-form-item label="命名规则">
            <el-select v-model="namingRule" style="width: 150px">
              <el-option value="index" label="序号命名" />
              <el-option value="content" label="内容命名" />
              <el-option value="timestamp" label="时间戳命名" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      
      <div class="batch-actions">
        <el-button type="primary" @click="generateBatch" :loading="generating">
          <el-icon><Grid /></el-icon>
          生成二维码
        </el-button>
        <el-button @click="clearAll">
          <el-icon><Delete /></el-icon>
          清空
        </el-button>
      </div>
      
      <div v-if="batchItems.length > 0" class="batch-results">
        <div class="results-header">
          <span>生成结果 ({{ successCount }}/{{ batchItems.length }})</span>
          <el-button type="success" @click="exportAll" :disabled="successCount === 0">
            <el-icon><Download /></el-icon>
            全部导出
          </el-button>
        </div>
        <div class="results-grid">
          <div
            v-for="item in batchItems"
            :key="item.id"
            class="result-item"
            :class="{ error: item.status === 'error' }"
          >
            <img v-if="item.dataUrl" :src="item.dataUrl" alt="QR Code" />
            <div v-else class="placeholder">
              <el-icon v-if="item.status === 'error'" :size="30"><WarningFilled /></el-icon>
              <el-icon v-else :size="30"><Loading /></el-icon>
            </div>
            <div class="item-content">{{ truncate(item.content, 20) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { QRCodeOptions, BatchItem } from '../types/qrcode'
import { DEFAULT_OPTIONS } from '../types/qrcode'
import { generateQRCode } from '../utils/qrcode'
import * as XLSX from 'xlsx'

const inputMode = ref<'text' | 'file'>('text')
const textInput = ref('')
const fileItems = ref<string[]>([])
const batchItems = ref<(BatchItem & { dataUrl?: string })[]>([])
const generating = ref(false)

const batchOptions = ref<Omit<QRCodeOptions, 'color' | 'margin'>>({
  width: 300,
  errorCorrectionLevel: 'M'
})

const namingRule = ref<'index' | 'content' | 'timestamp'>('index')

const successCount = computed(() => 
  batchItems.value.filter(item => item.status === 'success').length
)

function truncate(str: string, len: number): string {
  if (str.length <= len) return str
  return str.slice(0, len) + '...'
}

async function handleFileChange(file: any) {
  const rawFile = file.raw
  if (!rawFile) return
  
  try {
    const arrayBuffer = await rawFile.arrayBuffer()
    const extension = rawFile.name.split('.').pop()?.toLowerCase()
    
    if (extension === 'txt') {
      const text = await rawFile.text()
      fileItems.value = text.split('\n').filter((line: string) => line.trim())
    } else {
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as string[][]
      fileItems.value = data.map(row => row[0]).filter(Boolean)
    }
    
    ElMessage.success(`成功导入 ${fileItems.value.length} 条数据`)
  } catch (error) {
    ElMessage.error('文件解析失败')
  }
}

async function generateBatch() {
  const contents = inputMode.value === 'text' 
    ? textInput.value.split('\n').filter(line => line.trim())
    : fileItems.value
  
  if (contents.length === 0) {
    ElMessage.warning('请输入或导入数据')
    return
  }
  
  generating.value = true
  batchItems.value = contents.map((content, index) => ({
    id: index.toString(),
    content: content.trim(),
    type: 'text' as const,
    status: 'pending' as const,
    dataUrl: undefined
  }))
  
  const options: QRCodeOptions = {
    ...DEFAULT_OPTIONS,
    width: batchOptions.value.width,
    errorCorrectionLevel: batchOptions.value.errorCorrectionLevel
  }
  
  for (const item of batchItems.value) {
    try {
      item.dataUrl = await generateQRCode({
        type: 'text',
        content: item.content,
        options
      })
      item.status = 'success'
    } catch (error) {
      item.status = 'error'
    }
  }
  
  generating.value = false
  ElMessage.success(`生成完成：${successCount.value}/${batchItems.value.length}`)
}

function clearAll() {
  textInput.value = ''
  fileItems.value = []
  batchItems.value = []
}

async function exportAll() {
  const dirResult = await window.electronAPI.openDirectory()
  if (dirResult.canceled || !dirResult.filePaths.length) return
  
  const dir = dirResult.filePaths[0]
  const timestamp = Date.now()
  
  for (let i = 0; i < batchItems.value.length; i++) {
    const item = batchItems.value[i]
    if (item.status !== 'success' || !item.dataUrl) continue
    
    let filename: string
    switch (namingRule.value) {
      case 'index':
        filename = `qrcode_${i + 1}.png`
        break
      case 'content':
        filename = `${item.content.slice(0, 20).replace(/[\\/:*?"<>|]/g, '_')}.png`
        break
      case 'timestamp':
        filename = `qrcode_${timestamp}_${i + 1}.png`
        break
    }
    
    const filePath = await window.electronAPI.pathJoin(dir, filename)
    const base64 = item.dataUrl.split(',')[1]
    await window.electronAPI.saveToFile(filePath, base64)
  }
  
  ElMessage.success('导出完成')
}
</script>

<style scoped>
.batch-generator {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.batch-header {
  margin-bottom: 20px;
}

.batch-content {
  flex: 1;
  overflow-y: auto;
}

.text-input-area {
  margin-bottom: 20px;
}

.file-input-area {
  margin-bottom: 20px;
}

.file-preview {
  margin-top: 10px;
}

.batch-options {
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
}

.batch-actions {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.batch-results {
  margin-top: 20px;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  font-weight: 600;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
}

.result-item {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 10px;
  text-align: center;
}

.result-item.error {
  border-color: #f56c6c;
  background: #fef0f0;
}

.result-item img {
  width: 100%;
  max-width: 130px;
}

.result-item .placeholder {
  height: 130px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
}

.result-item.error .placeholder {
  color: #f56c6c;
}

.item-content {
  margin-top: 8px;
  font-size: 12px;
  color: #606266;
  word-break: break-all;
}
</style>
