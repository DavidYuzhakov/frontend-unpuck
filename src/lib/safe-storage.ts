/**
 * Безопасная работа с localStorage
 */

export const safeStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null
    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.error('Ошибка чтения из localStorage:', error)
      return null
    }
  },

  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(key, value)
    } catch (error) {
      console.error('Ошибка записи в localStorage:', error)
    }
  },

  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Ошибка удаления из localStorage:', error)
    }
  },

  clear: (): void => {
    if (typeof window === 'undefined') return
    try {
      localStorage.clear()
    } catch (error) {
      console.error('Ошибка очистки localStorage:', error)
    }
  }
}

/**
 * Безопасная работа с JSON в localStorage
 */
export const safeJSONStorage = {
  getItem: <T>(key: string, defaultValue: T): T => {
    const item = safeStorage.getItem(key)
    if (!item) return defaultValue
    
    try {
      return JSON.parse(item)
    } catch (error) {
      console.error('Ошибка парсинга JSON из localStorage:', error)
      return defaultValue
    }
  },

  setItem: <T>(key: string, value: T): void => {
    try {
      safeStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Ошибка сериализации JSON в localStorage:', error)
    }
  }
}
