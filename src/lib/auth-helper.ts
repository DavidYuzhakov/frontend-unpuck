// Всегда используем прокси API
const API_BASE = '/api'
import { getTelegramUserData } from './twa-utils'
// Вспомогательные функции для работы с авторизацией

export interface AuthUser {
  id: string
  username?: string
  email?: string
  firstName: string
  lastName?: string
  avatar?: string
  role: 'BUYER' | 'SELLER' | 'BLOGGER' | 'MANAGER' | 'ADMIN'
  // balance: number // УБРАЛИ БАЛАНС
  referralCode: string
  isVerified: boolean
  telegramId?: string
}

export interface AuthResponse {
  user: AuthUser
  token: string
}

// Функция для получения существующего токена из localStorage
export const getExistingToken = (): string | null => {
  if (typeof window === 'undefined') return null
  
  // Проверяем разные возможные ключи
  const possibleKeys = ['auth_token', 'token', 'authToken', 'access_token']
  
  for (const key of possibleKeys) {
    const token = localStorage.getItem(key)
    if (token) {
      console.log(`🔑 Найден токен в localStorage: ${key}`)
      return token
    }
  }
  
  return null
}

// Функция для автоматического входа с существующим токеном
export const autoLoginWithExistingToken = async (): Promise<AuthResponse | null> => {
  try {
    const existingToken = getExistingToken()
    if (!existingToken) {
      console.log('🔍 Токен не найден в localStorage')
      return null
    }

    // В TWA проверяем токен локально, без запроса к API
    if (existingToken.startsWith('twa_')) {
      console.log('🔍 TWA токен найден, проверяем локально')
      
      // Получаем сохраненные данные пользователя
      const savedUser = localStorage.getItem('auth_user')
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser)
          console.log('✅ TWA токен валиден, пользователь авторизован:', user.firstName, user.lastName)
          return { user, token: existingToken }
        } catch (parseError) {
          console.error('❌ Ошибка парсинга сохраненных данных пользователя:', parseError)
          localStorage.removeItem('auth_token')
          localStorage.removeItem('auth_user')
          return null
        }
      } else {
        console.log('❌ Данные пользователя не найдены в localStorage')
        localStorage.removeItem('auth_token')
        return null
      }
    }


    // Для обычных токенов делаем запрос к API
  const response = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${existingToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      let user
      try {
        user = await response.json()
        console.log('✅ Токен валиден, пользователь авторизован:', user.firstName, user.lastName)
        return { user, token: existingToken }
      } catch (parseError) {
        console.error('❌ Ошибка парсинга ответа сервера:', parseError)
        return null
      }
    } else {
      console.log('❌ Токен невалиден, статус:', response.status)
      // Очищаем невалидный токен
      localStorage.removeItem('auth_token')
      localStorage.removeItem('token')
      return null
    }
  } catch (error) {
    console.error('❌ Ошибка проверки токена:', error)
    return null
  }
}

// Авторизация через Telegram Mini App
export const telegramAutoAuth = async (): Promise<AuthResponse | null> => {
  try {
    if (typeof window === 'undefined') return null
    
    // Проверяем, что мы в браузере
    if (typeof window === 'undefined') {
      console.log('❌ Не в браузере, пропускаем авторизацию')
      return null
    }
    
    console.log('🔍 TWA обнаружен, получаем данные пользователя')

    // Получаем данные пользователя из Telegram WebApp
    let userData = getTelegramUserData()
    
    if (!userData) {
      console.log('❌ Данные пользователя не найдены в Telegram WebApp')
      return null
    }
    
    // В TWA создаем пользователя напрямую из данных Telegram WebApp
    // без запроса к backend API
    const telegramUser: AuthUser = {
      id: String(userData.id),
      telegramId: String(userData.id),
      firstName: userData.first_name || 'Пользователь',
      lastName: userData.last_name || undefined,
      username: userData.username || undefined,
      avatar: userData.photo_url || undefined,
      role: 'BUYER', // По умолчанию покупатель
      // balance: 0, // УБРАЛИ БАЛАНС
      referralCode: '', // Будет заполнено позже
      isVerified: userData.is_premium || false,
    }

    // Генерируем простой токен для TWA (в реальном приложении это должно быть более безопасно)
    const token = `twa_${userData.id}_${Date.now()}`

    console.log('✅ Создан пользователь из Telegram WebApp:', telegramUser)
    console.log('🔑 Сгенерирован токен для TWA:', token)

    // Сохраняем данные в localStorage
    try {
      localStorage.setItem('auth_token', token)
      localStorage.setItem('auth_user', JSON.stringify(telegramUser))
      console.log('💾 Данные пользователя сохранены в localStorage')
      } catch (e) {
        console.log('⚠️ Ошибка сохранения в localStorage:', e)
      }
      
      return {
      user: telegramUser,
      token: token
    }
  } catch (error) {
    console.error('❌ Ошибка Telegram авторизации:', error)
    console.error('❌ Тип ошибки:', typeof error)
    console.error('❌ Стек ошибки:', error instanceof Error ? error.stack : 'Нет стека')
    console.error('❌ Детали ошибки:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      cause: error instanceof Error ? (error as any).cause : undefined
    })
    
    return null
  }
}

// Автоавторизация: сперва существующий токен, затем Telegram Mini App
export const autoAuth = async (): Promise<AuthResponse | null> => {
  try {
    console.log('🔐 Начинаем autoAuth...')
    
    console.log('🔍 Проверяем существующий токен...')
    const existingAuth = await autoLoginWithExistingToken()
    if (existingAuth) {
      console.log('✅ Найден существующий токен')
      return existingAuth
    }
    console.log('❌ Существующий токен не найден')

    console.log('🔍 Пытаемся авторизацию через Telegram...')
    const tgAuth = await telegramAutoAuth()
    if (tgAuth) {
      console.log('✅ Авторизация через Telegram успешна')
      return tgAuth
    }
    console.log('❌ Авторизация через Telegram не удалась')

    console.log('❌ Все методы авторизации не удались')
    return null
  } catch (error) {
    console.error('❌ Ошибка автоматической авторизации:', error)
    console.error('❌ Тип ошибки autoAuth:', typeof error)
    console.error('❌ Стек ошибки autoAuth:', error instanceof Error ? error.stack : 'Нет стека')
    console.error('❌ Детали ошибки autoAuth:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      cause: error instanceof Error ? (error as any).cause : undefined
    })
    return null
  }
}
