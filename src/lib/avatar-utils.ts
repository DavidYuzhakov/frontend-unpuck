/**
 * Утилиты для работы с аватарами
 */

import { getCachedAvatar } from './avatar-cache'

/**
 * Генерирует URL для аватара на основе имени с кэшированием
 * @param name - Имя пользователя
 * @param size - Размер аватара (по умолчанию 100)
 * @param bgColor - Цвет фона (по умолчанию random)
 * @returns URL для аватара
 */
export function getAvatarUrl(name: string, size: number = 100, bgColor: string = 'random'): string {
  if (!name || name.trim() === '') {
    return getCachedAvatar('Anonymous', size, bgColor)
  }
  
  return getCachedAvatar(name.trim(), size, bgColor)
}

/**
 * Генерирует URL для аватара продукта/товара с кэшированием
 * @param productName - Название товара
 * @param size - Размер аватара (по умолчанию 100)
 * @returns URL для аватара товара
 */
export function getProductAvatarUrl(productName: string, size: number = 100): string {
  if (!productName || productName.trim() === '') {
    return getCachedAvatar('Product', size, 'random')
  }
  
  return getCachedAvatar(productName.trim(), size, 'random')
}

/**
 * Генерирует URL для аватара по умолчанию с кэшированием
 * @param size - Размер аватара (по умолчанию 100)
 * @returns URL для аватара по умолчанию
 */
export function getDefaultAvatarUrl(size: number = 100): string {
  return getCachedAvatar('User', size, 'random')
}

/**
 * Проверяет, является ли URL аватара сгенерированным
 * @param url - URL для проверки
 * @returns true, если URL сгенерированный
 */
export function isGeneratedAvatar(url: string): boolean {
  return url.includes('/api/avatar/')
}

/**
 * Извлекает имя из URL сгенерированного аватара
 * @param url - URL аватара
 * @returns Имя пользователя или null
 */
export function extractNameFromAvatarUrl(url: string): string | null {
  const match = url.match(/\/api\/avatar\/([^?]+)/)
  return match ? decodeURIComponent(match[1]) : null
}
