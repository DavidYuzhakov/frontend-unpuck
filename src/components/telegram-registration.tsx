'use client'

import { useEffect, useState } from 'react'

interface TelegramRegistrationProps {
  onRegistrationComplete: (userData: any) => void
}

export function TelegramRegistration({ onRegistrationComplete }: TelegramRegistrationProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initRegistration = async () => {
      const tg = (window as any).Telegram?.WebApp
      if (!tg) {
        setError('Telegram WebApp не обнаружен')
        return
      }

      console.log('🔘 Получаем данные пользователя из Telegram...')
      setIsLoading(true)
      
      try {
        // Получаем данные пользователя из Telegram WebApp
        const userData = tg.initDataUnsafe?.user
        
        if (!userData) {
          // Если данные пользователя недоступны, проверяем URL параметры
          const urlParams = new URLSearchParams(window.location.search)
          const telegramId = urlParams.get('telegramId')
          const firstName = urlParams.get('firstName')
          const lastName = urlParams.get('lastName')
          const username = urlParams.get('username')
          
          if (telegramId) {
            console.log('✅ Найдены данные в URL параметрах:', { telegramId, firstName, lastName, username })
            const urlUserData = {
              id: telegramId,
              first_name: firstName || 'Пользователь',
              last_name: lastName || '',
              username: username || undefined,
              photo_url: undefined
            }
            onRegistrationComplete(urlUserData)
            return
          }
          
          throw new Error('Данные пользователя Telegram недоступны')
        }
        
        console.log('✅ Получены данные пользователя из Telegram:', userData)
        
        // Преобразуем данные в нужный формат
        const formattedUserData = {
          id: userData.id,
          first_name: userData.first_name || 'Пользователь',
          last_name: userData.last_name || '',
          username: userData.username || undefined,
          photo_url: userData.photo_url || undefined
        }
        
        onRegistrationComplete(formattedUserData)
      } catch (err) {
        console.error('❌ Ошибка получения данных пользователя:', err)
        setError(err instanceof Error ? err.message : 'Ошибка получения данных пользователя')
      } finally {
        setIsLoading(false)
      }
    }

    initRegistration()
  }, [onRegistrationComplete])

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-6">
          <div className="text-red-500 text-xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Ошибка</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-6">
        <div className="text-blue-500 text-6xl mb-4">📱</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Добро пожаловать!</h1>
        <p className="text-gray-600 mb-6">
          Создаем ваш аккаунт...
        </p>
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600">Регистрация...</span>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            Готово!
          </p>
        )}
      </div>
    </div>
  )
}
