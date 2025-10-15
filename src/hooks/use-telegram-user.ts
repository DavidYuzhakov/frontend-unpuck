import { authAPI } from '@/lib/api'
import { getTelegramUserData } from '@/lib/twa-utils'
import { User } from '@/types'
import { useCallback, useEffect, useState } from 'react'

export interface UseTelegramUserReturn {
  userData: User | null
  isLoading: boolean
  error: string | null
  refreshUserData: () => Promise<void>
  isInTelegram: boolean
}

interface IRawUserData {
  allow_write_to_pm: boolean
  first_name: string
  id: number
  is_premium: boolean
  language_code: string
  last_name: string
  photo_url: string
  username: string
}

const fallbackData: User = {
  id: 'test_user_' + Date.now(),
  firstName: 'Test',
  telegramId: '',
  lastName: 'User',
  username: 'test_user',
  role: 'BUYER' as const, // Fallback роль
  referralCode: '',
  isVerified: false,
  isActive: true,
  isBlocked: false,
}

export function useTelegramUser(): UseTelegramUserReturn {
  const [userData, setUserData] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isInTelegram, setIsInTelegram] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Проверяем, что компонент смонтирован на клиенте
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const getTelegramUserDataLocal =
    useCallback(async (): Promise<User | null> => {
      try {
        // Проверяем, что мы в браузере и компонент смонтирован
        if (typeof window === 'undefined') {
          console.log('❌ Не в браузере')
          return null
        }

        // Ждем инициализации Telegram WebApp с несколькими попытками
        let tg = window.Telegram?.WebApp
        let attempts = 0
        const maxAttempts = 10

        while (!tg && attempts < maxAttempts) {
          console.log(
            `🔄 Попытка ${attempts + 1}/${maxAttempts} инициализации TWA...`
          )
          await new Promise((resolve) => setTimeout(resolve, 200))
          tg = window.Telegram?.WebApp
          attempts++
        }

        if (!tg) {
          console.log('❌ Telegram WebApp не найден после всех попыток')
          setIsInTelegram(false)
          return null
        }

        setIsInTelegram(true)
        console.log('✅ Telegram WebApp обнаружен')

        // Инициализируем TWA
        if (!tg.isExpanded) {
          console.log('🔧 TWA не развернут, разворачиваем...')
          tg.expand()
        }

        await new Promise((resolve) => setTimeout(resolve, 300))
        const rawUserData: IRawUserData = getTelegramUserData()

        try {
          const requestData = {
            telegramId: String(rawUserData.id),
            firstName: rawUserData.first_name,
            lastName: rawUserData.last_name,
            username: rawUserData.username,
            photoUrl: rawUserData.photo_url,
          }

          const { data } = await authAPI.telegramAuth(requestData)
          return {
            ...data.user,
            // balance: 0,
            isBlocked: false,
            isActive: true,
          }
        } catch (error) {
          console.error('❌ Ошибка получения данных из API:', error)
          return fallbackData
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Неизвестная ошибка'
        console.error('❌ Ошибка получения данных из Telegram:', errorMessage)
        setError(errorMessage)

        return fallbackData
      }
    }, [])

  const refreshUserData = useCallback(async () => {
    if (!isMounted) return

    try {
      setIsLoading(true)
      setError(null)

      // Получаем данные из Telegram WebApp
      const telegramData = await getTelegramUserDataLocal()

      if (telegramData) {
        setUserData(telegramData)
      } else {
        setUserData(fallbackData)
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Неизвестная ошибка'
      setError(errorMessage)
      setUserData(fallbackData)
    } finally {
      setIsLoading(false)
    }
  }, [isMounted])

  useEffect(() => {
    if (isMounted) {
      refreshUserData()
    }
  }, [isMounted])

  return {
    userData,
    isLoading,
    error,
    refreshUserData,
    isInTelegram,
  }
}
