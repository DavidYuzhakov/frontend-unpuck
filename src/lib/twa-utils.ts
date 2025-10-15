// Утилиты для работы с Telegram Mini App (TWA)

// Функция для проверки, что мы в TWA
export const isTWA = () => {
  return typeof window !== 'undefined' && (
    window.location.hostname.includes('t.me') || 
    window.location.hostname.includes('telegram.me') ||
    window.location.hostname === 'localhost' ||
    window.location.hostname.includes('127.0.0.1') ||
    window.Telegram?.WebApp
  )
}

// Функция для получения данных пользователя из Telegram WebApp
export const getTelegramUserData = () => {
  if (typeof window === 'undefined') return null
  
  const tg = (window as any).Telegram?.WebApp
  if (!tg) return null
  
  console.log('🔍 getTelegramUserData - initDataUnsafe:', tg.initDataUnsafe)
  console.log('🔍 getTelegramUserData - initData:', tg.initData)
  console.log('🔍 getTelegramUserData - tg.user:', tg.user)
  
  // Проверяем, что TWA готов
  if (!tg.isExpanded) {
    console.log('🔧 TWA не развернут, разворачиваем...')
    tg.expand()
  }
  
  // Способ 1: через initDataUnsafe (официальный способ)
  if (tg.initDataUnsafe?.user) {
    console.log('✅ Данные получены через initDataUnsafe.user (официальный API)')
    return tg.initDataUnsafe.user
  }
  
  // Способ 2: через tg.user (прямой доступ)
  if (tg.user) {
    console.log('✅ Данные получены через tg.user')
    return tg.user
  }
  
  // Способ 3: через initData (парсим строку)
  if (tg.initData) {
    try {
      console.log('🔍 Парсим initData:', tg.initData)
      const urlParams = new URLSearchParams(tg.initData)
      const userParam = urlParams.get('user')
      if (userParam) {
        console.log('✅ Данные получены через initData')
        return JSON.parse(decodeURIComponent(userParam))
      }
    } catch (e) {
      console.log('❌ Ошибка парсинга initData:', e)
    }
  }
  
  // Способ 4: проверяем, есть ли данные в других местах
  console.log('🔍 Проверяем другие свойства TWA:')
  console.log('🔍 tg.auth_date:', tg.auth_date)
  console.log('🔍 tg.hash:', tg.hash)
  console.log('🔍 tg.query_id:', tg.query_id)
  console.log('🔍 tg.start_param:', tg.start_param)
  
  console.log('❌ Данные пользователя не найдены в TWA')
  return null
}

// Функция для создания мокового пользователя (удалена - не используем моковые данные)
