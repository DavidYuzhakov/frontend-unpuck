'use client'

import { Label } from '@/components/ui/label'
import { SafeImage } from '@/components/ui/safe-image'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'

interface ImageSelectorProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
}

interface ImageOption {
  id: string
  filename: string
  localPath: string
  category: string
}

export function ImageSelector({
  images,
  onChange,
  maxImages = 5,
}: ImageSelectorProps) {
  const [availableImages, setAvailableImages] = useState<ImageOption[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Загружаем доступные изображения
  useEffect(() => {
    const loadImages = async () => {
      try {
        // В TWA используем моковые данные
        if (
          typeof window !== 'undefined' &&
          (window.location.hostname.includes('t.me') || window.Telegram?.WebApp)
        ) {
          setAvailableImages([
            {
              id: '1',
              filename: 'product-1.jpg',
              localPath:
                'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
              category: 'product',
            },
            {
              id: '2',
              filename: 'product-2.jpg',
              localPath:
                'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
              category: 'product',
            },
            {
              id: '3',
              filename: 'product-3.jpg',
              localPath:
                'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
              category: 'product',
            },
            {
              id: '4',
              filename: 'product-4.jpg',
              localPath:
                'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400',
              category: 'product',
            },
            {
              id: '5',
              filename: 'product-5.jpg',
              localPath:
                'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400',
              category: 'product',
            },
          ])
          return
        }

        const response = await fetch('/api/images/category/product')
        if (response.ok) {
          const data = await response.json()
          setAvailableImages(data.data || [])
        } else {
          throw new Error('API не доступен')
        }
      } catch (error) {
        // Fallback на локальные изображения
        setAvailableImages([
          {
            id: '1',
            filename: 'product-watch-1.jpg',
            localPath: '/images/products/product-watch-1.jpg',
            category: 'product',
          },
          {
            id: '2',
            filename: 'product-headphones-1.jpg',
            localPath: '/images/products/product-headphones-1.jpg',
            category: 'product',
          },
          {
            id: '3',
            filename: 'product-shoes-1.jpg',
            localPath: '/images/products/product-shoes-1.jpg',
            category: 'product',
          },
          {
            id: '4',
            filename: 'product-phone-1.jpg',
            localPath: '/images/products/product-phone-1.jpg',
            category: 'product',
          },
          {
            id: '5',
            filename: 'product-glasses-1.jpg',
            localPath: '/images/products/product-glasses-1.jpg',
            category: 'product',
          },
          {
            id: '6',
            filename: 'product-laptop-1.jpg',
            localPath: '/images/products/product-laptop-1.jpg',
            category: 'product',
          },
          {
            id: '7',
            filename: 'product-camera-1.jpg',
            localPath: '/images/products/product-camera-1.jpg',
            category: 'product',
          },
          {
            id: '8',
            filename: 'product-bag-1.jpg',
            localPath: '/images/products/product-bag-1.jpg',
            category: 'product',
          },
          {
            id: '9',
            filename: 'product-perfume-1.jpg',
            localPath: '/images/products/product-perfume-1.jpg',
            category: 'product',
          },
          {
            id: '10',
            filename: 'product-jewelry-1.jpg',
            localPath: '/images/products/product-jewelry-1.jpg',
            category: 'product',
          },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    loadImages()
  }, [])

  const handleAddImage = (imagePath: string) => {
    if (images.length < maxImages && !images.includes(imagePath)) {
      onChange([...images, imagePath])
    }
  }

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onChange(newImages)
  }

  const handleMoveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images]

    const [movedImage] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, movedImage)
    onChange(newImages)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Изображения товара</Label>
          <div className="text-sm text-gray-500">Загрузка...</div>
        </div>
        <div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Изображения товара</Label>
        <div className="text-sm text-gray-500">
          {images.length}/{maxImages}
        </div>
      </div>

      {/* Превью выбранных изображений */}
      {images.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Выбранные изображения:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {images.map((image, index) => (
              <div key={`${image}-${index}`} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                  <SafeImage
                    src={image}
                    alt={`Изображение ${index + 1}`}
                    width={400}
                    height={400}
                    className="w-full h-full object-cover"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                    {index > 0 && (
                      <button
                        onClick={() => handleMoveImage(index, index - 1)}
                        className="p-1 bg-white rounded-full shadow-lg"
                        title="Переместить влево"
                      >
                        ←
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="bg-red-500 text-white rounded-full shadow-lg relative"
                      title="Удалить"
                    >
                      <XMarkIcon className="h-4 w-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </button>
                    {index < images.length - 1 && (
                      <button
                        onClick={() => handleMoveImage(index, index + 1)}
                        className="p-1 bg-white rounded-full shadow-lg"
                        title="Переместить вправо"
                      >
                        →
                      </button>
                    )}
                  </div>
                </div>
                {index === 0 && (
                  <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                    Главное
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Доступные изображения для выбора */}
      {images.length < maxImages && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Доступные изображения:
          </p>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2 max-h-40 overflow-y-auto border rounded-lg p-2">
            {availableImages
              .filter((img) => !images.includes(img.localPath))
              .map((image) => (
                <button
                  key={image.id}
                  onClick={() => handleAddImage(image.localPath)}
                  className="aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all duration-200"
                >
                  <SafeImage
                    src={image.localPath}
                    alt={image.filename}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                    sizes="(max-width: 768px) 25vw, 16vw"
                  />
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Подсказки */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Можно добавить до {maxImages} изображений</p>
        <p>• Первое изображение будет главным</p>
        <p>• Наведите на изображение для управления порядком</p>
      </div>
    </div>
  )
}
