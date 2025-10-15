'use client'

import { MainLayout } from '@/components/layouts/main-layout'
import { useTelegramData } from '@/components/providers/telegram-data-provider'
import { moderationAPI } from '@/lib/api'
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

function ProductsModerationContent() {
  const router = useRouter()
  const { userData, isLoading: telegramLoading, isInTelegram } = useTelegramData()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null)

  // Загружаем товары на модерации
  const loadPendingProducts = async (page: number = 1) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await moderationAPI.getPendingProducts({ page, limit: 10 })
      setProducts(response.data.products)
      setPagination(response.data.pagination)
    } catch (error) {
      console.error('❌ Ошибка загрузки товаров на модерации:', error)
      setError('Не удалось загрузить товары на модерации')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPendingProducts()
  }, [])

  const handleApprove = async (productId: string) => {
    try {
      setActionLoading(productId)
      await moderationAPI.approveProduct(productId)
      
      // Обновляем список
      await loadPendingProducts(pagination.page)
      
      alert('Товар успешно одобрен!')
    } catch (error) {
      console.error('❌ Ошибка одобрения товара:', error)
      alert('Ошибка при одобрении товара')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (productId: string) => {
    if (!rejectReason.trim()) {
      alert('Укажите причину отклонения')
      return
    }

    try {
      setActionLoading(productId)
      await moderationAPI.rejectProduct(productId, rejectReason)
      
      // Обновляем список
      await loadPendingProducts(pagination.page)
      
      setShowRejectModal(null)
      setRejectReason('')
      alert('Товар отклонен!')
    } catch (error) {
      console.error('❌ Ошибка отклонения товара:', error)
      alert('Ошибка при отклонении товара')
    } finally {
      setActionLoading(null)
    }
  }

  const openRejectModal = (productId: string) => {
    setShowRejectModal(productId)
    setRejectReason('')
  }

  const closeRejectModal = () => {
    setShowRejectModal(null)
    setRejectReason('')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Заголовок */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Модерация товаров</h1>
          <p className="text-gray-600 mt-1">Проверка и одобрение товаров</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => router.push('/manager')}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>В менеджер</span>
          </button>
        </div>
      </div>

      {/* Ошибка */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircleIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Список товаров */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Товары на модерации ({pagination.total})
          </h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Загрузка товаров...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="divide-y">
            {products.map((product: any) => (
              <div key={product.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{product.title}</h3>
                      <span className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                        На модерации
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-2">{product.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                      <div>
                        <span className="font-medium">Цена:</span> {product.price} ₽
                      </div>
                      <div>
                        <span className="font-medium">Бренд:</span> {product.brand}
                      </div>
                      <div>
                        <span className="font-medium">Категория:</span> {product.category}
                      </div>
                      <div>
                        <span className="font-medium">Продавец:</span> {product.seller?.firstName} {product.seller?.lastName}
                      </div>
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-400">
                      Создан: {new Date(product.createdAt).toLocaleString('ru-RU')}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => handleApprove(product.id)}
                      disabled={actionLoading === product.id}
                      className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      {actionLoading === product.id ? 'Одобрение...' : 'Одобрить'}
                    </button>
                    
                    <button
                      onClick={() => openRejectModal(product.id)}
                      disabled={actionLoading === product.id}
                      className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <XCircleIcon className="h-4 w-4 mr-1" />
                      Отклонить
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Нет товаров на модерации</p>
          </div>
        )}
      </div>

      {/* Пагинация */}
      {pagination.pages > 1 && (
        <div className="mt-6 flex justify-center">
          <div className="flex space-x-2">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => loadPendingProducts(page)}
                className={`px-3 py-2 rounded-lg ${
                  page === pagination.page
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Модальное окно отклонения */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Отклонить товар</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Причина отклонения:
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Укажите причину отклонения товара..."
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeRejectModal}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={() => handleReject(showRejectModal)}
                disabled={!rejectReason.trim() || actionLoading === showRejectModal}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {actionLoading === showRejectModal ? 'Отклонение...' : 'Отклонить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ProductsModerationPage() {
  return (
    <MainLayout>
      <ProductsModerationContent />
    </MainLayout>
  )
}

