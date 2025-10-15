'use client'

import { useTelegramData } from '@/components/providers/telegram-data-provider'
import { useAuthStore } from '@/store/auth'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ClearCachePage() {
  const router = useRouter()
  const { clearAuth } = useAuthStore()
  const { refreshUserData } = useTelegramData()
  const [isClearing, setIsClearing] = useState(false)

  const handleClearCache = async () => {
    setIsClearing(true)
    
    try {
      console.log('🧹 Очищаем кэш...')
      
      // Очищаем localStorage
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      localStorage.removeItem('auth_user')
      
      // Очищаем store
      clearAuth()
      
      console.log('✅ Кэш очищен')
      
      // Ждем немного
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Обновляем данные пользователя
      console.log('🔄 Обновляем данные пользователя...')
      await refreshUserData()
      
      console.log('✅ Данные обновлены')
      
      // Перенаправляем на главную страницу
      router.push('/')
      
    } catch (error) {
      console.error('❌ Ошибка при очистке кэша:', error)
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-sm border p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">🧹</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Очистка кэша
        </h1>
        <p className="text-gray-600 mb-6">
          Эта страница очистит кэш и обновит данные пользователя из API.
        </p>
        
        <button
          onClick={handleClearCache}
          disabled={isClearing}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            isClearing
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isClearing ? 'Очищаем...' : 'Очистить кэш и обновить данные'}
        </button>
        
        <div className="mt-4 text-sm text-gray-500">
          <p>После очистки вы будете перенаправлены на главную страницу</p>
        </div>
      </div>
    </div>
  )
}
