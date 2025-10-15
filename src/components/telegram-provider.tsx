'use client'

import { telegramAuth } from '@/lib/telegram-auth'
import { tokenManager } from '@/lib/token-manager'
import { useAuthStore } from '@/store/auth'
import { useEffect, useState } from 'react'

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false)
  const { login } = useAuthStore()

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('🚀 Инициализация Telegram авторизации')
        
        // Проверяем существующие данные
        const existingUser = tokenManager.getUser()
        const existingToken = tokenManager.getToken()
        
        if (existingUser && existingToken) {
          console.log('✅ Найдены существующие данные пользователя:', existingUser)
          login(existingUser, existingToken)
          setIsInitialized(true)
          return
        }

        // Авторизуемся через Telegram Mini App
        const authSuccess = await telegramAuth.authenticate()
        if (authSuccess) {
          console.log('✅ Авторизация через Telegram Mini App успешна')
          // Проверяем, что данные сохранились в tokenManager
          const user = tokenManager.getUser()
          const token = tokenManager.getToken()
          if (user && token) {
            console.log('✅ Данные пользователя сохранены в tokenManager:', user)
            login(user, token)
          }
        } else {
          console.log('ℹ️ Авторизация через Telegram Mini App не удалась')
        }
        
        setIsInitialized(true)
      } catch (error) {
        console.error('❌ Ошибка инициализации авторизации:', error)
        setIsInitialized(true)
      }
    }

    initAuth()
  }, [login])

  if (!isInitialized) {
    return null
  }

  return <>{children}</>
}
