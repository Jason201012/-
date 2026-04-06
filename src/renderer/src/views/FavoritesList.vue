<template>
  <div class="favorites-list">
    <div class="page-header">
      <h2>收藏夹</h2>
      <p>管理常用二维码，快速访问</p>
    </div>

    <div v-if="favoritesStore.favorites.length === 0" class="empty-state">
      <el-icon :size="60"><Star /></el-icon>
      <p>暂无收藏</p>
      <span>生成二维码后点击收藏按钮即可添加</span>
    </div>

    <div v-else class="favorites-grid">
      <el-card v-for="item in favoritesStore.favorites" :key="item.id" class="favorite-card">
        <div class="favorite-content">
          <div class="favorite-preview">
            <img v-if="item.dataUrl" :src="item.dataUrl" alt="QR Code" />
            <el-icon v-else :size="60"><Grid /></el-icon>
          </div>
          <div class="favorite-info">
            <div class="favorite-name">{{ item.name }}</div>
            <el-tag size="small" :type="getTypeTagType(item.type)">
              {{ getTypeLabel(item.type) }}
            </el-tag>
            <div class="favorite-date">{{ formatDate(item.createdAt) }}</div>
          </div>
        </div>
        <div class="favorite-actions">
          <el-button type="primary" size="small" @click="handleUse(item)"> 使用 </el-button>
          <el-button size="small" @click="handleCopy(item)"> 复制 </el-button>
          <el-button type="danger" size="small" @click="handleRemove(item.id)"> 删除 </el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import { useFavoritesStore, type FavoriteItem } from '../stores'
  import { generateQRCode } from '../utils/qrcode'

  const favoritesStore = useFavoritesStore()

  const typeLabels: Record<string, string> = {
    text: '文本',
    url: '网址',
    vcard: '名片',
    wifi: 'WiFi',
    email: '邮件',
    phone: '电话'
  }

  function getTypeLabel(type: string): string {
    return typeLabels[type] || type
  }

  function getTypeTagType(type: string): '' | 'success' | 'warning' | 'info' | 'danger' {
    const types: Record<string, '' | 'success' | 'warning' | 'info' | 'danger'> = {
      text: 'info',
      url: '',
      vcard: 'warning',
      wifi: 'success',
      email: 'info',
      phone: 'danger'
    }
    return types[type] || 'info'
  }

  function formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleString('zh-CN')
  }

  async function handleUse(item: FavoriteItem) {
    try {
      await navigator.clipboard.writeText(item.content)
      ElMessage.success('内容已复制到剪贴板')
    } catch {
      ElMessage.error('复制失败')
    }
  }

  async function handleCopy(item: FavoriteItem) {
    try {
      const dataUrl = await generateQRCode({
        type: item.type,
        content: item.content,
        options: item.options
      })
      await window.electronAPI.copyImageToClipboard(dataUrl)
      ElMessage.success('二维码已复制到剪贴板')
    } catch {
      ElMessage.error('复制失败')
    }
  }

  function handleRemove(id: string) {
    favoritesStore.removeFavorite(id)
    ElMessage.success('已从收藏夹移除')
  }
</script>

<style scoped>
  .favorites-list {
    padding: 20px;
  }

  .page-header {
    margin-bottom: 20px;
  }

  .page-header h2 {
    margin: 0 0 8px;
    color: #303133;
  }

  .page-header p {
    margin: 0;
    color: #909399;
    font-size: 14px;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    color: #909399;
  }

  .empty-state p {
    margin: 16px 0 4px;
    font-size: 16px;
  }

  .empty-state span {
    font-size: 13px;
  }

  .favorites-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }

  .favorite-card {
    cursor: pointer;
    transition:
      transform 0.2s,
      box-shadow 0.2s;
  }

  .favorite-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .favorite-content {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
  }

  .favorite-preview {
    width: 80px;
    height: 80px;
    background: #f5f7fa;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .favorite-preview img {
    max-width: 100%;
    max-height: 100%;
  }

  .favorite-info {
    flex: 1;
    min-width: 0;
  }

  .favorite-name {
    font-weight: 500;
    color: #303133;
    margin-bottom: 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .favorite-date {
    font-size: 12px;
    color: #909399;
    margin-top: 6px;
  }

  .favorite-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }
</style>
