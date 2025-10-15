'use client'

import { getProductImageUrl } from '@/lib/image-utils'
import Image from 'next/image'
import { memo, useCallback, useEffect, useRef, useState } from 'react'

interface LazyImageProps {
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
  threshold?: number
}

export const LazyImage = memo(function LazyImage({ 
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
  blurDataURL,
  threshold = 0.1
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState(getProductImageUrl(src))
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isInView, setIsInView] = useState(priority)
  const imgRef = useRef<HTMLDivElement>(null)

  // Intersection Observer для ленивой загрузки
  useEffect(() => {
    if (priority || !imgRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        threshold,
        rootMargin: '50px'
      }
    )

    observer.observe(imgRef.current)

    return () => observer.disconnect()
  }, [priority, threshold])

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

  // Генерируем blur placeholder
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
      <div ref={imgRef} className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
        )}
        {isInView && (
          <Image
            {...imageProps}
            className={`absolute inset-0 w-full h-full object-cover ${imageProps.className}`}
          />
        )}
      </div>
    )
  }

  return (
    <div ref={imgRef} className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
      )}
      {isInView && <Image {...imageProps} />}
    </div>
  )
})
