'use client'

import { getCachedAvatar, preloadAvatar } from '@/lib/avatar-cache'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useEffect, useState } from 'react'

interface AvatarProps {
  name: string
  src?: string | null
  size?: number
  bgColor?: string
  className?: string
  fallback?: string
  preload?: boolean
}

export function Avatar({
  name,
  src,
  size = 100,
  bgColor = 'random',
  className,
  fallback,
  preload = false
}: AvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const loadAvatar = async () => {
      try {
        setIsLoading(true)
        setHasError(false)

        // Если есть готовый src и он не дефолтный, используем его
        if (src && !src.includes('/images/avatars/default-avatar')) {
          setAvatarUrl(src)
          setIsLoading(false)
          return
        }

        // Генерируем аватар на основе имени
        const url = preload 
          ? await preloadAvatar(name, size, bgColor)
          : getCachedAvatar(name, size, bgColor)
        
        setAvatarUrl(url)
        setIsLoading(false)
      } catch (error) {
        // Не логируем ошибки загрузки аватаров, так как это нормально
        // console.error('Ошибка загрузки аватара:', error)
        setHasError(true)
        setIsLoading(false)
      }
    }

    if (name) {
      loadAvatar()
    }
  }, [name, src, size, bgColor, preload])

  if (isLoading) {
    return (
      <div 
        className={cn(
          'flex items-center justify-center bg-gray-200 animate-pulse rounded-full',
          className
        )}
        style={{ width: size, height: size }}
      >
        <div className="w-1/2 h-1/2 bg-gray-300 rounded-full" />
      </div>
    )
  }

  if (hasError || !avatarUrl) {
    return (
      <div 
        className={cn(
          'flex items-center justify-center bg-gray-300 text-gray-600 font-medium rounded-full',
          className
        )}
        style={{ width: size, height: size }}
      >
        {name ? name.charAt(0).toUpperCase() : '?'}
      </div>
    )
  }

  return (
    <Image
      src={avatarUrl}
      alt={name}
      width={size}
      height={size}
      className={cn('rounded-full object-cover', className)}
      onError={() => setHasError(true)}
      priority={preload}
    />
  )
}

/**
 * Компонент для предзагрузки аватаров
 */
interface AvatarPreloaderProps {
  names: string[]
  size?: number
  bgColor?: string
}

export function AvatarPreloader({ names, size = 100, bgColor = 'random' }: AvatarPreloaderProps) {
  useEffect(() => {
    const preloadAvatars = async () => {
      const promises = names.map(name => preloadAvatar(name, size, bgColor))
      try {
        await Promise.all(promises)
        console.log(`✅ Предзагружено ${names.length} аватаров`)
      } catch (error) {
        // Не логируем ошибки предзагрузки аватаров, так как это нормально
        // console.error('Ошибка предзагрузки аватаров:', error)
        console.log(`✅ Предзагружено ${names.length} аватаров (с некоторыми ошибками)`)
      }
    }

    if (names.length > 0) {
      preloadAvatars()
    }
  }, [names, size, bgColor])

  return null
}
