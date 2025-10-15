'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Product } from '@/types'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import { ImageUpload } from '../admin/image-upload'

interface ProductCreateModalProps {
  onClose: () => void
  onSave: (product: Product) => void
}

const CATEGORIES = [
  'electronics',
  'clothing',
  'home',
  'beauty',
  'sports',
  'books',
  'toys',
  'automotive',
  'jewelry',
  'food',
  'health',
  'office',
]

const SUBCATEGORIES = {
  electronics: ['smartphones', 'laptops', 'headphones', 'cameras', 'tablets'],
  clothing: ['shirts', 'dresses', 'pants', 'shoes', 'accessories'],
  home: ['furniture', 'decor', 'kitchen', 'bedding', 'lighting'],
  beauty: ['skincare', 'makeup', 'fragrance', 'haircare', 'tools'],
  sports: [
    'fitness',
    'outdoor',
    'team-sports',
    'water-sports',
    'winter-sports',
  ],
  books: ['fiction', 'non-fiction', 'textbooks', 'children', 'comics'],
  toys: ['action-figures', 'dolls', 'games', 'educational', 'outdoor'],
  automotive: ['parts', 'accessories', 'tools', 'maintenance', 'electronics'],
  jewelry: ['rings', 'necklaces', 'earrings', 'bracelets', 'watches'],
  food: ['snacks', 'beverages', 'cooking', 'dietary', 'international'],
  health: ['supplements', 'medical', 'fitness', 'wellness', 'personal-care'],
  office: [
    'supplies',
    'furniture',
    'technology',
    'organization',
    'presentation',
  ],
}

export function ProductCreateModal({
  onClose,
  onSave,
}: ProductCreateModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    subcategory: '',
    images: [] as string[],
    isActive: true,
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Название товара обязательно'
    } else if (formData.title.length < 3) {
      newErrors.title = 'Название должно содержать минимум 3 символа'
    }

    if (!formData.category) {
      newErrors.category = 'Категория обязательна'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Описание обязательно'
    } else if (formData.description.length < 10) {
      newErrors.description = 'Описание должно содержать минимум 10 символов'
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Цена должна быть больше 0'
    }

    if (
      formData.originalPrice &&
      parseFloat(formData.originalPrice) <= parseFloat(formData.price)
    ) {
      newErrors.originalPrice =
        'Оригинальная цена должна быть больше текущей цены'
    }

    if (formData.images.length === 0) {
      newErrors.images = 'Добавьте хотя бы одно изображение'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const productData: Product = {
        id: '', // Будет установлен сервером
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice
          ? parseFloat(formData.originalPrice)
          : undefined,
        category: formData.category,
        subcategory: formData.subcategory || undefined,
        images: formData.images,
        rating: 0,
        reviewsCount: 0,
        inStock: formData.isActive,
        tags: [],
        seller: {
          id: 'current_user',
          name: 'Текущий пользователь',
          verified: true,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await onSave(productData)
    } catch (error) {
      console.error('Ошибка при создании товара:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUploaded = (imagePath: string) => {
    if (formData.images.length < 5 && !formData.images.includes(imagePath)) {
      setFormData({ ...formData, images: [...formData.images, imagePath] })
      if (errors.images) {
        setErrors({ ...errors, images: '' })
      }
    }
  }

  const handleCategoryChange = (category: string) => {
    setFormData({
      ...formData,
      category,
      subcategory: '',
    })
    if (errors.category) {
      setErrors({ ...errors, category: '' })
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Создать товар</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Основная информация */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Название товара *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value })
                    if (errors.title) {
                      setErrors({ ...errors, title: '' })
                    }
                  }}
                  placeholder="Введите название товара"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <Label htmlFor="category">Категория *</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Выберите категорию</option>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                )}
              </div>

              {formData.category &&
                SUBCATEGORIES[
                  formData.category as keyof typeof SUBCATEGORIES
                ] && (
                  <div>
                    <Label htmlFor="subcategory">Подкатегория</Label>
                    <select
                      id="subcategory"
                      value={formData.subcategory}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          subcategory: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Выберите подкатегорию</option>
                      {SUBCATEGORIES[
                        formData.category as keyof typeof SUBCATEGORIES
                      ].map((subcategory) => (
                        <option key={subcategory} value={subcategory}>
                          {subcategory.charAt(0).toUpperCase() +
                            subcategory.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

              <div>
                <Label htmlFor="price">Цена (₽) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => {
                    setFormData({ ...formData, price: e.target.value })
                    if (errors.price) {
                      setErrors({ ...errors, price: '' })
                    }
                  }}
                  placeholder="0.00"
                  className={errors.price ? 'border-red-500' : ''}
                />
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                )}
              </div>

              <div>
                <Label htmlFor="originalPrice">Оригинальная цена (₽)</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.originalPrice}
                  onChange={(e) => {
                    setFormData({ ...formData, originalPrice: e.target.value })
                    if (errors.originalPrice) {
                      setErrors({ ...errors, originalPrice: '' })
                    }
                  }}
                  placeholder="0.00"
                  className={errors.originalPrice ? 'border-red-500' : ''}
                />
                {errors.originalPrice && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.originalPrice}
                  </p>
                )}
              </div>
            </div>

            {/* Описание */}
            <div>
              <Label htmlFor="description">Описание *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value })
                  if (errors.description) {
                    setErrors({ ...errors, description: '' })
                  }
                }}
                placeholder="Подробное описание товара"
                rows={4}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Изображения */}
            <div className="space-y-4">
              <Label>Изображения товара *</Label>

              {/* Показ загруженных изображений */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {formData.images.map((image, index) => (
                    <div key={index + '-' + index} className="relative">
                      <img
                        src={
                          image.startsWith('/uploads')
                            ? `${process.env.NEXT_PUBLIC_API_URL}${image}`
                            : image
                        }
                        alt={`Изображение ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = formData.images.filter(
                            (_, i) => i !== index
                          )
                          setFormData({ ...formData, images: newImages })
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {errors.images && (
                <p className="text-red-500 text-sm mt-1">{errors.images}</p>
              )}

              <ImageUpload
                category="product"
                onImageUploaded={handleImageUploaded}
              />

              <p className="text-sm text-gray-500">
                Можно добавить до 5 изображений. Первое изображение будет
                главным.
              </p>
            </div>

            {/* Статус */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="rounded"
              />
              <Label htmlFor="isActive">Товар активен</Label>
            </div>

            {/* Кнопки */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Создание...' : 'Создать товар'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
