'use client'

import { cn } from '@/lib/utils'
import { ProductCategory } from '@/types'
import { HeartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'

interface ProductFiltersProps {
  selectedCategory: ProductCategory
  onCategoryChange: (category: ProductCategory) => void
  showFavorites: boolean
  onToggleFavorites: () => void
  priceRange: { min: number; max: number }
  onPriceRangeChange: (range: { min: number; max: number }) => void
  sortBy: 'newest' | 'price-low' | 'price-high' | 'rating'
  onSortChange: (sort: 'newest' | 'price-low' | 'price-high' | 'rating') => void
}

const categories = [
  { id: 'all' as ProductCategory, label: 'Все товары', icon: '🛍️' },
  { id: 'clothing' as ProductCategory, label: 'Одежда', icon: '👕' },
  { id: 'beauty' as ProductCategory, label: 'Красота', icon: '💄' },
  { id: 'home' as ProductCategory, label: 'Дом', icon: '🏠' },
  { id: 'electronics' as ProductCategory, label: 'Электроника', icon: '📱' },
  { id: 'other' as ProductCategory, label: 'Другое', icon: '📦' },
]

const sortOptions = [
  { id: 'newest', label: 'Сначала новые' },
  { id: 'price-low', label: 'Цена: по возрастанию' },
  { id: 'price-high', label: 'Цена: по убыванию' },
  { id: 'rating', label: 'По рейтингу' },
]

export function ProductFilters({ 
  selectedCategory, 
  onCategoryChange, 
  showFavorites, 
  onToggleFavorites,
  priceRange,
  onPriceRangeChange,
  sortBy,
  onSortChange
}: ProductFiltersProps) {
  return (
    <div className="space-y-6">
      {/* Категории */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Категории</h3>
        <div className="grid grid-cols-2 gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={cn(
                'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors',
                selectedCategory === category.id
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
              )}
            >
              <span className="text-base">{category.icon}</span>
              <span>{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Ценовой диапазон */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Цена</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="От"
              value={priceRange.min || ''}
              onChange={(e) => onPriceRangeChange({ ...priceRange, min: Number(e.target.value) || 0 })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-gray-500">—</span>
            <input
              type="number"
              placeholder="До"
              value={priceRange.max || ''}
              onChange={(e) => onPriceRangeChange({ ...priceRange, max: Number(e.target.value) || 0 })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Сортировка */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Сортировка</h3>
        <div className="space-y-2">
          {sortOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => onSortChange(option.id as any)}
              className={cn(
                'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                sortBy === option.id
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Избранное */}
      <div>
        <button
          onClick={onToggleFavorites}
          className={cn(
            'flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-sm transition-colors',
            showFavorites
              ? 'bg-red-100 text-red-700 border border-red-200'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
          )}
        >
          {showFavorites ? (
            <HeartSolidIcon className="h-4 w-4" />
          ) : (
            <HeartIcon className="h-4 w-4" />
          )}
          <span>Только избранное</span>
        </button>
      </div>
    </div>
  )
}
