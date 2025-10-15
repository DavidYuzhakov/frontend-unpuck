'use client'

import { useTelegramData } from '@/components/providers/telegram-data-provider'
import { useAuthStore } from '@/store/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function HomePage() {
  const router = useRouter()
  const { userData, isLoading, isInTelegram } = useTelegramData()
  const { user } = useAuthStore()

  useEffect(() => {
    // Ждем загрузки данных пользователя
    if (isLoading) return

    console.log('🔍 HomePage - user:', user)
    console.log('🔍 HomePage - userData:', userData)
    console.log('🔍 HomePage - isLoading:', isLoading)

    // Если пользователь авторизован, перенаправляем на нужную вкладку в зависимости от роли
    if (user?.role) {
      console.log('🔍 HomePage - перенаправляем на роль:', user.role)
      switch (user.role) {
        case 'ADMIN':
          router.push('/admin')
          break
        case 'SELLER':
          router.push('/seller')
          break
        case 'BLOGGER':
          router.push('/blogger')
          break
        case 'MANAGER':
          router.push('/manager')
          break
        case 'BUYER':
        default:
          router.push('/catalog')
          break
      }
    }
  }, [router, user, isLoading, userData])

  // Если загрузка завершена, но нет данных пользователя, показываем ошибку
  if (!isLoading && !user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Ошибка авторизации
          </h1>
          <p className="text-gray-600 mb-4">
            Не удалось получить данные пользователя из Telegram Mini App
          </p>
          <div className="text-sm text-gray-500 mb-4">
            <p>Проверьте, что вы открыли приложение через Telegram</p>
            <p>и что у вас включены разрешения для Mini App</p>
          </div>
        </div>
      </div>
    )
  }

  return null
}
