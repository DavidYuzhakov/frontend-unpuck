'use client'

import { getProductImageUrl } from '@/lib/image-utils'
import { useState } from 'react'

interface SafeImageProps {
  src: string
  alt: string
  className?: string
  fill?: boolean
  width?: number
  height?: number
  sizes?: string
  priority?: boolean
  onError?: () => void
}

export function SafeImage({
  src,
  alt,
  className = '',
  fill = false,
  width,
  height,
  sizes,
  priority = false,
  onError,
}: SafeImageProps) {
  const initialSrc = getProductImageUrl(src)
  const [imageSrc, setImageSrc] = useState(initialSrc)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      // Используем placeholder из Unsplash вместо локального файла
      setImageSrc(
        'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&crop=center'
      )
      onError?.()
    }
  }

  const imageProps = {
    src: imageSrc,
    alt,
    className,
    onError: handleError,
    loading: (priority ? 'eager' : 'lazy') as 'eager' | 'lazy',
    ...(fill ? {} : { width, height }),
    ...(sizes ? { sizes } : {}),
  }

  if (fill) {
    return (
      <div className="relative">
        <img
          {...imageProps}
          className={`absolute inset-0 w-full h-full object-cover ${className}`}
        />
      </div>
    )
  }

  return <img {...imageProps} />
}
