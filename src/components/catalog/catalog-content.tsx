'use client'

import { ProductCategory } from '@/types'
import { memo, useCallback, useState } from 'react'
import { ClientOnly } from '../client-only'
import { FilterButton } from './filter-button'
import { ProductFilters } from './product-filters'
import { ProductGrid } from './product-grid'
import { SearchBar } from './search-bar'
import { ViewModeToggle } from './view-mode-toggle'
import { ChartBarIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { useTelegramData } from '@/components/providers/telegram-data-provider'

export const CatalogContent = memo(function CatalogContent() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { userData } = useTelegramData()
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('all')
  const [showFavorites, setShowFavorites] = useState(false)
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 })
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'rating'>('newest')
  const [favoritesCount, setFavoritesCount] = useState(0)

  // Определяем роль пользователя
  const userRole = userData?.role || user?.role || 'BUYER'
  const isManager = userRole === 'MANAGER'

  // Мемоизированные обработчики
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value)
  }, [])

  const handleCategoryChange = useCallback((category: ProductCategory) => {
    setSelectedCategory(category)
  }, [])

  const handlePriceRangeChange = useCallback((range: { min: number; max: number }) => {
    setPriceRange(range)
  }, [])

  const handleSortChange = useCallback((sort: 'newest' | 'price-low' | 'price-high' | 'rating') => {
    setSortBy(sort)
  }, [])

  const handleToggleFavorites = useCallback(() => {
    setShowFavorites(prev => !prev)
  }, [])

  const handleToggleFilters = useCallback(() => {
    setShowFilters(prev => !prev)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Заголовок */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Каталог</h1>
          {/* Кнопка возврата в менеджер для менеджеров */}
          {isManager && (
            <button
              onClick={() => router.push('/manager')}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ChartBarIcon className="h-4 w-4" />
              <span className="text-sm font-medium">Менеджер</span>
            </button>
          )}
        </div>
      </div>

      {/* Поиск и фильтры */}
      <div className="px-4 py-6 space-y-4">
        <div className="flex items-center space-x-3">
          <SearchBar 
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Поиск товаров..."
          />
          <FilterButton 
            active={showFilters}
            onClick={handleToggleFilters}
          />
        </div>

        {/* Кнопка избранного */}
        <ViewModeToggle 
          mode="grid"
          onModeChange={() => {}}
          showFavorites={showFavorites}
          onToggleFavorites={handleToggleFavorites}
          favoritesCount={favoritesCount}
        />
      </div>

      {/* Панель фильтров */}
      {showFilters && (
        <div className="px-4 pb-4 border-b border-gray-200">
          <ProductFilters
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            showFavorites={showFavorites}
            onToggleFavorites={handleToggleFavorites}
            priceRange={priceRange}
            onPriceRangeChange={handlePriceRangeChange}
            sortBy={sortBy}
            onSortChange={handleSortChange}
          />
        </div>
      )}

      {/* Сетка товаров */}
      <div className="px-4 pb-4">
        <ClientOnly fallback={
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Загрузка каталога...</p>
          </div>
        }>
          <ProductGrid 
            viewMode="grid"
            searchQuery={searchQuery}
            category={selectedCategory}
            showFavorites={showFavorites}
            priceRange={priceRange}
            sortBy={sortBy}
            onFavoritesCountChange={setFavoritesCount}
          />
        </ClientOnly>
      </div>
    </div>
  )
})
