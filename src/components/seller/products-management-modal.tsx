'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Product } from '@/types'
import {
  EyeIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { useState } from 'react'
import { ProductCreateModal } from './product-create-modal'
import { ProductEditModal } from './product-edit-modal'
import { ProductViewModal } from './product-view-modal'
import { EnhancedProductModal } from '../admin/enhanced-product-modal'

interface ProductsManagementModalProps {
  isOpen: boolean
  onClose: () => void
  products: Product[]
  onProductCreate: (product: Product) => void
  onProductUpdate: (product: Product) => void
  onProductDelete: (productId: string) => void
}

export function ProductsManagementModal({
  isOpen,
  onClose,
  products,
  onProductCreate,
  onProductUpdate,
  onProductDelete,
}: ProductsManagementModalProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  if (!isOpen) return null

  const handleCreateProduct = () => {
    setSelectedProduct(null)
    setShowCreateModal(true)
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setShowEditModal(true)
  }

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product)
    setShowViewModal(true)
  }

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Вы уверены, что хотите удалить этот товар?')) {
      onProductDelete(productId)
    }
  }

  const handleProductCreated = (product: Product) => {
    onProductCreate(product)
    setShowCreateModal(false)
  }

  const handleProductUpdated = (product: Product) => {
    onProductUpdate(product)
    setShowEditModal(false)
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Управление товарами
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

            <Button
              onClick={handleCreateProduct}
              className="bg-blue-600 hover:bg-blue-700 mb-5"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Добавить товар
            </Button>
            {products.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PlusIcon className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  У вас пока нет товаров
                </h3>
                <p className="text-gray-500 mb-4">
                  Создайте свой первый товар, чтобы начать продажи
                </p>
                <Button
                  onClick={handleCreateProduct}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Создать товар
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <Card
                    key={product.id}
                    className="p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="space-y-3">
                      {/* Изображение товара */}
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-gray-400 text-sm">
                              Нет изображения
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Информация о товаре */}
                      <div className="space-y-2">
                        <h3
                          className="font-medium text-gray-900 overflow-hidden"
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {product.title}
                        </h3>
                        <p
                          className="text-sm text-gray-600 overflow-hidden"
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-green-600">
                            ₽{product.price.toLocaleString()}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              product.inStock
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {product.inStock ? 'В наличии' : 'Нет в наличии'}
                          </span>
                        </div>
                      </div>

                      {/* Действия */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditProduct(product)}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewProduct(product)}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Модалки создания и редактирования */}
      {showCreateModal && (
        <EnhancedProductModal
          product={null}
          mode="create"
          onClose={() => setShowCreateModal(false)}
          onSave={handleProductCreated}
        />
      )}

      {showEditModal && selectedProduct && (
        <EnhancedProductModal
          product={selectedProduct}
          mode="edit"
          onClose={() => setShowEditModal(false)}
          onSave={handleProductUpdated}
        />
      )}

      {showViewModal && selectedProduct && (
        <ProductViewModal
          product={selectedProduct}
          onClose={() => setShowViewModal(false)}
        />
      )}
    </>
  )
}
