'use client'

import { MainLayout } from '@/components/layouts/main-layout'
import { campaignsAPI } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import {
  ArrowLeftIcon,
  MegaphoneIcon,
  PauseIcon,
  PencilIcon,
  PlayIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Campaign {
  id: string
  title: string
  description: string
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

export default function CampaignsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  const loadCampaigns = async () => {
    try {
      setLoading(true)
      const response = await campaignsAPI.getMyCampaigns({})
      setCampaigns(response.data || [])
    } catch (error) {
      console.error('Ошибка загрузки кампаний:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCampaigns()
  }, [])

  const handleStartCampaign = async (campaignId: string) => {
    try {
      await campaignsAPI.startCampaign(campaignId)
      await loadCampaigns()
    } catch (error) {
      console.error('Ошибка запуска компании:', error)
      alert('Ошибка запуска компании')
    }
  }

  const handlePauseCampaign = async (campaignId: string) => {
    try {
      await campaignsAPI.pauseCampaign(campaignId)
      await loadCampaigns()
    } catch (error) {
      console.error('Ошибка паузы компании:', error)
      alert('Ошибка паузы компании')
    }
  }

  const handleDeleteCampaign = async (campaignId: string) => {
    if (confirm('Вы уверены, что хотите удалить эту компанию?')) {
      try {
        await campaignsAPI.deleteCampaign(campaignId)
        await loadCampaigns()
      } catch (error) {
        console.error('Ошибка удаления компании:', error)
        alert('Ошибка удаления компании')
      }
    }
  }

  const handleEditCampaign = (campaignId: string) => {
    router.push(`/campaigns/edit/${campaignId}`)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'PAUSED':
        return 'bg-yellow-100 text-yellow-800'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800'
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Активна'
      case 'PAUSED':
        return 'Приостановлена'
      case 'COMPLETED':
        return 'Завершена'
      case 'DRAFT':
        return 'Черновик'
      default:
        return status
    }
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 p-4">
        {/* Заголовок */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Мои компании</h1>
            </div>
            <button
              onClick={() => router.push('/campaigns/create')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <MegaphoneIcon className="h-4 w-4 mr-2" />
              Создать компанию
            </button>
          </div>
          <p className="text-gray-600">
            Управляйте своими рекламными кампаниями
          </p>
        </div>

        {/* Список кампаний */}
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Загрузка кампаний...</p>
            </div>
          ) : campaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {campaign.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {campaign.description}
                      </p>
                      <div className="flex items-center space-x-2 mb-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            campaign.status
                          )}`}
                        >
                          {getStatusText(campaign.status)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {campaign.type === 'product' ? 'Товар' : 'Канал'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Бюджет:</span>
                      <span className="font-medium">
                        {formatCurrency(Number(campaign.budget))}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Цена за клик:</span>
                      <span className="font-medium">
                        {formatCurrency(Number(campaign.pricePerClick))}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Клики:</span>
                      <span className="font-medium">
                        {campaign.clicksCount}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Заработано:</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(
                          campaign.clicksCount * Number(campaign.pricePerClick)
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Кнопки управления */}
                  <div className="flex space-x-2">
                    {campaign.status === 'ACTIVE' ? (
                      <button
                        onClick={() => handlePauseCampaign(campaign.id)}
                        className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded text-sm transition-colors flex items-center justify-center"
                      >
                        <PauseIcon className="h-4 w-4 mr-1" />
                        Пауза
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStartCampaign(campaign.id)}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm transition-colors flex items-center justify-center"
                      >
                        <PlayIcon className="h-4 w-4 mr-1" />
                        Запустить
                      </button>
                    )}
                    <button
                      onClick={() => handleEditCampaign(campaign.id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm transition-colors"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCampaign(campaign.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
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
                onClick={() => router.push('/campaigns/create')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Создать компанию
              </button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
