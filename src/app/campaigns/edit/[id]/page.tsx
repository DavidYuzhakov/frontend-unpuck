'use client'

import { MainLayout } from '@/components/layouts/main-layout'
import { campaignsAPI } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { ArrowLeftIcon, MegaphoneIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface EditCampaignData {
  title: string
  description: string
  type: 'product' | 'channel'
  budget: number
  pricePerClick: number
  maxClicks?: number
  startDate?: string
  endDate?: string
  productId?: string
  channelId?: string
}

export default function EditCampaignPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [loadingCampaign, setLoadingCampaign] = useState(true)
  const [formData, setFormData] = useState<EditCampaignData>({
    title: '',
    description: '',
    type: 'product',
    budget: 0,
    pricePerClick: 0,
    maxClicks: undefined,
    startDate: '',
    endDate: '',
    productId: '',
    channelId: '',
  })

  // Загружаем данные компании
  useEffect(() => {
    const loadCampaign = async () => {
      try {
        setLoadingCampaign(true)
        const response = await campaignsAPI.getCampaign(params.id)
        const campaign = response.data

        setFormData({
          title: campaign.title || '',
          description: campaign.description || '',
          type: campaign.type || 'product',
          budget: Number(campaign.budget) || 0,
          pricePerClick: Number(campaign.pricePerClick) || 0,
          maxClicks: campaign.maxClicks
            ? Number(campaign.maxClicks)
            : undefined,
          startDate: campaign.startDate
            ? new Date(campaign.startDate).toISOString().slice(0, 16)
            : '',
          endDate: campaign.endDate
            ? new Date(campaign.endDate).toISOString().slice(0, 16)
            : '',
          productId: campaign.productId || '',
          channelId: campaign.channelId || '',
        })
      } catch (error) {
        console.error('Ошибка загрузки компании:', error)
        alert('Ошибка загрузки компании')
        router.push('/blogger')
      } finally {
        setLoadingCampaign(false)
      }
    }

    loadCampaign()
  }, [params.id, router])

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'budget' || name === 'pricePerClick' || name === 'maxClicks'
          ? parseFloat(value) || 0
          : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.budget || !formData.pricePerClick) {
      alert('Пожалуйста, заполните все обязательные поля')
      return
    }

    try {
      setLoading(true)
      console.log('✏️ Редактируем компанию с данными:', formData)
      console.log('🆔 ID компании:', params.id)

      // Очищаем пустые строки для полей, которые должны быть null
      const cleanedData = {
        ...formData,
        productId: formData.productId === '' ? undefined : formData.productId,
        channelId: formData.channelId === '' ? undefined : formData.channelId,
        maxClicks: formData.maxClicks || undefined,
        startDate: formData.startDate === '' ? undefined : formData.startDate,
        endDate: formData.endDate === '' ? undefined : formData.endDate,
      }

      console.log('🧹 Очищенные данные для отправки:', cleanedData)

      const response = await campaignsAPI.updateCampaign(params.id, cleanedData)
      console.log('✅ Кампания отредактирована успешно:', response)

      // Показываем уведомление об успехе
      alert('Кампания успешно обновлена!')

      router.push('/blogger')
    } catch (error: any) {
      console.error('❌ Ошибка редактирования компании:', error)
      console.error('❌ Детали ошибки:', error.response?.data || error.message)
      console.error('❌ Статус ошибки:', error.response?.status)

      const errorMessage =
        error.response?.data?.message || error.message || 'Неизвестная ошибка'
      alert(`Ошибка редактирования компании: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  if (loadingCampaign) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка компании...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 p-4">
        {/* Заголовок */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              Редактировать компанию
            </h1>
          </div>
          <p className="text-gray-600">Измените параметры рекламной компании</p>
        </div>

        {/* Форма */}
        <div className="max-w-2xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow-sm border p-6"
          >
            <div className="space-y-6">
              {/* Название компании */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Название компании *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Введите название компании"
                  required
                />
              </div>

              {/* Описание */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Описание
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Опишите цель и особенности компании"
                />
              </div>

              {/* Тип компании */}
              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Тип компании *
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="product">Товар</option>
                  <option value="channel">Канал</option>
                </select>
              </div>

              {/* Бюджет */}
              <div>
                <label
                  htmlFor="budget"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Бюджет (₽) *
                </label>
                <input
                  type="number"
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>

              {/* Цена за клик */}
              <div>
                <label
                  htmlFor="pricePerClick"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Цена за клик (₽) *
                </label>
                <input
                  type="number"
                  id="pricePerClick"
                  name="pricePerClick"
                  value={formData.pricePerClick}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>

              {/* Максимальное количество кликов */}
              <div>
                <label
                  htmlFor="maxClicks"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Максимальное количество кликов
                </label>
                <input
                  type="number"
                  id="maxClicks"
                  name="maxClicks"
                  value={formData.maxClicks || ''}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Не ограничено"
                />
              </div>

              {/* Даты */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="startDate"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Дата начала
                  </label>
                  <input
                    type="datetime-local"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="endDate"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Дата окончания
                  </label>
                  <input
                    type="datetime-local"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Кнопки */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Сохранение...
                    </>
                  ) : (
                    <>
                      <MegaphoneIcon className="h-4 w-4 mr-2" />
                      Сохранить изменения
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  )
}
