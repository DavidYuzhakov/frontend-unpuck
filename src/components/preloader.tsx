'use client'

import { useEffect } from 'react'

// Компонент для предзагрузки критических ресурсов
export function Preloader() {
  useEffect(() => {
    // Предзагружаем критические изображения
    const criticalImages = [
      '/images/placeholders/placeholder-1.jpg',
      '/images/placeholders/placeholder-2.jpg',
      '/images/placeholders/placeholder-3.jpg',
    ]

    criticalImages.forEach(src => {
      const img = new Image()
      img.src = src
    })

    // Предзагружаем критические шрифты (удалено, так как шрифт не существует)

    // Предзагружаем критические API endpoints
    const criticalEndpoints = [
      '/api/products?limit=10',
      '/api/categories',
    ]

    criticalEndpoints.forEach(endpoint => {
      fetch(endpoint, { 
        method: 'HEAD',
        cache: 'force-cache'
      }).catch(() => {
        // Игнорируем ошибки предзагрузки
      })
    })
  }, [])

  return null
}
