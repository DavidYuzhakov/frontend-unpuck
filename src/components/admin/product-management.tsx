'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Product, ProductCategory } from '@/types'
import {
  EyeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { useState } from 'react'

interface ProductManagementProps {
  products: Product[]
  onEditProduct: (product: Product) => void
  onDeleteProduct: (productId: string) => void
  onViewProduct: (product: Product) => void
  onCreateProduct: () => void
}

interface ICategory {
  label: string
  value: ProductCategory
}

export function ProductManagement({
  products,
  onEditProduct,
  onDeleteProduct,
  onViewProduct,
  onCreateProduct,
}: ProductManagementProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('date')

  const categories: ICategory[] = [
    { value: 'all', label: 'Все' },
    { value: 'clothing', label: 'Обувь' },
    { value: 'electronics', label: 'Электроника' },
    { value: 'beauty', label: 'Красота' },
    { value: 'home', label: 'Дом' },
  ]

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price
      case 'name':
        return a.title.localeCompare(b.title)
      case 'rating':
        return b.rating - a.rating
      case 'date':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  console.log(products)

  return (
    <div className="space-y-6">
      {/* Заголовок и действия */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Управление товарами
          </h2>
          <p className="text-gray-600">Всего товаров: {products.length}</p>
        </div>
        <Button className="w-full sm:w-auto" onClick={onCreateProduct}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Добавить товар
        </Button>
      </div>

      {/* Поиск и фильтры */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск товаров..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">По дате</option>
              <option value="name">По названию</option>
              <option value="price">По цене</option>
              <option value="rating">По рейтингу</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Список товаров */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedProducts.map((product) => (
          <Card
            key={product.id}
            className="overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="aspect-square bg-gray-100 relative">
              {product.images[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  Нет изображения
                </div>
              )}
              <div className="absolute top-2 right-2">
                <Badge variant={product.inStock ? 'default' : 'destructive'}>
                  {product.inStock ? 'В наличии' : 'Нет в наличии'}
                </Badge>
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                {product.title}
              </h3>

              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-1">
                  <span className="text-lg font-bold text-blue-600">
                    {product.price.toLocaleString()} ₽
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      {product.originalPrice.toLocaleString()} ₽
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-sm text-gray-600">★</span>
                  <span className="text-sm font-medium">{product.rating}</span>
                  <span className="text-xs text-gray-500">
                    ({product.reviewsCount})
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                <span>{product.category}</span>
                <span>{product.seller.firstName}</span>
              </div>

              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onViewProduct(product)}
                  className="flex-1"
                >
                  <EyeIcon className="h-4 w-4 mr-1" />
                  Просмотр
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEditProduct(product)}
                  className="flex-1"
                >
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Редактировать
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDeleteProduct(product.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {sortedProducts.length === 0 && (
        <Card className="p-8 text-center">
          <div className="text-gray-400 mb-4">
            <MagnifyingGlassIcon className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Товары не найдены
          </h3>
          <p className="text-gray-600">
            Попробуйте изменить параметры поиска или фильтры
          </p>
        </Card>
      )}
    </div>
  )
}
