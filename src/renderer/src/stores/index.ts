import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { HistoryItem, QRCodeOptions } from '../types/qrcode'
import { DEFAULT_OPTIONS } from '../types/qrcode'

const STORAGE_KEY = 'qrcode-history'
const THEME_KEY = 'qrcode-theme'
const FAVORITES_KEY = 'qrcode-favorites'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(false)

  function loadTheme() {
    try {
      const stored = localStorage.getItem(THEME_KEY)
      if (stored !== null) {
        isDark.value = stored === 'dark'
      } else {
        isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
      }
      applyTheme()
    } catch (error) {
      console.error('加载主题失败:', error)
    }
  }

  function applyTheme() {
    const html = document.documentElement
    if (isDark.value) {
      html.classList.add('dark-mode')
      html.setAttribute('data-theme', 'dark')
    } else {
      html.classList.remove('dark-mode')
      html.setAttribute('data-theme', 'light')
    }
  }

  function toggleTheme() {
    isDark.value = !isDark.value
    applyTheme()
    localStorage.setItem(THEME_KEY, isDark.value ? 'dark' : 'light')
  }

  function setTheme(dark: boolean) {
    isDark.value = dark
    applyTheme()
    localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light')
  }

  loadTheme()

  return {
    isDark,
    toggleTheme,
    setTheme
  }
})

export interface FavoriteItem {
  id: string
  name: string
  type: string
  content: string
  options: QRCodeOptions
  createdAt: number
}

export const useFavoritesStore = defineStore('favorites', () => {
  const favorites = ref<FavoriteItem[]>([])

  function loadFavorites() {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY)
      if (stored) {
        favorites.value = JSON.parse(stored)
      }
    } catch (error) {
      console.error('加载收藏失败:', error)
    }
  }

  function saveFavorites() {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites.value))
    } catch (error) {
      console.error('保存收藏失败:', error)
    }
  }

  function addFavorite(item: Omit<FavoriteItem, 'id' | 'createdAt'>) {
    const newItem: FavoriteItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: Date.now()
    }
    favorites.value.unshift(newItem)
    saveFavorites()
    return newItem
  }

  function removeFavorite(id: string) {
    const index = favorites.value.findIndex((item) => item.id === id)
    if (index !== -1) {
      favorites.value.splice(index, 1)
      saveFavorites()
    }
  }

  function isFavorite(content: string): boolean {
    return favorites.value.some((item) => item.content === content)
  }

  loadFavorites()

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite
  }
})

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
    const index = history.value.findIndex((item) => item.id === id)
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
