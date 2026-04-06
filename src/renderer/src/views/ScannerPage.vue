<template>
  <div class="scanner-page">
    <div class="page-header">
      <h2>扫描二维码</h2>
      <p>使用摄像头扫描二维码或条形码</p>
    </div>

    <div class="action-area">
      <el-button type="primary" size="large" @click="showScanner = true">
        <el-icon><Camera /></el-icon>
        开始扫描
      </el-button>
    </div>

    <div v-if="lastResult" class="result-area">
      <div class="result-header">
        <h3>扫描结果</h3>
        <el-tag :type="getResultTagType(lastResult.type)">
          {{ getResultTypeLabel(lastResult.type) }}
        </el-tag>
      </div>

      <el-card class="result-card">
        <div class="result-content">
          <div v-if="lastResult.type === 'wifi'" class="parsed-result">
            <div class="result-item">
              <span class="label">网络名称:</span>
              <span class="value">{{ (lastResult.parsedData?.data as WifiParsedData)?.ssid }}</span>
            </div>
            <div class="result-item">
              <span class="label">密码:</span>
              <span class="value">{{
                (lastResult.parsedData?.data as WifiParsedData)?.password
              }}</span>
            </div>
            <div class="result-item">
              <span class="label">加密类型:</span>
              <span class="value">{{
                (lastResult.parsedData?.data as WifiParsedData)?.encryption
              }}</span>
            </div>
          </div>

          <div v-else-if="lastResult.type === 'vcard'" class="parsed-result">
            <div v-if="(lastResult.parsedData?.data as VCardParsedData)?.name" class="result-item">
              <span class="label">姓名:</span>
              <span class="value">{{
                (lastResult.parsedData?.data as VCardParsedData)?.name
              }}</span>
            </div>
            <div v-if="(lastResult.parsedData?.data as VCardParsedData)?.phone" class="result-item">
              <span class="label">电话:</span>
              <span class="value">{{
                (lastResult.parsedData?.data as VCardParsedData)?.phone
              }}</span>
            </div>
            <div v-if="(lastResult.parsedData?.data as VCardParsedData)?.email" class="result-item">
              <span class="label">邮箱:</span>
              <span class="value">{{
                (lastResult.parsedData?.data as VCardParsedData)?.email
              }}</span>
            </div>
            <div
              v-if="(lastResult.parsedData?.data as VCardParsedData)?.organization"
              class="result-item"
            >
              <span class="label">公司:</span>
              <span class="value">{{
                (lastResult.parsedData?.data as VCardParsedData)?.organization
              }}</span>
            </div>
          </div>

          <div v-else-if="lastResult.type === 'email'" class="parsed-result">
            <div class="result-item">
              <span class="label">收件人:</span>
              <span class="value">{{ (lastResult.parsedData?.data as EmailParsedData)?.to }}</span>
            </div>
            <div
              v-if="(lastResult.parsedData?.data as EmailParsedData)?.subject"
              class="result-item"
            >
              <span class="label">主题:</span>
              <span class="value">{{
                (lastResult.parsedData?.data as EmailParsedData)?.subject
              }}</span>
            </div>
          </div>

          <div v-else-if="lastResult.type === 'phone'" class="parsed-result">
            <div class="result-item">
              <span class="label">电话号码:</span>
              <span class="value">{{
                (lastResult.parsedData?.data as PhoneParsedData)?.number
              }}</span>
            </div>
          </div>

          <div v-else class="raw-result">
            <div class="result-item">
              <span class="label">内容:</span>
              <span class="value">{{ lastResult.rawContent }}</span>
            </div>
          </div>
        </div>

        <div class="result-actions">
          <el-button type="primary" @click="copyResult">
            <el-icon><CopyDocument /></el-icon>
            复制内容
          </el-button>
          <el-button v-if="lastResult.type === 'url'" @click="openUrl">
            <el-icon><Link /></el-icon>
            打开链接
          </el-button>
          <el-button v-if="lastResult.type === 'phone'" @click="dialPhone">
            <el-icon><Phone /></el-icon>
            拨打电话
          </el-button>
          <el-button v-if="lastResult.type === 'email'" @click="sendEmail">
            <el-icon><Message /></el-icon>
            发送邮件
          </el-button>
          <el-button @click="generateFromResult">
            <el-icon><Grid /></el-icon>
            生成二维码
          </el-button>
        </div>
      </el-card>
    </div>

    <div v-if="scanHistory.length > 0" class="history-area">
      <div class="history-header">
        <h3>扫描历史</h3>
        <el-button text type="danger" @click="clearHistory">清空</el-button>
      </div>

      <el-timeline>
        <el-timeline-item
          v-for="item in scanHistory"
          :key="item.timestamp"
          :timestamp="formatTime(item.timestamp)"
          placement="top"
        >
          <el-card class="history-item" @click="showHistoryItem(item)">
            <div class="history-content">
              <el-tag size="small" :type="getResultTagType(item.type)">
                {{ getResultTypeLabel(item.type) }}
              </el-tag>
              <span class="history-text">{{ getPreviewText(item) }}</span>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </div>

    <ScannerDialog v-model="showScanner" @scan-success="handleScanSuccess" />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import ScannerDialog from '../components/ScannerDialog.vue'
  import type { ScanResult } from '../types/scanner'
  import type {
    VCardParsedData,
    WifiParsedData,
    EmailParsedData,
    PhoneParsedData
  } from '../types/scanner'

  const showScanner = ref(false)
  const lastResult = ref<ScanResult | null>(null)
  const scanHistory = ref<ScanResult[]>([])

  function handleScanSuccess(result: ScanResult) {
    lastResult.value = result
    scanHistory.value.unshift(result)

    if (scanHistory.value.length > 50) {
      scanHistory.value = scanHistory.value.slice(0, 50)
    }

    saveHistory()
  }

  function getResultTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      url: '网址',
      wifi: 'WiFi',
      vcard: '名片',
      email: '邮件',
      phone: '电话',
      sms: '短信',
      text: '文本',
      unknown: '未知'
    }
    return labels[type] || '未知'
  }

  function getResultTagType(type: string): '' | 'success' | 'warning' | 'info' | 'danger' {
    const types: Record<string, '' | 'success' | 'warning' | 'info' | 'danger'> = {
      url: '',
      wifi: 'success',
      vcard: 'warning',
      email: 'info',
      phone: 'danger',
      sms: 'warning',
      text: 'info',
      unknown: 'info'
    }
    return types[type] || 'info'
  }

  function formatTime(timestamp: number): string {
    return new Date(timestamp).toLocaleString('zh-CN')
  }

  function getPreviewText(result: ScanResult): string {
    if (result.rawContent.length > 50) {
      return result.rawContent.substring(0, 50) + '...'
    }
    return result.rawContent
  }

  async function copyResult() {
    if (!lastResult.value) return

    try {
      await navigator.clipboard.writeText(lastResult.value.rawContent)
      ElMessage.success('已复制到剪贴板')
    } catch {
      ElMessage.error('复制失败')
    }
  }

  function openUrl() {
    if (!lastResult.value || lastResult.value.type !== 'url') return
    window.open(lastResult.value.rawContent, '_blank')
  }

  function dialPhone() {
    if (!lastResult.value || lastResult.value.type !== 'phone') return
    window.location.href = lastResult.value.rawContent
  }

  function sendEmail() {
    if (!lastResult.value || lastResult.value.type !== 'email') return
    window.location.href = lastResult.value.rawContent
  }

  function generateFromResult() {
    if (!lastResult.value) return
    ElMessage.info('请使用对应的生成功能创建二维码')
  }

  function showHistoryItem(item: ScanResult) {
    lastResult.value = item
  }

  function clearHistory() {
    scanHistory.value = []
    localStorage.removeItem('scan-history')
    ElMessage.success('历史记录已清空')
  }

  function saveHistory() {
    try {
      localStorage.setItem('scan-history', JSON.stringify(scanHistory.value))
    } catch (e) {
      console.error('保存历史记录失败:', e)
    }
  }

  function loadHistory() {
    try {
      const stored = localStorage.getItem('scan-history')
      if (stored) {
        scanHistory.value = JSON.parse(stored)
      }
    } catch (e) {
      console.error('加载历史记录失败:', e)
    }
  }

  loadHistory()
</script>

<style scoped>
  .scanner-page {
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

  .action-area {
    display: flex;
    justify-content: center;
    margin-bottom: 30px;
  }

  .result-area {
    margin-bottom: 30px;
  }

  .result-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .result-header h3 {
    margin: 0;
    color: #303133;
  }

  .result-card {
    margin-bottom: 16px;
  }

  .result-content {
    margin-bottom: 16px;
  }

  .parsed-result,
  .raw-result {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .result-item {
    display: flex;
    gap: 12px;
  }

  .result-item .label {
    color: #909399;
    min-width: 80px;
  }

  .result-item .value {
    color: #303133;
    word-break: break-all;
  }

  .result-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .history-area {
    margin-top: 30px;
  }

  .history-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .history-header h3 {
    margin: 0;
    color: #303133;
  }

  .history-item {
    cursor: pointer;
    transition: box-shadow 0.2s;
  }

  .history-item:hover {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }

  .history-content {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .history-text {
    color: #606266;
    font-size: 14px;
  }
</style>
