/**
 * Утилиты для работы с изображениями
 */

// Дефолтные изображения (используем внешние placeholder)
export const DEFAULT_IMAGES = {
  AVATAR:
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
  PRODUCT:
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&crop=center',
  PLACEHOLDER:
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&crop=center',
} as const

/**
 * Получает URL изображения с fallback
 */
export function getImageUrl(
  imageUrl?: string | null,
  fallback: string = DEFAULT_IMAGES.PLACEHOLDER
): string {
  if (!imageUrl) return fallback

  // Если это уже локальный путь, возвращаем как есть
  if (imageUrl.startsWith('/images/')) {
    return imageUrl
  }

  // Если это внешний URL, возвращаем как есть
  if (imageUrl.startsWith('http')) {
    return imageUrl
  }

  // Если это относительный путь, добавляем /images/ если нужно
  if (imageUrl.startsWith('images/')) {
    return `/${imageUrl}`
  }

  // Если это data URL или blob, возвращаем как есть
  if (imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
    return imageUrl
  }

  return imageUrl
}

/**
 * Получает URL аватара с fallback
 */
export function getAvatarUrl(avatarUrl?: string | null, name?: string): string {
  // Если есть имя, генерируем аватар на его основе
  if (name && (!avatarUrl || avatarUrl === DEFAULT_IMAGES.AVATAR)) {
    const { getAvatarUrl: generateAvatar } = require('./avatar-utils')
    return generateAvatar(name)
  }

  return getImageUrl(avatarUrl, DEFAULT_IMAGES.AVATAR)
}

/**
 * Получает URL изображения товара с fallback
 */
export function getProductImageUrl(imageUrl?: string | null): string {
  if (!imageUrl) return DEFAULT_IMAGES.PRODUCT

  // Если это уже полный URL, возвращаем как есть
  if (imageUrl.startsWith('http')) {
    return imageUrl
  }

  // Если это путь к загруженному файлу, добавляем префикс
  if (imageUrl.startsWith('/uploads/')) {
    return imageUrl
  }

  // Если это путь к изображению товара, добавляем префикс
  if (imageUrl.startsWith('/images/')) {
    return imageUrl
  }

  // Если это относительный путь, добавляем префикс
  if (imageUrl.startsWith('images/')) {
    return `/${imageUrl}`
  }

  // Если это data URL или blob, возвращаем как есть
  if (imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
    return imageUrl
  }

  // Fallback на дефолтное изображение
  return DEFAULT_IMAGES.PRODUCT
}

/**
 * Получает массив URL изображений товара с fallback
 */
export function getProductImagesUrls(images?: string[] | null): string[] {
  if (!images || images.length === 0) {
    return [DEFAULT_IMAGES.PRODUCT]
  }

  return images.map((img) => getProductImageUrl(img))
}

/**
 * Проверяет, является ли URL внешним
 */
export function isExternalUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://')
}

/**
 * Проверяет, является ли URL локальным изображением
 */
export function isLocalImage(url: string): boolean {
  return url.startsWith('/images/')
}

/**
 * Получает случайное изображение из категории
 */
export function getRandomImage(
  category: 'avatars' | 'products' | 'placeholders'
): string {
  const images = {
    avatars: [
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
    ],
    products: [
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop&crop=center',
    ],
    placeholders: [
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&crop=center',
    ],
  }

  const categoryImages = images[category]
  const randomIndex = Math.floor(Math.random() * categoryImages.length)
  return categoryImages[randomIndex]
}

/**
 * Генерирует массив случайных изображений для товара
 */
export function generateRandomProductImages(count: number = 3): string[] {
  const images: string[] = []
  const productImages = [
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop&crop=center',
  ]

  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * productImages.length)
    images.push(productImages[randomIndex])
  }

  return images
}

/**
 * Генерирует случайный аватар
 */
export function generateRandomAvatar(): string {
  return getRandomImage('avatars')
}
