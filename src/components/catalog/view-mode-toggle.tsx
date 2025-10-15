'use client'

import { cn } from '@/lib/utils'
import { HeartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'

interface ViewModeToggleProps {
  mode: 'grid' | 'list'
  onModeChange: (mode: 'grid' | 'list') => void
  showFavorites: boolean
  onToggleFavorites: () => void
  favoritesCount?: number
}

export function ViewModeToggle({ mode, onModeChange, showFavorites, onToggleFavorites, favoritesCount = 0 }: ViewModeToggleProps) {
  return (
    <div className="flex items-center justify-end">
      <button 
        onClick={onToggleFavorites}
        className={cn(
          'relative flex items-center justify-center rounded-lg p-2 transition-colors',
          showFavorites
            ? 'bg-red-100 text-red-600 hover:bg-red-200'
            : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
        )}
      >
        {showFavorites ? (
          <HeartSolidIcon className="h-5 w-5" />
        ) : (
          <HeartIcon className="h-5 w-5" />
        )}
        
        {/* Счетчик избранных товаров */}
        {favoritesCount > 0 && (
          <span className={cn(
            'absolute -top-1 -right-1 h-5 w-5 rounded-full text-xs font-bold flex items-center justify-center',
            showFavorites
              ? 'bg-red-600 text-white'
              : 'bg-red-500 text-white'
          )}>
            {favoritesCount > 99 ? '99+' : favoritesCount}
          </span>
        )}
      </button>
    </div>
  )
}
