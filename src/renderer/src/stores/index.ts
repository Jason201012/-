import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { HistoryItem, QRCodeOptions } from '../types/qrcode'
import { DEFAULT_OPTIONS } from '../types/qrcode'

const STORAGE_KEY = 'qrcode-history'

export const useHistoryStore = defineStore('history', () => {
  const history = ref<HistoryItem[]>([])
  
  function loadHistory() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        history.value = JSON.parse(stored)
      }
    } catch (error) {
      console.error('加载历史记录失败:', error)
    }
  }
  
  function saveHistory() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history.value))
    } catch (error) {
      console.error('保存历史记录失败:', error)
    }
  }
  
  function addHistory(item: Omit<HistoryItem, 'id' | 'createdAt'>) {
    const newItem: HistoryItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: Date.now()
    }
    
    history.value.unshift(newItem)
    
    if (history.value.length > 100) {
      history.value = history.value.slice(0, 100)
    }
    
    saveHistory()
    return newItem
  }
  
  function deleteHistory(id: string) {
    const index = history.value.findIndex(item => item.id === id)
    if (index !== -1) {
      history.value.splice(index, 1)
      saveHistory()
    }
  }
  
  function clearHistory() {
    history.value = []
    saveHistory()
  }
  
  loadHistory()
  
  return {
    history,
    addHistory,
    deleteHistory,
    clearHistory
  }
})

export const useOptionsStore = defineStore('options', () => {
  const options = ref<QRCodeOptions>({ ...DEFAULT_OPTIONS })
  
  function updateOptions(newOptions: Partial<QRCodeOptions>) {
    options.value = { ...options.value, ...newOptions }
  }
  
  function resetOptions() {
    options.value = { ...DEFAULT_OPTIONS }
  }
  
  return {
    options,
    updateOptions,
    resetOptions
  }
})
