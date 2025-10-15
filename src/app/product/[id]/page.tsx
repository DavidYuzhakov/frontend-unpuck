'use client'

import { MainLayout } from '@/components/layouts/main-layout'
import { paymentAPI, productsAPI } from '@/lib/api'
import { getProductImageUrl } from '@/lib/image-utils'
import { Product } from '@/types'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { StarIcon } from '@heroicons/react/24/solid'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface ProductPageProps {
  params: { id: string }
}

export default function ProductPage({ params }: ProductPageProps) {
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  // Загружаем товар из БД
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log('🔄 Загружаем товар с ID:', params.id)
        const response = await productsAPI.getProduct(params.id)
        console.log('✅ Ответ сервера:', response.data)

        if (response.data) {
          setProduct({
            ...response.data,
            inStock: response.data.inStock ?? true,
          })
        }
      } catch (err: any) {
        console.error('❌ Ошибка загрузки товара:', err)
        setError(err.response?.data?.message || 'Ошибка загрузки товара')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      loadProduct()
    }
  }, [params.id])

  const handleBack = () => {
    router.back()
  }

  const handleAddToCart = async () => {
    if (isProcessing || !product) return

    setIsProcessing(true)

    try {
      console.log('🔄 Создаем быстрый платеж для товара:', product.title)

      // Создание быстрого платежа через API
      const response = await paymentAPI.quickCreatePayment({
        productId: product.id,
        quantity: 1,
        price: product.price,
        title: product.title,
        sellerId: product.seller.id,
        userId: 'user_123', // В реальном приложении получать из контекста авторизации
      })

      console.log('✅ Ответ сервера:', response.data)
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
      console.error('❌ Ошибка при создании быстрого платежа:', error)
      alert(
        error.response?.data?.message ||
          'Произошла ошибка при создании платежа. Попробуйте еще раз.'
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const discountPercentage = product?.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0

  // Показываем загрузку
  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка товара...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  // Показываем ошибку
  if (error || !product) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Ошибка загрузки
            </h2>
            <p className="text-gray-600 mb-4">{error || 'Товар не найден'}</p>
            <button
              onClick={() => router.back()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Назад
            </button>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-white">
        {/* Заголовок с кнопкой назад */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span className="text-sm font-medium">Назад</span>
            </button>
          </div>
        </div>

        {/* Изображения товара */}
        <div className="px-4 py-4">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
            <img
              src={getProductImageUrl(product.images[selectedImage])}
              alt={product.title}
              className="object-cover w-full h-full"
              sizes="(max-width: 768px) 100vw, 50vw"
            />

            {/* Теги */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
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
          </div>

          {/* Миниатюры изображений */}
          <div className="flex space-x-2 mt-3 overflow-x-auto">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                  selectedImage === index
                    ? 'border-blue-500'
                    : 'border-gray-200'
                }`}
              >
                <img
                  src={image}
                  alt={`${product.title} ${index + 1}`}
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Информация о товаре */}
        <div className="px-4 pb-4">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            {product.title}
          </h1>

          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            {product.description}
          </p>

          {/* Рейтинг и отзывы */}
          <div className="">
            <div className="flex items-center">
              <StarIcon className="h-4 w-4 text-yellow-400" />
              <span className="ml-1 text-sm font-medium text-gray-900">
                {product.rating}
              </span>
              <span className="ml-1 text-sm text-gray-500">
                ({product.reviewsCount} отзывов)
              </span>
            </div>

            <div className="text-sm text-gray-500">
              Продавец: {product.seller.firstName}
              {product.seller.isVerified && (
                <span className="ml-1 text-green-500">✓</span>
              )}
            </div>
          </div>

          {/* Цена */}
          <div className="mb-6">
            <div className="flex items-center space-x-3">
              <div className="text-2xl font-bold text-gray-900">
                {product.price.toLocaleString()} ₽
              </div>
              {product.originalPrice && (
                <div className="text-lg text-gray-400 line-through">
                  {product.originalPrice.toLocaleString()} ₽
                </div>
              )}
            </div>
            {discountPercentage > 0 && (
              <div className="text-sm text-red-500 font-medium mt-1">
                Экономия {discountPercentage}%
              </div>
            )}
          </div>

          {/* Кнопка покупки */}
          <button
            onClick={handleAddToCart}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              product.inStock && !isProcessing
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!product.inStock || isProcessing}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Переход к оплате...</span>
              </div>
            ) : product.inStock ? (
              'Заказать'
            ) : (
              'Нет в наличии'
            )}
          </button>
        </div>
      </div>
    </MainLayout>
  )
}
