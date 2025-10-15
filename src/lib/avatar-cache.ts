/**
 * Система кэширования аватаров
 */

interface CachedAvatar {
  url: string
  timestamp: number
  name: string
  size: number
  bgColor: string
}

const CACHE_KEY = 'avatar_cache'
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 часа

/**
 * Получает кэш аватаров из localStorage
 */
function getAvatarCache(): Record<string, CachedAvatar> {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    return cached ? JSON.parse(cached) : {}
  } catch (error) {
    console.error('Ошибка загрузки кэша аватаров:', error)
    return {}
  }
}

/**
 * Сохраняет кэш аватаров в localStorage
 */
function setAvatarCache(cache: Record<string, CachedAvatar>): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch (error) {
    console.error('Ошибка сохранения кэша аватаров:', error)
  }
}

/**
 * Генерирует ключ кэша для аватара
 */
function generateCacheKey(name: string, size: number, bgColor: string): string {
  return `${name}_${size}_${bgColor}`
}

/**
 * Проверяет, действителен ли кэш
 */
function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_DURATION
}

/**
 * Получает аватар из кэша или создает новый
 */
export function getCachedAvatar(
  name: string, 
  size: number = 100, 
  bgColor: string = 'random'
): string {
  const cache = getAvatarCache()
  const cacheKey = generateCacheKey(name, size, bgColor)
  const cached = cache[cacheKey]

  // Если есть валидный кэш, возвращаем его
  if (cached && isCacheValid(cached.timestamp)) {
    return cached.url
  }

  // Создаем новый URL аватара
  const encodedName = encodeURIComponent(name.trim())
  const url = `/api/avatar/${encodedName}?size=${size}&bg=${bgColor}`

  // Сохраняем в кэш
  cache[cacheKey] = {
    url,
    timestamp: Date.now(),
    name,
    size,
    bgColor
  }
  setAvatarCache(cache)

  return url
}

/**
 * Предзагружает аватар и сохраняет в кэш
 */
export async function preloadAvatar(
  name: string, 
  size: number = 100, 
  bgColor: string = 'random'
): Promise<string> {
  const url = getCachedAvatar(name, size, bgColor)
  
  // Предзагружаем изображение
  try {
    const img = new Image()
    img.src = url
    await new Promise((resolve, reject) => {
      img.onload = () => resolve(img)
      img.onerror = (event) => {
        // Не логируем ошибки предзагрузки аватаров, так как это нормально
        // console.error('Ошибка предзагрузки аватара:', event)
        reject(new Error(`Failed to load avatar: ${url}`))
      }
    })
  } catch (error) {
    // Не логируем ошибки предзагрузки аватаров, так как это нормально
    // console.error('Ошибка предзагрузки аватара:', error)
  }

  return url
}

/**
 * Очищает устаревший кэш
 */
export function cleanExpiredCache(): void {
  const cache = getAvatarCache()
  const now = Date.now()
  let hasChanges = false

  Object.keys(cache).forEach(key => {
    if (!isCacheValid(cache[key].timestamp)) {
      delete cache[key]
      hasChanges = true
    }
  })

  if (hasChanges) {
    setAvatarCache(cache)
  }
}

/**
 * Очищает весь кэш аватаров
 */
export function clearAvatarCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY)
  } catch (error) {
    console.error('Ошибка очистки кэша аватаров:', error)
  }
}

/**
 * Получает статистику кэша
 */
export function getCacheStats(): { total: number; valid: number; expired: number } {
  const cache = getAvatarCache()
  const now = Date.now()
  let valid = 0
  let expired = 0

  Object.values(cache).forEach(avatar => {
    if (isCacheValid(avatar.timestamp)) {
      valid++
    } else {
      expired++
    }
  })

  return {
    total: Object.keys(cache).length,
    valid,
    expired
  }
}
