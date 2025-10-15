import { Product } from '@/types'
import { useCallback, useRef } from 'react'

interface CacheEntry {
  data: Product[]
  timestamp: number
  total: number
  hasMore: boolean
}

interface CacheKey {
  search?: string
  category?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: string
  sortOrder?: string
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 минут
const MAX_CACHE_SIZE = 50 // Максимум 50 записей в кэше

export function useProductsCache() {
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map())

  const generateKey = useCallback((params: CacheKey): string => {
    return JSON.stringify(params)
  }, [])

  const get = useCallback((key: string): CacheEntry | null => {
    const entry = cacheRef.current.get(key)
    if (!entry) return null

    // Проверяем, не истек ли кэш
    if (Date.now() - entry.timestamp > CACHE_DURATION) {
      cacheRef.current.delete(key)
      return null
    }

    return entry
  }, [])

  const set = useCallback((key: string, data: Product[], total: number, hasMore: boolean) => {
    // Очищаем старые записи, если кэш переполнен
    if (cacheRef.current.size >= MAX_CACHE_SIZE) {
      const oldestKey = cacheRef.current.keys().next().value
      if (oldestKey) {
        cacheRef.current.delete(oldestKey)
      }
    }

    cacheRef.current.set(key, {
      data,
      timestamp: Date.now(),
      total,
      hasMore
    })
  }, [])

  const append = useCallback((key: string, newData: Product[], total: number, hasMore: boolean) => {
    const existing = cacheRef.current.get(key)
    if (existing) {
      // Объединяем данные, избегая дубликатов
      const existingIds = new Set(existing.data.map(item => item.id))
      const uniqueNewData = newData.filter(item => !existingIds.has(item.id))
      
      cacheRef.current.set(key, {
        data: [...existing.data, ...uniqueNewData],
        timestamp: Date.now(),
        total,
        hasMore
      })
    } else {
      set(key, newData, total, hasMore)
    }
  }, [set])

  const clear = useCallback(() => {
    cacheRef.current.clear()
  }, [])

  const clearByPattern = useCallback((pattern: string) => {
    const keysToDelete: string[] = []
    for (const key of cacheRef.current.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key)
      }
    }
    keysToDelete.forEach(key => cacheRef.current.delete(key))
  }, [])

  return {
    get,
    set,
    append,
    clear,
    clearByPattern,
    generateKey
  }
}




