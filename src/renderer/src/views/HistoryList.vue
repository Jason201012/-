<template>
  <div class="history-list">
    <div class="history-header">
      <span>历史记录 ({{ historyStore.history.length }})</span>
      <el-button type="danger" :disabled="historyStore.history.length === 0" @click="clearHistory">
        <el-icon><Delete /></el-icon>
        清空历史
      </el-button>
    </div>

    <div v-if="historyStore.history.length === 0" class="empty-state">
      <el-icon :size="60"><Clock /></el-icon>
      <span>暂无历史记录</span>
    </div>

    <div v-else class="history-grid">
      <div v-for="item in historyStore.history" :key="item.id" class="history-item">
        <img :src="item.dataUrl" alt="QR Code" />
        <div class="item-info">
          <div class="item-type">
            <el-tag size="small">{{ getTypeLabel(item.type) }}</el-tag>
          </div>
          <div class="item-content">{{ truncate(item.content, 30) }}</div>
          <div class="item-time">{{ formatTime(item.createdAt) }}</div>
        </div>
        <div class="item-actions">
          <el-button size="small" @click="copyToClipboard(item.dataUrl)">
            <el-icon><CopyDocument /></el-icon>
          </el-button>
          <el-button size="small" type="danger" @click="deleteItem(item.id)">
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { useHistoryStore } from '../stores'
  import type { QRCodeData } from '../types/qrcode'

  const historyStore = useHistoryStore()

  function getTypeLabel(type: QRCodeData['type']): string {
    const labels: Record<QRCodeData['type'], string> = {
      text: '文本',
      url: '网址',
      vcard: '名片',
      wifi: 'WiFi',
      email: '邮件',
      phone: '电话',
      sms: '短信'
    }
    return labels[type] || type
  }

  function truncate(str: string, len: number): string {
    if (str.length <= len) return str
    return str.slice(0, len) + '...'
  }

  function formatTime(timestamp: number): string {
    const date = new Date(timestamp)
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  async function copyToClipboard(dataUrl: string) {
    try {
      await window.electronAPI.copyImageToClipboard(dataUrl)
      ElMessage.success('已复制到剪贴板')
    } catch (error) {
      ElMessage.error('复制失败')
    }
  }

  function deleteItem(id: string) {
    historyStore.deleteHistory(id)
    ElMessage.success('已删除')
  }

  async function clearHistory() {
    try {
      await ElMessageBox.confirm('确定要清空所有历史记录吗？', '确认', {
        type: 'warning'
      })
      historyStore.clearHistory()
      ElMessage.success('已清空历史记录')
    } catch {
      // 用户取消
    }
  }
</script>

<style scoped>
  .history-list {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    font-weight: 600;
    font-size: 16px;
  }

  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 15px;
    color: #909399;
  }

  .history-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 15px;
    overflow-y: auto;
  }

  .history-item {
    background: white;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    padding: 15px;
    display: flex;
    gap: 15px;
  }

  .history-item img {
    width: 80px;
    height: 80px;
    object-fit: contain;
  }

  .item-info {
    flex: 1;
    min-width: 0;
  }

  .item-type {
    margin-bottom: 5px;
  }

  .item-content {
    font-size: 13px;
    color: #303133;
    word-break: break-all;
    margin-bottom: 5px;
  }

  .item-time {
    font-size: 12px;
    color: #909399;
  }

  .item-actions {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
</style>
