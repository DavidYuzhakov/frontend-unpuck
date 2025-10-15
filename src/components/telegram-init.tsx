'use client'

import { useEffect, useState } from 'react'

interface TelegramInitProps {
  children: React.ReactNode
}

export function TelegramInit({ children }: TelegramInitProps) {
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initTelegram = async () => {
      try {
        // Проверяем, что мы в браузере
        if (typeof window === 'undefined') {
          console.log('❌ Не в браузере')
          setIsReady(true)
          return
        }

        // Ждем загрузки Telegram WebApp с несколькими попытками
        let tg = window.Telegram?.WebApp
        let attempts = 0
        const maxAttempts = 20

        while (!tg && attempts < maxAttempts) {
          console.log(`🔄 Попытка ${attempts + 1}/${maxAttempts} инициализации TWA...`)
          await new Promise(resolve => setTimeout(resolve, 100))
          tg = window.Telegram?.WebApp
          attempts++
        }

        if (!tg) {
          console.log('❌ Telegram WebApp не найден после всех попыток')
          setError('Telegram WebApp не найден')
          setIsReady(true)
          return
        }

        console.log('✅ Telegram WebApp найден, инициализируем...')
        
        // Инициализируем Telegram WebApp
        tg.ready()
        tg.expand()
        tg.enableClosingConfirmation()
        
        // Ждем полной инициализации
        await new Promise(resolve => setTimeout(resolve, 200))
        
        console.log('✅ Telegram WebApp инициализирован')
        console.log('📱 Init data:', tg.initData)
        console.log('👤 User:', tg.initDataUnsafe?.user)
        console.log('🔍 isExpanded:', tg.isExpanded)
        console.log('🔍 platform:', tg.platform)
        console.log('🔍 version:', tg.version)
        
        setIsReady(true)
      } catch (err) {
        console.error('❌ Ошибка инициализации Telegram:', err)
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка')
        setIsReady(true)
      }
    }

    // Запускаем инициализацию
    initTelegram()
  }, [])

  if (!isReady) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Инициализация Telegram...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Ошибка инициализации</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

