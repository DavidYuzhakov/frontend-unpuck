'use client'

import { MainLayout } from '@/components/layouts/main-layout'
import { ArrowLeftIcon, HomeIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()

  const handleGoBack = () => {
    router.back()
  }

  const handleGoHome = () => {
    router.push('/')
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          {/* Иконка 404 */}
          <div className="mb-8">
            <div className="relative">
              <div className="text-8xl font-bold text-gray-200 select-none">404</div>
              <div className="absolute -top-2 -right-2 text-4xl">😵</div>
            </div>
          </div>

          {/* Заголовок */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Страница не найдена
          </h1>

          {/* Описание */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            К сожалению, запрашиваемая страница не существует или была перемещена. 
            Проверьте правильность адреса или вернитесь на главную страницу.
          </p>

          {/* Кнопки действий */}
          <div className="space-y-3">
            <button
              onClick={handleGoBack}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
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
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">
              Если проблема повторяется, обратитесь в службу поддержки
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}




