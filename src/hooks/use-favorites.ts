import { safeJSONStorage } from '@/lib/safe-storage'
import { useCallback, useEffect, useState } from 'react'

const FAVORITES_KEY = 'favorites'

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])

  // Загружаем избранное при инициализации
  useEffect(() => {
    const loadFavorites = () => {
      const savedFavorites = safeJSONStorage.getItem(FAVORITES_KEY, [])
      if (Array.isArray(savedFavorites)) {
        setFavorites(savedFavorites)
      }
    }

    loadFavorites()

    // Слушаем изменения в localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === FAVORITES_KEY) {
        loadFavorites()
      }
    }

    // Слушаем кастомные события
    const handleCustomChange = () => {
      loadFavorites()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange)
      window.addEventListener('favoritesChanged', handleCustomChange)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange)
        window.removeEventListener('favoritesChanged', handleCustomChange)
      }
    }
  }, [])

  // Добавляем товар в избранное
  const addToFavorites = useCallback((productId: string) => {
    setFavorites(prev => {
      if (prev.includes(productId)) return prev
      
      const newFavorites = [...prev, productId]
      safeJSONStorage.setItem(FAVORITES_KEY, newFavorites)
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('favoritesChanged'))
      }
      return newFavorites
    })
  }, [])

  // Удаляем товар из избранного
  const removeFromFavorites = useCallback((productId: string) => {
    setFavorites(prev => {
      if (!prev.includes(productId)) return prev
      
      const newFavorites = prev.filter(id => id !== productId)
      safeJSONStorage.setItem(FAVORITES_KEY, newFavorites)
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('favoritesChanged'))
      }
      return newFavorites
    })
  }, [])

  // Переключаем состояние избранного
  const toggleFavorite = useCallback((productId: string) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
      
      safeJSONStorage.setItem(FAVORITES_KEY, newFavorites)
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('favoritesChanged'))
      }
      return newFavorites
    })
  }, [])

  // Проверяем, находится ли товар в избранном
  const isFavorite = useCallback((productId: string) => {
    return favorites.includes(productId)
  }, [favorites])

  // Очищаем все избранное
  const clearFavorites = useCallback(() => {
    setFavorites([])
    safeJSONStorage.setItem(FAVORITES_KEY, [])
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('favoritesChanged'))
    }
  }, [])

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    favoritesCount: favorites.length
  }
}
