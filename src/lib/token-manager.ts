// Всегда используем прокси API
const API_BASE = '/api'
import { getTelegramUserData } from './twa-utils'
// Глобальный менеджер токенов для всего приложения

class TokenManager {
  private static instance: TokenManager
  private token: string | null = null
  private user: any = null
  private isInitialized = false

  private constructor() {
    this.initializeFromStorage()
  }

  public static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager()
    }
    return TokenManager.instance
  }

  // Инициализация из localStorage при загрузке приложения
  private initializeFromStorage() {
    if (typeof window === 'undefined') return

    try {
      const storedToken = localStorage.getItem('auth_token')
      const storedUser = localStorage.getItem('auth_user')

      if (storedToken) {
        this.token = storedToken
      }

      if (storedUser) {
        this.user = JSON.parse(storedUser)
      }

      this.isInitialized = true
    } catch (error) {
      console.error('Ошибка инициализации TokenManager:', error)
    }
  }

  // Получить текущий токен
  public getToken(): string | null {
    if (!this.isInitialized) {
      this.initializeFromStorage()
    }
    return this.token
  }

  // Получить текущего пользователя
  public getUser(): any {
    if (!this.isInitialized) {
      this.initializeFromStorage()
    }
    return this.user
  }

  // Проверить, авторизован ли пользователь
  public isAuthenticated(): boolean {
    return !!(this.token && this.user)
  }

  // Установить токен и пользователя
  public setAuth(token: string, user: any): void {
    this.token = token
    this.user = user

    // Сохраняем в localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
      localStorage.setItem('auth_user', JSON.stringify(user))
      this.notifyOtherTabs()
    }
  }

  // Очистить авторизацию
  public clearAuth(): void {
    this.token = null
    this.user = null

    // Очищаем localStorage полностью
    if (typeof window !== 'undefined') {
      localStorage.clear()
      this.notifyOtherTabs()
    }
  }

  // Уведомление других вкладок об изменении авторизации
  private notifyOtherTabs(): void {
    if (typeof window !== 'undefined') {
      // Отправляем событие для синхронизации между вкладками
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'auth-storage',
          newValue: JSON.stringify({ user: this.user, token: this.token }),
          oldValue: null,
          storageArea: localStorage,
        })
      )
    }
  }

  // Обновить информацию о пользователе
  public updateUser(user: any): void {
    this.user = user

    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_user', JSON.stringify(user))
    }
  }

  // Принудительно обновить данные пользователя с сервера
  public async refreshUser(): Promise<boolean> {
    try {
      if (!this.token) return false

      // В TWA не обновляем данные с сервера
      if (this.token.startsWith('twa_')) {
        return true
      }

      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        let user
        try {
          user = await response.json()
          this.updateUser(user)
          return true
        } catch (parseError) {
          console.error('❌ Ошибка парсинга ответа сервера:', parseError)
          return false
        }
      } else {
        console.log(
          '❌ Ошибка обновления пользователя, статус:',
          response.status
        )
        return false
      }
    } catch (error) {
      console.error('❌ Ошибка при обновлении пользователя:', error)
      return false
    }
  }

  // Проверить валидность токена на сервере
  public async validateToken(): Promise<boolean> {
    if (!this.token) return false

    // В TWA считаем токен валидным, если он существует
    if (this.token.startsWith('twa_')) {
      return true
    }

    try {
      // Для TWA токенов считаем валидными
      if (this.token?.startsWith('twa_')) {
        return true
      }

      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const user = await response.json()
        this.updateUser(user)
        return true
      } else {
        console.log('❌ Токен невалиден, статус:', response.status)
        this.clearAuth()
        return false
      }
    } catch (error) {
      console.error('❌ Ошибка проверки токена:', error)
      return false
    }
  }

  // Автоматическая авторизация
  public async autoAuth(): Promise<{ user: any; token: string } | null> {
    try {
      // Проверяем, есть ли Telegram WebApp и мы в Mini App
      const tg = (window as any).Telegram?.WebApp
      const isTelegramWebApp =
        window.location.hostname.includes('t.me') ||
        window.location.hostname.includes('telegram.me') ||
        tg

      // В TWA используем только локальную авторизацию
      if (isTelegramWebApp) {
        // Сначала проверяем существующий TWA токен
        if (this.isAuthenticated() && this.token?.startsWith('twa_')) {
          return { user: this.user, token: this.token }
        }

        // Очищаем старые токены
        this.clearAuth()

        // Получаем данные пользователя из Telegram WebApp
        let userData = getTelegramUserData()

        if (!userData) {
          console.log('❌ Данные пользователя не найдены в Telegram WebApp')
          return null
        }

        // Получаем данные пользователя и токен из API
        let telegramUser = null
        let token = null

        try {
          const response = await fetch('/api/auth/telegram', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              telegramId: String(userData.id),
              firstName: userData.first_name || 'Пользователь',
              lastName: userData.last_name || undefined,
              username: userData.username || undefined,
              photoUrl: userData.photo_url || undefined,
            }),
          })

          if (response.ok) {
            const authData = await response.json()
            telegramUser = {
              id: authData.user.id,
              telegramId: authData.user.telegramId,
              firstName: authData.user.firstName,
              lastName: authData.user.lastName,
              username: authData.user.username,
              avatar: authData.user.avatar,
              role: authData.user.role,
              referralCode: authData.user.referralCode || '',
              isVerified: authData.user.isVerified || false,
            }
            token = authData.token
          } else {
            console.log(
              '⚠️ Не удалось получить данные из API, используем fallback'
            )
            // Fallback данные
            telegramUser = {
              id: String(userData.id),
              telegramId: String(userData.id),
              firstName: userData.first_name || 'Пользователь',
              lastName: userData.last_name || undefined,
              username: userData.username || undefined,
              avatar: userData.photo_url || undefined,
              role: 'BLOGGER',
              referralCode: '',
              isVerified: userData.is_premium || false,
            }
            token = `twa_${userData.id}_${Date.now()}`
          }
        } catch (error) {
          console.error('❌ Ошибка получения данных из API:', error)
          // Fallback данные
          telegramUser = {
            id: String(userData.id),
            telegramId: String(userData.id),
            firstName: userData.first_name || 'Пользователь',
            lastName: userData.last_name || undefined,
            username: userData.username || undefined,
            avatar: userData.photo_url || undefined,
            role: 'BLOGGER',
            referralCode: '',
            isVerified: userData.is_premium || false,
          }
          token = `twa_${userData.id}_${Date.now()}`
        }

        if (!telegramUser || !token) {
          console.log('❌ Не удалось создать пользователя')
          return null
        }

        this.setAuth(token, telegramUser)
        return { token, user: telegramUser }
      }

      // Для обычных браузеров проверяем существующий токен
      if (this.isAuthenticated()) {
        const isValid = await this.validateToken()
        if (isValid) {
          return { user: this.user, token: this.token! }
        } else {
          console.log('❌ Существующий токен невалиден, очищаем...')
          this.clearAuth()
        }
      }

      return null
    } catch (error) {
      console.error('❌ Ошибка автоматической авторизации:', error)
      return null
    }
  }
}

// Экспортируем единственный экземпляр
export const tokenManager = TokenManager.getInstance()

// Хук для использования в React компонентах
export const useTokenManager = () => {
  return {
    token: tokenManager.getToken(),
    user: tokenManager.getUser(),
    isAuthenticated: tokenManager.isAuthenticated(),
    setAuth: tokenManager.setAuth.bind(tokenManager),
    clearAuth: tokenManager.clearAuth.bind(tokenManager),
    updateUser: tokenManager.updateUser.bind(tokenManager),
    validateToken: tokenManager.validateToken.bind(tokenManager),
    autoAuth: tokenManager.autoAuth.bind(tokenManager),
  }
}
