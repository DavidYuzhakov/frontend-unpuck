'use client'

import { getProductImageUrl } from '@/lib/image-utils'
import Image from 'next/image'
import { memo, useCallback, useState } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  fill?: boolean
  width?: number
  height?: number
  sizes?: string
  priority?: boolean
  onError?: () => void
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
}

export const OptimizedImage = memo(function OptimizedImage({ 
  src, 
  alt, 
  className = '', 
  fill = false, 
  width, 
  height, 
  sizes,
  priority = false,
  onError,
  placeholder = 'empty',
  blurDataURL
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState(getProductImageUrl(src))
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const handleError = useCallback(() => {
    if (!hasError) {
      setHasError(true)
      // Используем placeholder из Unsplash вместо локального файла
      setImageSrc('https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&crop=center')
      onError?.()
    }
  }, [hasError, onError])

  const handleLoad = useCallback(() => {
    setIsLoading(false)
  }, [])

  // Генерируем blur placeholder если не передан
  const defaultBlurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='

  const imageProps = {
    src: imageSrc,
    alt,
    className: `${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`,
    onError: handleError,
    onLoad: handleLoad,
    loading: (priority ? 'eager' : 'lazy') as 'eager' | 'lazy',
    ...(fill ? {} : { width, height }),
    ...(sizes ? { sizes } : {}),
    ...(placeholder === 'blur' ? { 
      placeholder: 'blur' as const,
      blurDataURL: blurDataURL || defaultBlurDataURL
    } : {})
  }

  if (fill) {
    return (
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
        )}
        <Image
          {...imageProps}
          className={`absolute inset-0 w-full h-full object-cover ${imageProps.className}`}
        />
      </div>
    )
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
      )}
      <Image {...imageProps} />
    </div>
  )
})
