'use client'

import { Button } from '@/components/ui/button'
import { Product } from '@/types'
import { PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface ProductViewModalProps {
  product: Product
  onClose: () => void
}

export function ProductViewModal({ product, onClose }: ProductViewModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Просмотр товара
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Изображения */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Изображения
              </h3>
              {product.images && product.images.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {product.images.map((image, index) => (
                    <div
                      key={index}
                      className="aspect-square bg-gray-100 rounded-lg overflow-hidden"
                    >
                      <img
                        src={image}
                        alt={`${product.title} - изображение ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">Нет изображений</span>
                </div>
              )}
            </div>

            {/* Информация о товаре */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {product.title}
                </h3>
                <p className="text-gray-600">{product.description}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-green-600">
                    ₽{product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && (
                    <span className="text-lg text-gray-500 line-through">
                      ₽{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      product.inStock
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {product.inStock ? 'В наличии' : 'Нет в наличии'}
                  </span>
                  <span className="text-sm text-gray-500">
                    Рейтинг: {product.rating}/5 ({product.reviewsCount} отзывов)
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Категория:
                    </span>
                    <span className="text-sm text-gray-900 capitalize">
                      {product.category}
                    </span>
                  </div>
                  {product.subcategory && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">
                        Подкатегория:
                      </span>
                      <span className="text-sm text-gray-900 capitalize">
                        {product.subcategory}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Продавец:
                    </span>
                    <span className="text-sm text-gray-900">
                      {product.seller.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Создан:
                    </span>
                    <span className="text-sm text-gray-900">
                      {new Date(product.createdAt).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Обновлен:
                    </span>
                    <span className="text-sm text-gray-900">
                      {new Date(product.updatedAt).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                </div>

                {product.tags && product.tags.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-600 block mb-2">
                      Теги:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
