'use client'

import { MainLayout } from '@/components/layouts/main-layout'
import { ArrowLeftIcon, ExclamationTriangleIcon, HomeIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    // Логируем ошибку для отладки
    console.error('Application error:', error)
  }, [error])

  const handleGoBack = () => {
    router.back()
  }

  const handleGoHome = () => {
    router.push('/')
  }

  const handleRetry = () => {
    reset()
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          {/* Иконка ошибки */}
          <div className="mb-8">
            <div className="relative">
              <ExclamationTriangleIcon className="h-24 w-24 text-red-500 mx-auto" />
              <div className="absolute -top-2 -right-2 text-4xl">⚠️</div>
            </div>
          </div>

          {/* Заголовок */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Произошла ошибка
          </h1>

          {/* Описание */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            Что-то пошло не так при загрузке страницы. 
            Попробуйте обновить страницу или вернуться назад.
          </p>

          {/* Кнопки действий */}
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
            >
              <span>🔄</span>
              <span>Попробовать снова</span>
            </button>

            <button
              onClick={handleGoBack}
              className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span>Вернуться назад</span>
            </button>

            <button
              onClick={handleGoHome}
              className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
            >
              <HomeIcon className="h-5 w-5" />
              <span>На главную</span>
            </button>
          </div>

          {/* Дополнительная информация */}
          <div className="mt-8 p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-red-600">
              Если ошибка повторяется, обратитесь в службу поддержки
            </p>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-2">
                <summary className="text-xs text-red-500 cursor-pointer">
                  Детали ошибки (только для разработки)
                </summary>
                <pre className="text-xs text-red-500 mt-2 text-left overflow-auto">
                  {error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}




