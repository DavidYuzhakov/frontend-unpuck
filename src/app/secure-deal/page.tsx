'use client'

import { MainLayout } from '@/components/layouts/main-layout'
import { ArrowLeftIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, LockClosedIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface SecurityFeature {
  id: string
  title: string
  description: string
  icon: any
  status: 'active' | 'inactive' | 'pending'
}

const securityFeatures: SecurityFeature[] = [
  {
    id: 'escrow',
    title: 'Эскроу-сервис',
    description: 'Деньги замораживаются до подтверждения получения товара',
    icon: LockClosedIcon,
    status: 'active'
  },
  {
    id: 'verification',
    title: 'Верификация продавцов',
    description: 'Все продавцы проходят проверку документов',
    icon: ShieldCheckIcon,
    status: 'active'
  },
  {
    id: 'encryption',
    title: 'Шифрование данных',
    description: 'Все персональные данные защищены SSL-шифрованием',
    icon: LockClosedIcon,
    status: 'active'
  },
  {
    id: 'dispute',
    title: 'Система споров',
    description: 'Автоматическое разрешение конфликтов',
    icon: InformationCircleIcon,
    status: 'active'
  },
  {
    id: 'insurance',
    title: 'Страхование сделок',
    description: 'Защита от мошенничества до 100,000 ₽',
    icon: ShieldCheckIcon,
    status: 'pending'
  }
]

const securitySteps = [
  {
    step: 1,
    title: 'Покупатель размещает заказ',
    description: 'Выбирает товар и подтверждает покупку'
  },
  {
    step: 2,
    title: 'Деньги замораживаются',
    description: 'Средства блокируются на эскроу-счете'
  },
  {
    step: 3,
    title: 'Продавец отправляет товар',
    description: 'Товар отправляется с трек-номером'
  },
  {
    step: 4,
    title: 'Покупатель получает товар',
    description: 'Подтверждает получение и качество'
  },
  {
    step: 5,
    title: 'Деньги переводятся продавцу',
    description: 'Средства разблокируются после подтверждения'
  }
]

const securityStats = {
  totalDeals: 125000,
  successRate: 99.7,
  protectedAmount: 2500000000,
  averageResolutionTime: 24
}

export default function SecureDealPage() {
  const router = useRouter()
  const [activeFeature, setActiveFeature] = useState<string | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100'
      case 'inactive':
        return 'text-red-600 bg-red-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Активно'
      case 'inactive':
        return 'Неактивно'
      case 'pending':
        return 'В разработке'
      default:
        return status
    }
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-white">
        {/* Заголовок */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center space-x-3">
            <button onClick={() => router.back()} className="p-1 -ml-1">
              <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Безопасная сделка</h1>
          </div>
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Заголовок с описанием */}
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheckIcon className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Защищенные сделки</h2>
            <p className="text-gray-600">
              Мы гарантируем безопасность каждой сделки с помощью современных технологий защиты
            </p>
          </div>

          {/* Статистика безопасности */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">Статистика безопасности</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{securityStats.totalDeals.toLocaleString()}</p>
                <p className="text-green-100 text-sm">Защищенных сделок</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{securityStats.successRate}%</p>
                <p className="text-green-100 text-sm">Успешных сделок</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">₽ {(securityStats.protectedAmount / 1000000000).toFixed(1)}Б</p>
                <p className="text-green-100 text-sm">Защищено средств</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{securityStats.averageResolutionTime}ч</p>
                <p className="text-green-100 text-sm">Среднее время решения споров</p>
              </div>
            </div>
          </div>

          {/* Как это работает */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Как работает защита</h3>
            <div className="space-y-4">
              {securitySteps.map((step, index) => (
                <div key={step.step} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-sm">{step.step}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{step.title}</h4>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Функции безопасности */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Функции безопасности</h3>
            </div>
            
            <div className="divide-y divide-gray-200">
              {securityFeatures.map((feature) => {
                const Icon = feature.icon
                return (
                  <div key={feature.id} className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${getStatusColor(feature.status)}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium text-gray-900">{feature.title}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(feature.status)}`}>
                            {getStatusText(feature.status)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Гарантии */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-3">Наши гарантии</h4>
            <ul className="text-sm text-blue-800 space-y-2">
              <li className="flex items-start space-x-2">
                <CheckCircleIcon className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>100% возврат средств при мошенничестве</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircleIcon className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Круглосуточная поддержка по спорам</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircleIcon className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Страхование сделок до 100,000 ₽</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircleIcon className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Автоматическое разрешение споров</span>
              </li>
            </ul>
          </div>

          {/* Предупреждения */}
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-yellow-900 mb-2">Важно помнить</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Никогда не переводите деньги напрямую продавцу</li>
                  <li>• Всегда используйте защищенную систему оплаты</li>
                  <li>• Проверяйте рейтинг и отзывы продавца</li>
                  <li>• Сохраняйте все документы о сделке</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="space-y-3">
            <button className="w-full py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
              Создать защищенную сделку
            </button>
            
            <button className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">
              Узнать больше о безопасности
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
