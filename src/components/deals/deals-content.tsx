'use client'

import { AvatarPreloader } from '@/components/ui/avatar'
import { dealsAPI } from '@/lib/api'
import { getDealsFromStorage, saveDealsToStorage } from '@/lib/storage'
import { Deal } from '@/types'
import { useEffect, useState } from 'react'
import { DealCard } from './deal-card'
import { ChartBarIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { useTelegramData } from '@/components/providers/telegram-data-provider'

export function DealsContent() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { userData } = useTelegramData()
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Определяем роль пользователя
  const userRole = userData?.role || user?.role || 'BUYER'
  const isManager = userRole === 'MANAGER'

  // Загружаем сделки с сервера
  const loadDeals = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 Загружаем сделки...')
      const response = await dealsAPI.getDeals({ limit: 50, offset: 0 })
      console.log('✅ Ответ сервера (сделки):', response.data)
      
      const dealsData = response.data.data || response.data
      const dealsArray = Array.isArray(dealsData) ? dealsData : []
      
      // Преобразуем данные API в формат Deal
      const formattedDeals: Deal[] = dealsArray.map((deal: any) => ({
        id: deal.id,
        product: {
          id: deal.product?.id || '',
          title: deal.product?.title || '',
          description: '',
          price: parseInt(deal.product?.price) || 0,
          originalPrice: parseInt(deal.product?.price) || 0,
          category: '',
          subcategory: '',
          images: deal.product?.images || [],
          rating: 4.5,
          reviewsCount: 0,
          seller: {
            id: deal.seller?.id || '',
            name: `${deal.seller?.firstName || ''} ${deal.seller?.lastName || ''}`.trim() || deal.seller?.username || 'Неизвестный продавец',
            avatar: '/avatars/default.jpg',
            verified: true,
          },
          inStock: true,
          tags: [],
          createdAt: deal.createdAt,
          updatedAt: deal.updatedAt,
        },
        buyer: {
          id: deal.buyer?.id || '',
          name: `${deal.buyer?.firstName || ''} ${deal.buyer?.lastName || ''}`.trim() || deal.buyer?.username || 'Неизвестный покупатель',
          email: deal.buyer?.email || '',
          role: 'SELLER' as const,
          verified: deal.buyer?.isVerified || false,
          createdAt: deal.buyer?.createdAt || new Date().toISOString(),
          updatedAt: deal.buyer?.updatedAt || new Date().toISOString(),
        },
        seller: {
          id: deal.seller?.id || '',
          name: `${deal.seller?.firstName || ''} ${deal.seller?.lastName || ''}`.trim() || deal.seller?.username || 'Неизвестный продавец',
          email: deal.seller?.email || '',
          role: 'SELLER' as const,
          verified: deal.seller?.isVerified || false,
          avatar: '/avatars/default.jpg',
          createdAt: deal.seller?.createdAt || new Date().toISOString(),
          updatedAt: deal.seller?.updatedAt || new Date().toISOString(),
        },
        status: deal.status || 'PENDING',
        quantity: deal.quantity || 1,
        totalPrice: parseInt(deal.amount) || 0, // Используем amount вместо totalPrice
        paymentMethod: 'card' as const,
        trackingNumber: deal.trackingNumber,
        createdAt: deal.createdAt,
        updatedAt: deal.updatedAt,
        estimatedDelivery: deal.estimatedDelivery,
      }))
      
      setDeals(formattedDeals)
      saveDealsToStorage(formattedDeals)
    } catch (err: any) {
      console.error('❌ Ошибка загрузки сделок:', err)
      setError(err.response?.data?.message || 'Ошибка загрузки сделок')
      
      // Fallback на localStorage
      const storedDeals = getDealsFromStorage()
      if (storedDeals && storedDeals.length > 0) {
        setDeals(storedDeals)
      } else {
        setDeals([])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDeals()
  }, [])

  // Слушаем изменения в localStorage и кастомные события
  useEffect(() => {
    const handleStorageChange = () => {
      const storedDeals = getDealsFromStorage()
      if (storedDeals) {
        setDeals(storedDeals)
      }
    }

    const handleDealUpdate = () => {
      const storedDeals = getDealsFromStorage()
      if (storedDeals) {
        setDeals(storedDeals)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('dealUpdated', handleDealUpdate)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('dealUpdated', handleDealUpdate)
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка сделок...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ошибка загрузки</h3>
          <p className="text-gray-500 text-center mb-4">{error}</p>
          <button
            onClick={loadDeals}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Заголовок */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Сделки</h1>
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

      {/* Список сделок */}
      <div className="px-6 pb-6 pt-6">
        {deals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Сделок не найдено</h3>
            <p className="text-gray-500 text-center">
              У вас пока нет сделок с выбранным статусом
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Предзагрузка аватаров */}
            <AvatarPreloader 
              names={deals.flatMap(deal => [
                deal.seller.name,
                deal.buyer.name
              ]).filter((name, index, array) => 
                name && array.indexOf(name) === index
              )} 
              size={16}
            />
            
            {deals.map((deal) => (
              <DealCard 
                key={deal.id} 
                deal={deal}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}