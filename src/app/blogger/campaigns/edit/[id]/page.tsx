'use client'

import { MainLayout } from '@/components/layouts/main-layout'
import { campaignsAPI } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
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

interface EditCampaignPageProps {
  params: {
    id: string
  }
}

export default function EditCampaignPage({ params }: EditCampaignPageProps) {
  const router = useRouter()
  const { user } = useAuthStore()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: 0,
    pricePerClick: 0,
    maxClicks: 0,
    startDate: '',
    endDate: '',
  })

  useEffect(() => {
    const loadCampaign = async () => {
      try {
        setLoading(true)
        const response = await campaignsAPI.getCampaign(params.id)

        if (response.data) {
          const campaignData = response.data
          setCampaign(campaignData)
          setFormData({
            title: campaignData.title || '',
            description: campaignData.description || '',
            budget: campaignData.budget || 0,
            pricePerClick: campaignData.pricePerClick || 0,
            maxClicks: campaignData.maxClicks || 0,
            startDate: campaignData.startDate
              ? new Date(campaignData.startDate).toISOString().split('T')[0]
              : '',
            endDate: campaignData.endDate
              ? new Date(campaignData.endDate).toISOString().split('T')[0]
              : '',
          })
        }
      } catch (err: any) {
        console.error('Ошибка загрузки компании:', err)
        setError(err.response?.data?.message || 'Ошибка загрузки компании')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      loadCampaign()
    }
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!campaign) return

    try {
      setSaving(true)
      setError(null)

      const updateData = {
        title: formData.title,
        description: formData.description,
        budget: formData.budget,
        pricePerClick: formData.pricePerClick,
        maxClicks: formData.maxClicks,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
      }

      await campaignsAPI.updateCampaign(params.id, updateData)

      alert('Кампания успешно обновлена!')
      router.push('/blogger')
    } catch (err: any) {
      console.error('Ошибка обновления компании:', err)
      setError(err.response?.data?.message || 'Ошибка обновления компании')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        name.includes('budget') ||
        name.includes('pricePerClick') ||
        name.includes('maxClicks')
          ? parseFloat(value) || 0
          : value,
    }))
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка компании...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (error && !campaign) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => router.push('/blogger')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Вернуться к кампаниям
            </button>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-white">
        {/* Заголовок */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">
              Редактировать компанию
            </h1>
          </div>
        </div>

        <div className="px-4 py-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Основная информация */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Основная информация
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Название компании
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Описание
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Бюджет и настройки */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Бюджет и настройки
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Бюджет (₽)
                  </label>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Цена за клик (₽)
                  </label>
                  <input
                    type="number"
                    name="pricePerClick"
                    value={formData.pricePerClick}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Максимум кликов
                  </label>
                  <input
                    type="number"
                    name="maxClicks"
                    value={formData.maxClicks}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Даты */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Период проведения
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Дата начала
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Дата окончания
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Кнопки */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  )
}
