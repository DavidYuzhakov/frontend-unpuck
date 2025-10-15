import { telegramApp } from './telegram-init'
import { tokenManager } from './token-manager'

// Глобальная авторизация через Telegram Mini App
export class TelegramAuth {
  private static instance: TelegramAuth
  private isAuthenticated = false

  private constructor() {}

  public static getInstance(): TelegramAuth {
    if (!TelegramAuth.instance) {
      TelegramAuth.instance = new TelegramAuth()
    }
    return TelegramAuth.instance
  }

  public async authenticate(): Promise<boolean> {
    try {
      console.log('🔐 Начинаем авторизацию через Telegram Mini App')
      
      // Инициализируем Telegram Mini App
      const isTelegramReady = await telegramApp.init()
      if (!isTelegramReady) {
        console.log('❌ Telegram Mini App не готов')
        return false
      }

      // Проверяем, что мы в Telegram Mini App
      if (!telegramApp.isInTelegram()) {
        console.log('❌ Не в Telegram Mini App')
        return false
      }

      // Получаем данные пользователя
      const userData = telegramApp.getUserData()
      if (!userData) {
        console.log('❌ Нет данных пользователя в Telegram')
        return false
      }

      console.log('✅ Данные пользователя получены:', userData)

      // Авторизуемся через API
      try {
        const authResult = await tokenManager.autoAuth()
        if (authResult) {
          console.log('✅ Авторизация через Telegram успешна:', authResult.user)
          this.isAuthenticated = true
          return true
        } else {
          console.log('❌ Не удалось авторизоваться через API')
          return false
        }
      } catch (apiError) {
        console.error('❌ Ошибка API авторизации:', apiError)
        return false
      }
    } catch (error) {
      console.error('❌ Ошибка авторизации через Telegram:', error)
      return false
    }
  }

  public isAuth(): boolean {
    return this.isAuthenticated
  }

  public getUserData(): any {
    return telegramApp.getUserData()
  }
}

// Глобальный экземпляр
export const telegramAuth = TelegramAuth.getInstance()
