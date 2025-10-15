'use client'

import { productsAPI } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { ProductCard } from './product-card'

interface ProductGridOptimizedProps {
  viewMode: 'grid' | 'list'
  searchQuery: string
  category: string
  showFavorites?: boolean
  priceRange?: { min: number; max: number }
  sortBy?: 'newest' | 'price-low' | 'price-high' | 'rating'
  onFavoritesCountChange?: (count: number) => void
}

// Мемоизированный компонент карточки товара
const MemoizedProductCard = memo(ProductCard, (prevProps, nextProps) => {
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.isFavorite === nextProps.isFavorite &&
    prevProps.viewMode === nextProps.viewMode &&
    prevProps.priority === nextProps.priority
  )
})

MemoizedProductCard.displayName = 'MemoizedProductCard'

export const ProductGridOptimized = memo(function ProductGridOptimized({ 
  viewMode, 
  searchQuery, 
  category, 
  showFavorites = false, 
  priceRange = { min: 0, max: 0 }, 
  sortBy = 'newest',
  onFavoritesCountChange
}: ProductGridOptimizedProps) {
  const [favorites, setFavorites] = useState<string[]>([])

  // Мемоизированные параметры запроса
  const queryParams = useMemo(() => ({
    search: searchQuery || undefined,
    category: category !== 'all' ? category : undefined,
    minPrice: priceRange.min > 0 ? priceRange.min : undefined,
    maxPrice: priceRange.max > 0 ? priceRange.max : undefined,
    sortBy: sortBy === 'newest' ? 'date' : sortBy === 'price-low' ? 'price' : sortBy === 'price-high' ? 'price' : 'rating',
    sortOrder: sortBy === 'price-high' ? 'desc' : 'asc',
    limit: 30,
    offset: 0
  }), [searchQuery, category, priceRange, sortBy])

  // Используем React Query для кэширования
  const { 
    data: productsData, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['products', queryParams],
    queryFn: () => productsAPI.getProducts(queryParams),
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 10 * 60 * 1000, // 10 минут
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  // Мемоизированная обработка избранного
  const handleToggleFavorite = useCallback((productId: string) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
      
      // Сохраняем в localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('favorites', JSON.stringify(newFavorites))
      }
      
      // Уведомляем родительский компонент
      onFavoritesCountChange?.(newFavorites.length)
      
      return newFavorites
    })
  }, [onFavoritesCountChange])

  // Мемоизированные товары
  const products = useMemo(() => {
    if (!productsData?.data) return []
    
    const productsArray = Array.isArray(productsData.data.products) 
      ? productsData.data.products 
      : Array.isArray(productsData.data) 
        ? productsData.data 
        : []
    
    return productsArray
  }, [productsData])

  // Мемоизированная фильтрация товаров
  const filteredProducts = useMemo(() => {
    return products.filter((product: any) => {
      const isInFavorites = favorites.includes(product.id)
      const matchesFavorites = !showFavorites || isInFavorites || product.isFavorite
      return matchesFavorites
    })
  }, [products, favorites, showFavorites])

  // Загружаем избранное при монтировании
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]')
      setFavorites(savedFavorites)
      onFavoritesCountChange?.(savedFavorites.length)
    }
  }, [onFavoritesCountChange])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Загрузка товаров...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-red-400 mb-4">
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Ошибка загрузки</h3>
        <p className="text-gray-500 text-center mb-4">
          {(error as any)?.response?.data?.message || 'Ошибка загрузки товаров'}
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Попробовать снова
        </button>
      </div>
    )
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Товары не найдены</h3>
        <p className="text-gray-500 text-center">
          Попробуйте изменить поисковый запрос или фильтры
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {filteredProducts.map((product: any, index: number) => (
          <MemoizedProductCard
            key={product.id}
            product={product}
            viewMode={viewMode}
            priority={index < 4} // Приоритет для первых 4 товаров
            isFavorite={favorites.includes(product.id)}
            onToggleFavorite={handleToggleFavorite}
          />
        ))}
      </div>
    </div>
  )
})