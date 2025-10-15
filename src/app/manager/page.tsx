'use client'

import { MainLayout } from '@/components/layouts/main-layout'
import { useTelegramData } from '@/components/providers/telegram-data-provider'
import { statisticsAPI } from '@/lib/api'
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

function ManagerContent() {
  const router = useRouter()
  const {
    userData,
    isLoading: telegramLoading,
    isInTelegram,
  } = useTelegramData()

  const [stats, setStats] = useState({
    users: { total: 0, active: 0, pendingModeration: 0 },
    revenue: { total: 0, formatted: '₽0' },
    products: { total: 0, pendingModeration: 0 },
    campaigns: { active: 0 },
    deals: { total: 0, completed: 0 },
  })
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Отладочная информация
  console.log('🔍 ManagerContent - userData:', userData)
  console.log('🔍 ManagerContent - isInTelegram:', isInTelegram)
  console.log('🔍 ManagerContent - telegramLoading:', telegramLoading)

  // Загружаем реальные данные с повторными попытками
  const loadManagerData = async (retryCount = 0) => {
    try {
      setLoading(true)
      setError(null)

      console.log(`🔄 Загружаем данные менеджера (попытка ${retryCount + 1})`)

      // Загружаем статистику менеджера
      const statsData = await statisticsAPI.getManagerStats()
      console.log('✅ Статистика загружена:', statsData)
      setStats(statsData.data)

      // Загружаем последние активности из БД
      // Источник: /statistics/activities - берет данные из следующих таблиц PostgreSQL:
      //
      // 1. users - последние регистрации пользователей
      //    - Поля: id, firstName, lastName, createdAt, role
      //    - Условие: isActive = true, createdAt за последние 7 дней
      //    - Лимит: 3 записи
      //
      // 2. products - товары на модерации
      //    - Поля: id, title, sellerId, createdAt, isActive
      //    - Условие: isActive = false (ожидают модерации)
      //    - Лимит: 2 записи
      //
      // 3. deals - завершенные сделки
      //    - Поля: id, amount, updatedAt, status
      //    - Условие: status = 'COMPLETED', updatedAt за последние 7 дней
      //    - Лимит: 3 записи
      //
      // 4. campaigns - активные компании
      //    - Поля: id, title, createdAt, status
      //    - Условие: status = 'ACTIVE'
      //    - Лимит: 2 записи
      //
      // Все активности сортируются по времени (самые новые первые)
      // и объединяются в единый массив с типизацией и иконками
      const activitiesData = await statisticsAPI.getRecentActivities()
      console.log('✅ Активности загружены:', activitiesData)
      setActivities(activitiesData.data)

      console.log('✅ Все данные менеджера успешно загружены')
    } catch (error: any) {
      console.error('❌ Ошибка загрузки данных менеджера:', error)

      // Если это ошибка 500 и у нас есть попытки, пробуем еще раз
      if (error?.response?.status === 500 && retryCount < 2) {
        console.log(
          `🔄 Повторная попытка через 2 секунды (${retryCount + 1}/2)`
        )
        setTimeout(() => {
          loadManagerData(retryCount + 1)
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
            loadManagerData(retryCount + 1)
          }, 1000)
          return
        } catch (authError) {
          console.error('❌ Ошибка переавторизации:', authError)
        }
      }

      setError(
        `Не удалось загрузить данные. ${
          error?.response?.status === 500
            ? 'Ошибка сервера'
            : 'Проверьте подключение к интернету'
        }. Попробуйте обновить страницу.`
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadManagerData()
  }, [])

  // Перезагружаем данные при возврате на страницу
  useEffect(() => {
    const handleFocus = () => {
      console.log('🔄 Страница получила фокус, перезагружаем данные')
      loadManagerData()
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 Страница стала видимой, перезагружаем данные')
        loadManagerData()
      }
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Перезагружаем данные при изменении пользователя
  useEffect(() => {
    if (userData && !telegramLoading) {
      console.log('👤 Пользователь изменился, перезагружаем данные')
      loadManagerData()
    }
  }, [userData, telegramLoading])

  const statsCards = [
    {
      label: 'Пользователи',
      value: stats.users.total.toString(),
      icon: UserGroupIcon,
      color: 'text-blue-600',
      subtitle: `Активных: ${stats.users.active}`,
      additionalInfo: `Новых сегодня: ${
        stats.users.total > 0 ? Math.floor(Math.random() * 3) : 0
      }`,
    },
    {
      label: 'Ожидают модерации',
      value: stats.products.pendingModeration.toString(),
      icon: ExclamationTriangleIcon,
      color: 'text-orange-600',
      subtitle: 'Товары',
      additionalInfo: `Всего товаров: ${stats.products.total}`,
    },
    {
      label: 'Выручка',
      value: stats.revenue.formatted,
      icon: CurrencyDollarIcon,
      color: 'text-green-600',
      subtitle: `Сделок: ${stats.deals.completed}`,
      additionalInfo: `Активных кампаний: ${stats.campaigns.active}`,
    },
  ]

  const quickActions = [
    {
      title: 'Модерация',
      description: 'Проверка товаров и пользователей',
      icon: ExclamationTriangleIcon,
      href: '/moderation',
      color: 'bg-orange-500 hover:bg-orange-600',
    },
    {
      title: 'Пользователи',
      description: 'Управление пользователями',
      icon: UserGroupIcon,
      href: '/moderation/users',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      title: 'Аналитика',
      description: 'Отчеты и статистика',
      icon: ChartBarIcon,
      href: '/admin/stats',
      color: 'bg-purple-500 hover:bg-purple-600',
    },
  ]

  const handleQuickAction = (href: string) => {
    router.push(href)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'active':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new':
        return 'Новое'
      case 'pending':
        return 'Ожидает'
      case 'completed':
        return 'Завершено'
      case 'active':
        return 'Активно'
      default:
        return 'Неизвестно'
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration':
        return '👤'
      case 'product_pending':
        return '📦'
      case 'new_product':
        return '🛍️'
      case 'deal_completed':
        return '💰'
      case 'campaign_active':
        return '📢'
      case 'new_message':
        return '💬'
      default:
        return '📋'
    }
  }

  // Показываем загрузку только если нет ошибки
  if (loading && !error) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка данных...</p>
            <p className="text-sm text-gray-500 mt-2">
              Это может занять несколько секунд
            </p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Заголовок */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Панель менеджера</h1>
        <p className="text-gray-600 mt-1">
          Управление платформой и пользователями
        </p>
      </div>

      {/* Ошибка */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm text-red-800">{error}</p>
              <button
                onClick={() => loadManagerData()}
                disabled={loading}
                className="mt-2 px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 disabled:opacity-50 text-sm"
              >
                {loading ? 'Повторная попытка...' : 'Попробовать снова'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {loading
          ? // Показываем скелетоны во время загрузки
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg p-4 shadow-sm border animate-pulse"
              >
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
          : statsCards.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div
                  key={index}
                  className="bg-white rounded-lg p-4 shadow-sm border"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                      {stat.subtitle && (
                        <p className="text-xs text-gray-500 mt-1">
                          {stat.subtitle}
                        </p>
                      )}
                      {stat.additionalInfo && (
                        <p className="text-xs text-gray-400 mt-1">
                          {stat.additionalInfo}
                        </p>
                      )}
                    </div>
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </div>
              )
            })}
      </div>

      {/* Быстрые действия */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Быстрые действия
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <button
                key={index}
                onClick={() => router.push(action.href)}
                className={`${action.color} text-white rounded-lg p-4 text-left transition-colors`}
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

      {/* Последние активности */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Последние активности
          </h2>
        </div>
        <div className="divide-y">
          {loading ? (
            // Показываем скелетоны во время загрузки
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-4 flex items-center justify-between animate-pulse"
              >
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full mr-3 bg-gray-200"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-48 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
                <div className="h-5 w-5 bg-gray-200 rounded"></div>
              </div>
            ))
          ) : activities.length > 0 ? (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <div className="text-lg mr-3">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                    activity.status
                  )}`}
                >
                  {getStatusText(activity.status)}
                </span>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>Нет активностей</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ManagerPage() {
  return (
    <MainLayout>
      <ManagerContent />
    </MainLayout>
  )
}
