'use client'

import { RoleGuard } from '@/components/auth/role-guard'
import { MainLayout } from '@/components/layouts/main-layout'
import { useTelegramData } from '@/components/providers/telegram-data-provider'
import { ProductsManagementModal } from '@/components/seller/products-management-modal'
import { productsAPI } from '@/lib/api'
import { Product } from '@/types'
import { ShoppingBagIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'

function SellerContent() {
  const { userData, isLoading: telegramLoading, isInTelegram } = useTelegramData()
  const [showProductsModal, setShowProductsModal] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Отладочная информация
  console.log('🔍 SellerContent - userData:', userData)
  console.log('🔍 SellerContent - isInTelegram:', isInTelegram)
  console.log('🔍 SellerContent - telegramLoading:', telegramLoading)

  // Загрузка товаров из БД
  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Пробуем загрузить товары из API
      try {
        const response = await productsAPI.getMyProducts({ limit: 100 })
        
        if (response.data) {
          // Преобразуем данные API в формат Product
          const formattedProducts: Product[] = response.data.map((product: any) => ({
            id: product.id,
            title: product.title,
            description: product.description || '',
            price: parseFloat(product.price) || 0,
            originalPrice: product.originalPrice ? parseFloat(product.originalPrice) : undefined,
            category: product.category || '',
            subcategory: product.subcategory || undefined,
            images: product.images || [],
            rating: product.rating || 0,
            reviewsCount: product.reviewsCount || 0,
            inStock: product.isActive !== false,
            tags: product.tags || [],
            seller: {
              id: product.seller?.id || 'current_user',
              name: product.seller?.name || 'Текущий пользователь',
              avatar: product.seller?.avatar,
              verified: product.seller?.verified || true,
            },
            createdAt: product.createdAt || new Date().toISOString(),
            updatedAt: product.updatedAt || new Date().toISOString(),
          }))
          
          setProducts(formattedProducts)
          console.log('✅ Товары загружены из БД:', formattedProducts.length)
          return
        }
      } catch (apiError: any) {
        console.error('❌ Ошибка загрузки товаров:', apiError.message)
        setError('Не удалось загрузить товары. Попробуйте позже.')
        setProducts([])
      }
    } catch (err: any) {
      console.error('❌ Критическая ошибка загрузки товаров:', err)
      setError('Не удалось загрузить товары')
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    {
      title: 'Мои товары',
      description: 'Управление товарами',
      icon: ShoppingBagIcon,
      onClick: () => setShowProductsModal(true),
      color: 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
    },
  ]

  const handleProductCreate = async (product: Product) => {
    try {
      const response = await productsAPI.createProduct({
        title: product.title,
        description: product.description,
        price: product.price,
        images: product.images,
        category: product.category,
        brand: product.seller.name,
      })
      
      if (response.data) {
        // Перезагружаем товары из БД
        await loadProducts()
        console.log('✅ Товар создан в БД')
      }
    } catch (err: any) {
      console.error('❌ Ошибка создания товара:', err)
      setError(err.response?.data?.message || 'Ошибка создания товара')
    }
  }

  const handleProductUpdate = async (updatedProduct: Product) => {
    try {
      const response = await productsAPI.updateProduct(updatedProduct.id, {
        title: updatedProduct.title,
        description: updatedProduct.description,
        price: updatedProduct.price,
        images: updatedProduct.images,
        category: updatedProduct.category,
        // isActive: updatedProduct.inStock, // УБРАЛИ isActive
      })
      
      if (response.data) {
        // Обновляем товар в локальном состоянии
        setProducts(prev => 
          prev.map(p => p.id === updatedProduct.id ? updatedProduct : p)
        )
        console.log('✅ Товар обновлен в БД')
      }
    } catch (err: any) {
      console.error('❌ Ошибка обновления товара:', err)
      setError(err.response?.data?.message || 'Ошибка обновления товара')
    }
  }

  const handleProductDelete = async (productId: string) => {
    try {
      await productsAPI.deleteProduct(productId)
      
      // Удаляем товар из локального состояния
      setProducts(prev => prev.filter(p => p.id !== productId))
      console.log('✅ Товар удален из БД')
    } catch (err: any) {
      console.error('❌ Ошибка удаления товара:', err)
      setError(err.response?.data?.message || 'Ошибка удаления товара')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка товаров...</p>
        </div>
      </div>
    )
  }

  if (error && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Ошибка загрузки</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadProducts}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Заголовок */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Панель продавца</h1>
        <p className="text-gray-600 mt-1">Управляйте своими товарами и продажами</p>
        {error && products.length > 0 && (
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              ⚠️ {error} Показаны демонстрационные товары.
            </p>
          </div>
        )}
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Всего товаров</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
              <p className="text-sm font-medium text-gray-600">В наличии</p>
              <p className="text-2xl font-bold text-green-600">
                {products.filter(p => p.inStock).length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <div className="h-6 w-6 bg-green-600 rounded-full"></div>
            </div>
          </div>
                </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Средняя цена</p>
              <p className="text-2xl font-bold text-purple-600">
                ₽{products.length > 0 ? Math.round(products.reduce((sum, p) => sum + p.price, 0) / products.length).toLocaleString() : '0'}
              </p>
              </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <div className="h-6 w-6 bg-purple-600 rounded"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Быстрые действия */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Быстрые действия</h2>
        <div className="w-full">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <button
                key={index}
                onClick={action.onClick}
                className={`${action.color} text-white rounded-xl p-6 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-lg w-full`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-3 bg-white bg-opacity-20 rounded-lg mr-4">
                      <Icon className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl">{action.title}</h3>
                      <p className="text-sm opacity-90 leading-relaxed">{action.description}</p>
                    </div>
                  </div>
                  <div className="text-2xl opacity-70">→</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Модалки */}
      {showProductsModal && (
        <ProductsManagementModal
          isOpen={showProductsModal}
          onClose={() => setShowProductsModal(false)}
          products={products}
          onProductCreate={handleProductCreate}
          onProductUpdate={handleProductUpdate}
          onProductDelete={handleProductDelete}
        />
      )}
    </div>
  )
}

export default function SellerPage() {
  return (
    <RoleGuard allowedRoles={['SELLER']}>
      <MainLayout>
        <SellerContent />
      </MainLayout>
    </RoleGuard>
  )
}
