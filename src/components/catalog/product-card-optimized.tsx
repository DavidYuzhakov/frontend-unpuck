'use client'

import { paymentAPI } from '@/lib/api'
import { getProductImageUrl } from '@/lib/image-utils'
import { Product } from '@/types'
import { HeartIcon as HeartOutlineIcon } from '@heroicons/react/24/outline'
import { HeartIcon, StarIcon } from '@heroicons/react/24/solid'
import Image from 'next/image'
import { memo, useCallback, useMemo, useState } from 'react'

interface ProductCardOptimizedProps {
  product: Product
  viewMode: 'grid' | 'list'
  priority?: boolean
  isFavorite?: boolean
  onToggleFavorite?: (productId: string) => void
}

export const ProductCardOptimized = memo(function ProductCardOptimized({ 
  product, 
  viewMode, 
  priority = false, 
  isFavorite: propIsFavorite, 
  onToggleFavorite 
}: ProductCardOptimizedProps) {
  const [isFavorite, setIsFavorite] = useState(propIsFavorite || false)
  const [isQuickOrdering, setIsQuickOrdering] = useState(false)

  // Мемоизированная обработка избранного
  const handleFavoriteToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    
    const newFavoriteState = !isFavorite
    setIsFavorite(newFavoriteState)
    
    // Вызываем переданный колбэк
    onToggleFavorite?.(product.id)
    
    // Сохраняем в localStorage
    const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]')
    if (newFavoriteState) {
      if (!savedFavorites.includes(product.id)) {
        savedFavorites.push(product.id)
      }
    } else {
      const index = savedFavorites.indexOf(product.id)
      if (index > -1) {
        savedFavorites.splice(index, 1)
      }
    }
    localStorage.setItem('favorites', JSON.stringify(savedFavorites))
    
    // Отправляем кастомное событие для обновления других компонентов
    window.dispatchEvent(new CustomEvent('favoritesChanged'))
  }, [isFavorite, product.id, onToggleFavorite])

  // Мемоизированная обработка клика по товару
  const handleProductClick = useCallback(() => {
    window.location.href = `/product/${product.id}`
  }, [product.id])

  // Мемоизированная обработка быстрого заказа
  const handleQuickOrder = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    
    if (isQuickOrdering || !product.inStock) return
    
    setIsQuickOrdering(true)
    
    try {
      const response = await paymentAPI.quickCreatePayment({
        productId: product.id,
        quantity: 1,
        price: product.price,
        title: product.title,
        sellerId: product.seller.id,
        userId: 'user_123'
      })

      const result = response.data

      if (result.success && result.payment) {
        if (result.payment.confirmation?.confirmation_url) {
          window.location.href = result.payment.confirmation.confirmation_url
        } else {
          throw new Error('URL для оплаты не получен от ЮKassa')
        }
      } else {
        throw new Error(result.error || 'Ошибка при создании платежа')
      }
    } catch (error: any) {
      console.error('❌ Ошибка при быстром заказе:', error)
      alert(error.response?.data?.message || 'Произошла ошибка при создании заказа. Попробуйте еще раз.')
    } finally {
      setIsQuickOrdering(false)
    }
  }, [isQuickOrdering, product])

  // Мемоизированный расчет скидки
  const discountPercentage = useMemo(() => {
    return product.originalPrice 
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0
  }, [product.originalPrice, product.price])

  // Мемоизированный URL изображения
  const imageUrl = useMemo(() => getProductImageUrl(product.images?.[0]), [product.images])

  return (
    <div 
      onClick={handleProductClick}
      className="group cursor-pointer rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-200"
    >
      <div className="relative aspect-square overflow-hidden rounded-t-xl">
        <Image
          src={imageUrl || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&crop=center'}
          alt={product.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-200"
          sizes="(max-width: 768px) 50vw, 25vw"
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&crop=center'
          }}
        />
        
        {/* Теги */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          {product.tags?.includes('новинка') && (
            <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              NEW
            </div>
          )}
          {discountPercentage > 0 && (
            <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              -{discountPercentage}%
            </div>
          )}
        </div>
        
        {/* Кнопка избранного */}
        <button
          onClick={handleFavoriteToggle}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/95 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110 flex items-center justify-center backdrop-blur-sm"
        >
          {isFavorite ? (
            <HeartIcon className="h-4 w-4 text-red-500" />
          ) : (
            <HeartOutlineIcon className="h-4 w-4 text-gray-500 hover:text-red-400 transition-colors duration-200" />
          )}
        </button>
      </div>
      
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
          {product.title}
        </h3>
        
        <p className="text-xs text-gray-500 line-clamp-2 mb-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <StarIcon className="h-4 w-4 text-yellow-400" />
            <span className="ml-1 text-xs text-gray-600">
              {product.rating}
            </span>
            <span className="ml-1 text-xs text-gray-400">
              ({product.reviewsCount})
            </span>
          </div>
          
          <div className="text-xs text-gray-500">
            {product.seller.name}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            {product.originalPrice && (
              <div className="text-xs text-gray-400 line-through">
                {product.originalPrice.toLocaleString()} ₽
              </div>
            )}
            <div className="text-sm font-semibold text-gray-900">
              {product.price.toLocaleString()} ₽
            </div>
          </div>
          
          {!product.inStock && (
            <div className="text-xs text-red-500 font-medium">
              Нет в наличии
            </div>
          )}
        </div>
        
        {/* Кнопка быстрого заказа */}
        {product.inStock && (
          <button
            onClick={handleQuickOrder}
            disabled={isQuickOrdering}
            className={`w-full mt-3 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
              isQuickOrdering
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isQuickOrdering ? (
              <div className="flex items-center justify-center space-x-1">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                <span>Заказ...</span>
              </div>
            ) : (
              'Заказать'
            )}
          </button>
        )}
      </div>
    </div>
  )
})
