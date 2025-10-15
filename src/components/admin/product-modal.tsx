'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Product } from '@/types'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

interface ProductModalProps {
  product: Product | null
  mode: 'create' | 'edit'
  onClose: () => void
  onSave: (product: Product) => void
}

export function ProductModal({ product, mode, onClose, onSave }: ProductModalProps) {
  const [formData, setFormData] = useState({
    title: product?.title || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    category: product?.category || '',
    subcategory: product?.subcategory || '',
    images: product?.images?.join(',') || '',
    isActive: product?.inStock ?? true,
  })

  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Валидация обязательных полей
    const invalid = !formData.title.trim() || !formData.category.trim() || !formData.description.trim() || !formData.price || parseInt(formData.price) <= 0
    if (invalid) {
      setLoading(false)
      return
    }

    try {
      const productData: Product = {
        id: product?.id || '',
        title: formData.title,
        description: formData.description,
        price: parseInt(formData.price) || 0,
        originalPrice: parseInt(formData.price) || 0,
        category: formData.category,
        subcategory: formData.subcategory,
        images: formData.images ? formData.images.split(',').map(url => url.trim()) : [],
        rating: product?.rating || 4.5,
        reviewsCount: product?.reviewsCount || 0,
        seller: product?.seller || {
          id: '',
          name: 'Администратор',
          avatar: '/avatars/admin.jpg',
          verified: true,
        },
        inStock: formData.isActive,
        tags: product?.tags || [],
        createdAt: product?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      onSave(productData)
    } catch (error) {
      console.error('Ошибка сохранения товара:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            {mode === 'create' ? 'Добавить товар' : 'Редактировать товар'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="title">Название товара</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Введите название товара"
                required
              />
            </div>

            <div>
              <Label htmlFor="price">Цена (₽)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0"
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Категория</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Электроника, Одежда, Обувь..."
                required
              />
            </div>

            {/* Удалено поле Артикул WB */}

            <div>
              <Label htmlFor="subcategory">Подкатегория</Label>
              <Input
                id="subcategory"
                value={formData.subcategory}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                placeholder="Смартфоны, Платья, Кроссовки..."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Подробное описание товара"
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="images">Изображения (URL через запятую)</Label>
            <Input
              id="images"
              value={formData.images}
              onChange={(e) => setFormData({ ...formData, images: e.target.value })}
              placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <Label htmlFor="isActive">Товар активен</Label>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Сохранение...' : mode === 'create' ? 'Создать' : 'Сохранить'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}