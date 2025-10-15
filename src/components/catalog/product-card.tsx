'use client'

import { paymentAPI } from '@/lib/api'
import { getProductImageUrl } from '@/lib/image-utils'
import { Product } from '@/types'
import { HeartIcon as HeartOutlineIcon } from '@heroicons/react/24/outline'
import { HeartIcon, StarIcon } from '@heroicons/react/24/solid'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { ClientOnly } from '../client-only'

interface ProductCardProps {
  product: Product
  viewMode: 'grid' | 'list'
  priority?: boolean
  isFavorite?: boolean
  onToggleFavorite?: (productId: string) => void
}

function ProductCardContent({
  product,
  viewMode,
  priority = false,
  isFavorite: propIsFavorite,
  onToggleFavorite,
}: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(propIsFavorite || false)
  const [isQuickOrdering, setIsQuickOrdering] = useState(false)

  // Синхронизируем состояние с localStorage
  useEffect(() => {
    // Проверяем, что мы на клиенте
    if (typeof window === 'undefined') return

    const updateFavoriteState = () => {
      const savedFavorites = JSON.parse(
        localStorage.getItem('favorites') || '[]'
      )
      const isInFavorites = savedFavorites.includes(product.id)
      setIsFavorite(isInFavorites)
    }

    // Обновляем состояние при монтировании
    updateFavoriteState()

    // Слушаем изменения в localStorage
    const handleStorageChange = () => {
      updateFavoriteState()
    }

    window.addEventListener('storage', handleStorageChange)

    // Также слушаем кастомное событие для обновления в той же вкладке
    window.addEventListener('favoritesChanged', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('favoritesChanged', handleStorageChange)
    }
  }, [product.id])

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    const newFavoriteState = !isFavorite
    setIsFavorite(newFavoriteState)

    // Вызываем переданный колбэк, если он есть
    if (onToggleFavorite) {
      onToggleFavorite(product.id)
    }

    // Сохраняем в localStorage
    if (typeof window !== 'undefined') {
      const savedFavorites = JSON.parse(
        localStorage.getItem('favorites') || '[]'
      )
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
    }
  }

  const handleProductClick = () => {
    // Переход к детальной странице товара
    window.location.href = `/product/${product.id}`
  }

  const handleQuickOrder = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    if (isQuickOrdering || !product.inStock) return

    setIsQuickOrdering(true)

    try {
      // Создание быстрого платежа через API
      const response = await paymentAPI.quickCreatePayment({
        productId: product.id,
        quantity: 1,
        price: product.price,
        title: product.title,
        sellerId: product.seller.id,
        userId: 'user_123', // В реальном приложении получать из контекста авторизации
      })

      const result = response.data

      if (result.success && result.payment) {
        // Моментальное перенаправление на ЮKassa
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
      alert(
        error.response?.data?.message ||
          'Произошла ошибка при создании заказа. Попробуйте еще раз.'
      )
    } finally {
      setIsQuickOrdering(false)
    }
  }

  const discountPercentage = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0

  console.log(product.images[0])

  return (
    <div
      onClick={handleProductClick}
      className="group cursor-pointer rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-200"
    >
      <div className="relative aspect-square overflow-hidden rounded-t-xl">
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-full h-full object-cover"
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
            <span className="ml-1 text-xs text-gray-600">{product.rating}</span>
            <span className="ml-1 text-xs text-gray-400">
              ({product.reviewsCount})
            </span>
          </div>

          <div className="text-xs text-gray-500">
            {product.seller.firstName}
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
}

export function ProductCard(props: ProductCardProps) {
  return (
    <ClientOnly
      fallback={<div className="animate-pulse bg-gray-200 rounded-lg h-64" />}
    >
      <ProductCardContent {...props} />
    </ClientOnly>
  )
}
