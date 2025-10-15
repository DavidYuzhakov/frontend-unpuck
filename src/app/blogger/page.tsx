'use client'

import { MainLayout } from '@/components/layouts/main-layout'
import { useTelegramData } from '@/components/providers/telegram-data-provider'
import { campaignsAPI } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import {
  CurrencyDollarIcon,
  EyeIcon,
  MegaphoneIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Campaign {
  id: string
  title: string
  description?: string
  type: 'product' | 'channel'
  budget: number
  pricePerClick: number
  maxClicks?: number
  clicksCount: number
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'
  startDate?: string
  endDate?: string
  productId?: string
  channelId?: string
  advertiserId: string
  createdAt: string
  updatedAt: string
}

interface BloggerStats {
  activeCampaigns: number
  totalEarned: number
  totalViews: number
}

function BloggerContent() {
  const router = useRouter()
  const { user } = useAuthStore()
  const {
    userData,
    isLoading: telegramLoading,
    isInTelegram,
  } = useTelegramData()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [stats, setStats] = useState<BloggerStats>({
    activeCampaigns: 0,
    totalEarned: 0,
    totalViews: 0,
  })
  const [loading, setLoading] = useState(true)

  // Отладочная информация
  console.log('🔍 BloggerContent - userData:', userData)
  console.log('🔍 BloggerContent - isInTelegram:', isInTelegram)
  console.log('🔍 BloggerContent - telegramLoading:', telegramLoading)

  // Загружаем данные блогера из БД
  useEffect(() => {
    const loadBloggerData = async () => {
      try {
        setLoading(true)

        // Получаем ID пользователя из Telegram
        const userId = user?.id
        if (!userId) {
          console.error('ID пользователя не найден')
          return
        }

        console.log('📊 Загружаем данные блогера для ID:', userId)

        // Загружаем статистику пользователя из БД
        console.log('📊 Загружаем компании для пользователя:', userId)

        // Загружаем компании напрямую из БД через API
        let campaignsData: Campaign[] = []

        try {
          const campaignsResponse = await campaignsAPI.getMyCampaigns({})

          console.log('📊 Ответ API кампаний:', campaignsResponse.data)

          campaignsData = campaignsResponse.data || []

          // Убеждаемся, что campaignsData является массивом
          if (!Array.isArray(campaignsData)) {
            console.warn(
              '⚠️ campaignsData не является массивом:',
              campaignsData
            )
            campaignsData = []
          }

          setCampaigns(campaignsData)
        } catch (apiError: any) {
          console.warn('⚠️ API кампаний недоступен:', apiError.message)
          campaignsData = []
          setCampaigns(campaignsData)
        }

        // Статистика только из реальных данных
        const activeCampaigns = campaignsData.filter(
          (campaign: Campaign) => campaign.status === 'ACTIVE'
        ).length
        const totalEarned = campaignsData.reduce(
          (sum: number, campaign: Campaign) =>
            sum + Number(campaign.clicksCount) * Number(campaign.pricePerClick),
          0
        )
        const totalViews = campaignsData.reduce(
          (sum: number, campaign: Campaign) =>
            sum + Number(campaign.clicksCount),
          0
        )

        setStats({
          activeCampaigns,
          totalEarned,
          totalViews,
        })

        console.log('📊 Статистика блогера загружена из БД:', {
          activeCampaigns,
          totalEarned,
          totalViews,
          userId,
          campaignsCount: campaignsData.length,
        })
      } catch (error) {
        console.error('❌ Ошибка загрузки данных блогера:', error)
        // Устанавливаем значения по умолчанию при ошибке
        setStats({
          activeCampaigns: 0,
          totalEarned: 0,
          totalViews: 0,
        })
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) {
      loadBloggerData()
    }
  }, [user?.id])

  const handleCreateCampaign = () => {
    router.push('/campaigns/create')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  // Функция для перезагрузки данных
  const loadBloggerData = async () => {
    try {
      setLoading(true)

      const userId = user?.id
      if (!userId) {
        console.error('ID пользователя не найден')
        return
      }

      console.log('📊 Загружаем данные блогера для ID:', userId)

      let campaignsData: Campaign[] = []

      try {
        const campaignsResponse = await campaignsAPI.getMyCampaigns({})
        console.log('📊 Ответ API кампаний:', campaignsResponse.data)

        campaignsData = campaignsResponse.data || []

        if (!Array.isArray(campaignsData)) {
          console.warn('⚠️ campaignsData не является массивом:', campaignsData)
          campaignsData = []
        }

        setCampaigns(campaignsData)
      } catch (apiError: any) {
        console.warn('⚠️ API кампаний недоступен:', apiError.message)
        campaignsData = []
        setCampaigns(campaignsData)
      }

      const activeCampaigns = campaignsData.filter(
        (campaign: Campaign) => campaign.status === 'ACTIVE'
      ).length
      const totalEarned = campaignsData.reduce(
        (sum: number, campaign: Campaign) =>
          sum + Number(campaign.clicksCount) * Number(campaign.pricePerClick),
        0
      )
      const totalViews = campaignsData.reduce(
        (sum: number, campaign: Campaign) => sum + Number(campaign.clicksCount),
        0
      )

      setStats({
        activeCampaigns,
        totalEarned,
        totalViews,
      })

      console.log('📊 Статистика блогера загружена из БД:', {
        activeCampaigns,
        totalEarned,
        totalViews,
        userId,
        campaignsCount: campaignsData.length,
      })
    } catch (error) {
      console.error('❌ Ошибка загрузки данных блогера:', error)
      setStats({
        activeCampaigns: 0,
        totalEarned: 0,
        totalViews: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  // Функции управления кампаниями
  const handleStartCampaign = async (campaignId: string) => {
    try {
      console.log('▶️ Запускаем компанию:', campaignId)
      await campaignsAPI.startCampaign(campaignId)
      console.log('✅ Кампания запущена успешно')

      // Обновляем статус компании локально
      setCampaigns((prev) =>
        prev.map((campaign) =>
          campaign.id === campaignId
            ? { ...campaign, status: 'ACTIVE' as const }
            : campaign
        )
      )

      // Перезагружаем данные для обновления статистики
      await loadBloggerData()

      alert('Кампания успешно запущена!')
    } catch (error) {
      console.error('Ошибка запуска компании:', error)
      alert('Ошибка запуска компании')
    }
  }

  const handlePauseCampaign = async (campaignId: string) => {
    try {
      console.log('⏸️ Приостанавливаем компанию:', campaignId)
      await campaignsAPI.pauseCampaign(campaignId)
      console.log('✅ Кампания приостановлена успешно')

      // Обновляем статус компании локально
      setCampaigns((prev) =>
        prev.map((campaign) =>
          campaign.id === campaignId
            ? { ...campaign, status: 'PAUSED' as const }
            : campaign
        )
      )

      // Перезагружаем данные для обновления статистики
      await loadBloggerData()

      alert('Кампания успешно приостановлена!')
    } catch (error) {
      console.error('Ошибка паузы компании:', error)
      alert('Ошибка паузы компании')
    }
  }

  const handleDeleteCampaign = async (campaignId: string) => {
    if (confirm('Вы уверены, что хотите удалить эту компанию?')) {
      try {
        console.log('🗑️ Удаляем компанию:', campaignId)
        await campaignsAPI.deleteCampaign(campaignId)
        console.log('✅ Кампания удалена успешно')

        // Обновляем список кампаний локально
        setCampaigns((prev) =>
          prev.filter((campaign) => campaign.id !== campaignId)
        )

        // Перезагружаем данные для обновления статистики
        await loadBloggerData()

        alert('Кампания успешно удалена!')
      } catch (error) {
        console.error('Ошибка удаления компании:', error)
        alert('Ошибка удаления компании')
      }
    }
  }

  const handleEditCampaign = (campaignId: string) => {
    router.push(`/campaigns/edit/${campaignId}`)
  }

  const quickActions = [
    {
      title: 'Создать компанию',
      description: 'Запустить рекламную компанию',
      icon: PlusIcon,
      onClick: handleCreateCampaign,
      color:
        'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Заголовок */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Панель блогера
          </h1>
          <p className="text-gray-600 text-lg">
            Добро пожаловать, {user?.firstName || 'Блогер'}! Управляйте
            рекламными кампаниями и заработком
          </p>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">
                Активные компании
              </p>
              <div className="text-3xl font-bold text-gray-900">
                {loading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
                ) : (
                  stats.activeCampaigns
                )}
              </div>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <MegaphoneIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">
                Заработано
              </p>
              <div className="text-3xl font-bold text-gray-900">
                {loading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
                ) : (
                  formatCurrency(stats.totalEarned)
                )}
              </div>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">
                Просмотры
              </p>
              <div className="text-3xl font-bold text-gray-900">
                {loading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                ) : (
                  formatNumber(stats.totalViews)
                )}
              </div>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <EyeIcon className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Быстрые действия */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Быстрые действия
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={`${action.color} text-white rounded-xl p-4 text-left transition-all duration-300 transform hover:scale-95 hover:shadow-xl group`}
                >
                  <div className="flex items-center">
                    <div className="bg-white bg-opacity-20 p-2 rounded-lg mr-3 group-hover:bg-opacity-30 transition-all duration-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{action.title}</h3>
                      <p className="text-sm opacity-90 leading-relaxed font-medium">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Мои компании */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Мои компании!
          </h2>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-20 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : campaigns.length > 0 ? (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-full">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {campaign.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {campaign.description}
                      </p>
                      <div className="flex flex-col gap-2 text-sm text-gray-500 mb-3">
                        <span>Бюджет: {formatCurrency(campaign.budget)}</span>
                        <span>Клики: {campaign.clicksCount}</span>
                        <span>
                          Статус:
                          <span
                            className={`ml-1 px-2 py-1 rounded-full text-xs ${
                              campaign.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-800'
                                : campaign.status === 'PAUSED'
                                ? 'bg-yellow-100 text-yellow-800'
                                : campaign.status === 'COMPLETED'
                                ? 'bg-blue-100 text-blue-800'
                                : campaign.status === 'DRAFT'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {campaign.status === 'ACTIVE'
                              ? 'Активна'
                              : campaign.status === 'PAUSED'
                              ? 'Приостановлена'
                              : campaign.status === 'COMPLETED'
                              ? 'Завершена'
                              : campaign.status === 'DRAFT'
                              ? 'Черновик'
                              : campaign.status}
                          </span>
                        </span>
                      </div>
                      <div className="flex flex-col gap-3 items-center flex-wrap w-full">
                        {campaign.status === 'DRAFT' && (
                          <button
                            onClick={() => handleStartCampaign(campaign.id)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors w-full"
                          >
                            Запустить
                          </button>
                        )}
                        {campaign.status === 'PAUSED' && (
                          <button
                            onClick={() => handleStartCampaign(campaign.id)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors w-full"
                          >
                            Запустить
                          </button>
                        )}
                        {campaign.status === 'ACTIVE' && (
                          <button
                            onClick={() => handlePauseCampaign(campaign.id)}
                            className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 transition-colors w-full"
                          >
                            Приостановить
                          </button>
                        )}
                        <button
                          onClick={() => handleEditCampaign(campaign.id)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors w-full"
                        >
                          Редактировать
                        </button>
                        <button
                          onClick={() => handleDeleteCampaign(campaign.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors w-full"
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(
                          campaign.clicksCount * campaign.pricePerClick
                        )}
                      </p>
                      <p className="text-sm text-gray-500">Заработано</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MegaphoneIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                У вас пока нет кампаний
              </h3>
              <p className="text-gray-500 mb-6">
                Создайте свою первую рекламную компанию
              </p>
              <button
                onClick={handleCreateCampaign}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Создать компанию
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function BloggerPage() {
  return (
    <MainLayout>
      <BloggerContent />
    </MainLayout>
  )
}
