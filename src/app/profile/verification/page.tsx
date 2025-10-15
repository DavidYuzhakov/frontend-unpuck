'use client'

import { MainLayout } from '@/components/layouts/main-layout'
import { profileAPI } from '@/lib/api'
import { ArrowLeftIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useEffect, useState } from 'react'
// toast removed

interface VerificationStatus {
  status: 'pending' | 'approved' | 'rejected' | 'not_submitted'
  documentType?: 'passport' | 'driver_license' | 'id_card'
  documentNumber?: string
  submittedAt?: string
  reviewedAt?: string
  rejectionReason?: string
}

export default function VerificationPage() {
  const [verification, setVerification] = useState<VerificationStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showSubmitForm, setShowSubmitForm] = useState(false)
  const [formData, setFormData] = useState({
    documentType: 'passport' as 'passport' | 'driver_license' | 'id_card',
    documentNumber: '',
    documentImages: [] as string[]
  })

  useEffect(() => {
    loadVerificationStatus()
  }, [])

  const loadVerificationStatus = async () => {
    try {
      setIsLoading(true)
      const response = await profileAPI.getVerificationStatus()
      if (response.data) {
        setVerification(response.data.data || response.data)
      }
    } catch (error: any) {
      console.error('Ошибка загрузки статуса верификации:', error)
      // Используем моковые данные
      setVerification({
        status: 'not_submitted'
      })
      console.error('❌ Не удалось загрузить статус верификации. Показаны демонстрационные данные.')
    } finally {
      setIsLoading(false)
    }
  }


  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await profileAPI.submitVerification(formData)
      if (response.data) {
        setVerification(response.data.data || response.data)
        setShowSubmitForm(false)
        console.log('✅ Документы отправлены на проверку!')
      }
    } catch (error: any) {
      console.error('Ошибка отправки документов:', error)
      console.error('❌ Не удалось отправить документы')
    }
  }


  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className="h-8 w-8 text-green-500" />
      case 'rejected':
        return <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
      case 'pending':
        return <div className="h-8 w-8 rounded-full bg-yellow-500 flex items-center justify-center">
          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      default:
        return <div className="h-8 w-8 rounded-full bg-gray-300"></div>
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Верификация пройдена'
      case 'rejected':
        return 'Верификация отклонена'
      case 'pending':
        return 'На проверке'
      default:
        return 'Не пройдена'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-50'
      case 'rejected':
        return 'text-red-600 bg-red-50'
      case 'pending':
        return 'text-yellow-600 bg-yellow-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'passport':
        return 'Паспорт'
      case 'driver_license':
        return 'Водительские права'
      case 'id_card':
        return 'Удостоверение личности'
      default:
        return type
    }
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center space-x-4">
            <Link 
              href="/profile"
              className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Верификация</h1>
          </div>
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-4">
              {getStatusIcon(verification?.status || 'not_submitted')}
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {getStatusText(verification?.status || 'not_submitted')}
                </h3>
                {verification?.documentType && (
                  <p className="text-sm text-gray-500">
                    {getDocumentTypeLabel(verification.documentType)} •••• {verification.documentNumber?.slice(-4)}
                  </p>
                )}
              </div>
            </div>

            {verification?.status === 'rejected' && verification.rejectionReason && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Причина отклонения:</strong> {verification.rejectionReason}
                </p>
              </div>
            )}

            {verification?.submittedAt && (
              <p className="mt-2 text-sm text-gray-500">
                Отправлено: {new Date(verification.submittedAt).toLocaleDateString('ru-RU')}
              </p>
            )}
          </div>

          {/* Telegram Verification Info */}
          {!showSubmitForm && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16l-1.61 7.59c-.12.56-.44.7-.9.44l-2.49-1.84-1.2 1.16c-.13.13-.24.24-.49.24l.18-2.56 4.64-4.19c.2-.18-.04-.28-.31-.1l-5.74 3.61-2.47-.77c-.54-.17-.55-.54.11-.8l9.64-3.72c.45-.17.84.1.7.8z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Верификация через Telegram-бота
                </h3>
                <p className="text-gray-600 mb-4">
                  Для прохождения верификации выполните следующие шаги:
                </p>
                
                <div className="text-left space-y-3 mb-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">1</div>
                    <p className="text-sm text-gray-700">
                      Перейдите в нашего Telegram-бота: <span className="font-semibold text-blue-600">@unpacker_bot</span>
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">2</div>
                    <p className="text-sm text-gray-700">
                      Нажмите кнопку <span className="font-semibold bg-green-100 text-green-800 px-2 py-1 rounded">СТАРТ</span> в боте
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">3</div>
                    <p className="text-sm text-gray-700">
                      Поделитесь номером телефона с ботом (нажмите кнопку "Поделиться номером")
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">4</div>
                    <p className="text-sm text-gray-700">
                      Вернитесь на эту страницу - верификация будет пройдена автоматически!
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <a
                    href="https://t.me/unpacker_bot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16l-1.61 7.59c-.12.56-.44.7-.9.44l-2.49-1.84-1.2 1.16c-.13.13-.24.24-.49.24l.18-2.56 4.64-4.19c.2-.18-.04-.28-.31-.1l-5.74 3.61-2.47-.77c-.54-.17-.55-.54.11-.8l9.64-3.72c.45-.17.84.1.7.8z"/>
                    </svg>
                    Перейти в @unpacker_bot
                  </a>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">!</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-yellow-800 font-medium mb-1">Важно!</p>
                        <p className="text-sm text-yellow-700">
                          После выполнения всех шагов в боте, статус верификации обновится автоматически.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  
                  <button
                    onClick={() => setShowSubmitForm(true)}
                    className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                  >
                    Альтернативно: загрузить документы
                  </button>
                </div>
              </div>
            </div>
          )}

          {verification?.status === 'rejected' && (
            <button
              onClick={() => setShowSubmitForm(true)}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Отправить повторно
            </button>
          )}

          {showSubmitForm && (
            <form onSubmit={handleSubmitVerification} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Отправить документы</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тип документа
                </label>
                <select
                  value={formData.documentType}
                  onChange={(e) => setFormData(prev => ({ ...prev, documentType: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="passport">Паспорт</option>
                  <option value="driver_license">Водительские права</option>
                  <option value="id_card">Удостоверение личности</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Номер документа
                </label>
                <input
                  type="text"
                  value={formData.documentNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, documentNumber: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1234 567890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Фотографии документа
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <p className="text-gray-500">Загрузите фотографии документа</p>
                  <p className="text-sm text-gray-400 mt-1">Поддерживаются форматы: JPG, PNG, PDF</p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Требования к фотографиям:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Документ должен быть четко виден</li>
                  <li>• Все углы документа должны быть в кадре</li>
                  <li>• Фотография должна быть в хорошем качестве</li>
                  <li>• Документ должен быть действительным</li>
                </ul>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Отправить на проверку
                </button>
                <button
                  type="button"
                  onClick={() => setShowSubmitForm(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Отмена
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </MainLayout>
  )
}