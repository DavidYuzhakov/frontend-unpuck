'use client'

import { useTelegramUser } from '@/hooks/use-telegram-user'
import { useAuthStore } from '@/store/auth'
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'

interface TelegramDataContextType {
  userData: ReturnType<typeof useTelegramUser>['userData']
  isLoading: ReturnType<typeof useTelegramUser>['isLoading']
  error: ReturnType<typeof useTelegramUser>['error']
  isInTelegram: ReturnType<typeof useTelegramUser>['isInTelegram']
  refreshUserData: ReturnType<typeof useTelegramUser>['refreshUserData']
}

const TelegramDataContext = createContext<TelegramDataContextType | undefined>(
  undefined
)

interface TelegramDataProviderProps {
  children: ReactNode
}

export function TelegramDataProvider({ children }: TelegramDataProviderProps) {
  const [isMounted, setIsMounted] = useState(false)
  const { userData, isLoading, error, isInTelegram, refreshUserData } =
    useTelegramUser()
  const { user, login } = useAuthStore()

  // Проверяем, что компонент смонтирован на клиенте
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Автоматически обновляем данные пользователя в store при получении данных из Telegram
  useEffect(() => {
    if (!isMounted || !userData) return

    console.log('🔄 Обновление данных пользователя в store')
    console.log('🔍 userData.role:', userData.role)
    console.log('🔍 userData:', userData)
    console.log('🔍 текущий user в store:', user)

    const newUser = { ...userData }

    console.log('🔍 Обновляем пользователя с ролью:', newUser.role)

    // Получаем реальный токен из localStorage
    const token =
      localStorage.getItem('auth_token') || `twa_${userData.id}_${Date.now()}`
    login(newUser, token)
  }, [userData, isMounted])

  const contextValue: TelegramDataContextType = {
    userData,
    isLoading,
    error,
    isInTelegram,
    refreshUserData,
  }

  return (
    <TelegramDataContext.Provider value={contextValue}>
      {children}
    </TelegramDataContext.Provider>
  )
}

export function useTelegramData() {
  const context = useContext(TelegramDataContext)
  if (context === undefined) {
    throw new Error(
      'useTelegramData must be used within a TelegramDataProvider'
    )
  }
  return context
}
