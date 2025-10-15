'use client'

import { MainLayout } from '@/components/layouts/main-layout'
import { useTelegramData } from '@/components/providers/telegram-data-provider'
import { moderationAPI } from '@/lib/api'
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

function ModerationContent() {
  const router = useRouter()
  const { userData, isLoading: telegramLoading, isInTelegram } = useTelegramData()

  const [stats, setStats] = useState({
    pending: { products: 0, users: 0 },
    approvedToday: { products: 0, users: 0 },
    total: { products: 0, users: 0 }
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Загружаем статистику модерации с повторными попытками
  const loadModerationStats = async (retryCount = 0) => {
    try {
      setLoading(true)
      setError(null)
      
      console.log(`🔄 Загружаем статистику модерации (попытка ${retryCount + 1})`)
      
      const statsData = await moderationAPI.getModerationStats()
      console.log('✅ Статистика модерации загружена:', statsData)
      setStats(statsData.data)
    } catch (error: any) {
      console.error('❌ Ошибка загрузки статистики модерации:', error)
      
      // Если это ошибка 500 и у нас есть попытки, пробуем еще раз
      if (error?.response?.status === 500 && retryCount < 2) {
        console.log(`🔄 Повторная попытка через 2 секунды (${retryCount + 1}/2)`)
        setTimeout(() => {
          loadModerationStats(retryCount + 1)
        }, 2000)
        return
      }
      
      // Если это ошибка авторизации, пробуем переавторизоваться
      if (error?.response?.status === 401) {
        console.log('🔑 Ошибка авторизации, пробуем переавторизоваться')
        try {
          const { tokenManager } = await import('@/lib/token-manager')
          await tokenManager.autoAuth()
          // Пробуем еще раз после авторизации
          setTimeout(() => {
            loadModerationStats(retryCount + 1)
          }, 1000)
          return
        } catch (authError) {
          console.error('❌ Ошибка переавторизации:', authError)
        }
      }
      
      setError(`Не удалось загрузить статистику модерации. ${error?.response?.status === 500 ? 'Ошибка сервера' : 'Проверьте подключение к интернету'}. Попробуйте обновить страницу.`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadModerationStats()
  }, [])

  // Перезагружаем данные при возврате на страницу
  useEffect(() => {
    const handleFocus = () => {
      console.log('🔄 Страница модерации получила фокус, перезагружаем данные')
      loadModerationStats()
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 Страница модерации стала видимой, перезагружаем данные')
        loadModerationStats()
      }
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const statsCards = [
    {
      label: 'Товары на модерации',
      value: stats.pending.products.toString(),
      icon: ExclamationTriangleIcon,
      color: 'text-orange-600',
      subtitle: `Всего товаров: ${stats.total.products}`,
      href: '/moderation/products'
    },
    {
      label: 'Пользователи на модерации',
      value: stats.pending.users.toString(),
      icon: ExclamationTriangleIcon,
      color: 'text-blue-600',
      subtitle: `Всего пользователей: ${stats.total.users}`,
      href: '/moderation/users'
    },
    {
      label: 'Одобрено сегодня',
      value: (stats.approvedToday.products + stats.approvedToday.users).toString(),
      icon: CheckCircleIcon,
      color: 'text-green-600',
      subtitle: `Товаров: ${stats.approvedToday.products}, Пользователей: ${stats.approvedToday.users}`
    }
  ]

  const quickActions = [
    {
      title: 'Модерация товаров',
      description: 'Проверка и одобрение товаров',
      icon: ExclamationTriangleIcon,
      href: '/moderation/products',
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      title: 'Модерация пользователей',
      description: 'Проверка и одобрение пользователей',
      icon: ExclamationTriangleIcon,
      href: '/moderation/users',
      color: 'bg-blue-500 hover:bg-blue-600'
    }
  ]

  const handleQuickAction = (href: string) => {
    router.push(href)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Заголовок */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Модерация</h1>
          <p className="text-gray-600 mt-1">Проверка товаров и пользователей</p>
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

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg p-4 shadow-sm border animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-24 mt-1"></div>
                </div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))
        ) : (
          statsCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    {stat.subtitle && (
                      <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                    )}
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Быстрые действия */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Быстрые действия</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <button
                key={index}
                onClick={() => handleQuickAction(action.href)}
                className={`${action.color} text-white p-4 rounded-lg text-left transition-all duration-200 transform hover:scale-105 cursor-pointer`}
              >
                <div className="flex items-center mb-2">
                  <Icon className="h-6 w-6 mr-2" />
                  <h3 className="font-semibold">{action.title}</h3>
                </div>
                <p className="text-sm opacity-90">{action.description}</p>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function ModerationPage() {
  return (
    <MainLayout>
      <ModerationContent />
    </MainLayout>
  )
}

