'use client'

import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Deal, DealStatus } from '@/types'
import {
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  TruckIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'
import { useState } from 'react'

// Компонент для управления сделками

interface DealManagementProps {
  deals: Deal[]
  onViewDeal: (deal: Deal) => void
  onUpdateDealStatus: (dealId: string, status: DealStatus) => void
  onResolveDispute: (dealId: string, resolution: string) => void
}

export function DealManagement({
  deals,
  onViewDeal,
  onUpdateDealStatus,
  onResolveDispute,
}: DealManagementProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [showFilters, setShowFilters] = useState(false)

  const statuses = [
    { value: 'all', label: 'Все статусы' },
    { value: 'pending', label: 'Ожидает подтверждения' },
    { value: 'confirmed', label: 'Подтверждена' },
    { value: 'shipped', label: 'Отправлена' },
    { value: 'completed', label: 'Завершена' },
    { value: 'cancelled', label: 'Отменена' },
  ]

  const filteredDeals = deals.filter((deal) => {
    const matchesSearch =
      deal.product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.buyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.seller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.id.includes(searchQuery)
    const matchesStatus =
      selectedStatus === 'all' || deal.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const sortedDeals = [...filteredDeals].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return b.totalPrice - a.totalPrice
      case 'buyer':
        return a.buyer.name.localeCompare(b.buyer.name)
      case 'seller':
        return a.seller.name.localeCompare(b.seller.name)
      case 'date':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  const getStatusBadgeVariant = (status: DealStatus) => {
    switch (status) {
      case 'PENDING':
        return 'secondary'
      case 'CONFIRMED':
        return 'default'
      case 'SHIPPED':
        return 'outline'
      case 'COMPLETED':
        return 'default'
      case 'CANCELLED':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getStatusLabel = (status: DealStatus) => {
    switch (status) {
      case 'PENDING':
        return 'Ожидает подтверждения'
      case 'CONFIRMED':
        return 'Подтверждена'
      case 'SHIPPED':
        return 'Отправлена'
      case 'COMPLETED':
        return 'Завершена'
      case 'CANCELLED':
        return 'Отменена'
      default:
        return status
    }
  }

  const getStatusIcon = (status: DealStatus) => {
    switch (status) {
      case 'PENDING':
        return ClockIcon
      case 'CONFIRMED':
        return CheckCircleIcon
      case 'SHIPPED':
        return TruckIcon
      case 'COMPLETED':
        return CheckCircleIcon
      case 'CANCELLED':
        return XCircleIcon
      default:
        return ClockIcon
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'card':
        return 'Карта'
      case 'wallet':
        return 'Кошелек'
      case 'crypto':
        return 'Криптовалюта'
      default:
        return method
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Заголовок и статистика */}
      <div className="flex flex-col space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Управление сделками
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Всего сделок: {deals.length}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs">
            Ожидают: {deals.filter((d) => d.status === 'PENDING').length}
          </Badge>
          <Badge variant="default" className="text-xs">
            Активные:{' '}
            {
              deals.filter((d) => ['CONFIRMED', 'SHIPPED'].includes(d.status))
                .length
            }
          </Badge>
          <Badge variant="outline" className="text-xs">
            Завершены: {deals.filter((d) => d.status === 'COMPLETED').length}
          </Badge>
        </div>
      </div>

      {/* Поиск и фильтры */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск сделок..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">По дате</option>
              <option value="price">По сумме</option>
              <option value="buyer">По покупателю</option>
              <option value="seller">По продавцу</option>
            </select>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Фильтры
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Сумма от
                </label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Сумма до
                </label>
                <input
                  type="number"
                  placeholder="100000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Способ оплаты
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="all">Все</option>
                  <option value="card">Карта</option>
                  <option value="wallet">Кошелек</option>
                  <option value="crypto">Криптовалюта</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Список сделок */}
      <div className="space-y-4">
        {sortedDeals.map((deal) => {
          const StatusIcon = getStatusIcon(deal.status)
          return (
            <Card key={deal.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    {deal.product.images[0] ? (
                      <img
                        src={deal.product.images[0]}
                        alt={deal.product.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <span className="text-gray-400 text-xs">Нет фото</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 line-clamp-1">
                      {deal.product.title}
                    </h3>
                    <p className="text-sm text-gray-600">ID: {deal.id}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <StatusIcon className="h-5 w-5 text-gray-400" />
                  <Badge variant={getStatusBadgeVariant(deal.status)}>
                    {getStatusLabel(deal.status)}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Покупатель</p>
                  <div className="flex items-center space-x-2">
                    <Avatar
                      name={deal.buyer.name}
                      src={(deal.buyer as any).avatar}
                      size={24}
                      className="flex-shrink-0"
                    />
                    <div>
                      <p className="text-sm font-medium">{deal.buyer.name}</p>
                      <p className="text-xs text-gray-500">
                        {deal.buyer.email}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Продавец</p>
                  <div className="flex items-center space-x-2">
                    <Avatar
                      name={deal.seller.name}
                      src={deal.seller.avatar}
                      size={24}
                      className="flex-shrink-0"
                    />
                    <div>
                      <p className="text-sm font-medium">{deal.seller.name}</p>
                      <p className="text-xs text-gray-500">
                        {deal.seller.email}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Сумма</p>
                  <p className="text-lg font-bold text-blue-600">
                    {deal.totalPrice.toLocaleString()} ₽
                  </p>
                  <p className="text-xs text-gray-500">
                    {getPaymentMethodLabel(deal.paymentMethod)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Количество</p>
                  <p className="text-sm font-medium">{deal.quantity} шт.</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Дата создания</p>
                  <p className="text-sm font-medium">
                    {new Date(deal.createdAt).toLocaleDateString('ru-RU')}
                  </p>
                </div>
              </div>

              {deal.trackingNumber && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Трек-номер:</strong> {deal.trackingNumber}
                  </p>
                </div>
              )}

              {deal.estimatedDelivery && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    <strong>Ожидаемая доставка:</strong>{' '}
                    {new Date(deal.estimatedDelivery).toLocaleDateString(
                      'ru-RU'
                    )}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onViewDeal(deal)}
                >
                  <EyeIcon className="h-4 w-4 mr-1" />
                  Просмотр
                </Button>

                {deal.status === 'PENDING' && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => onUpdateDealStatus(deal.id, 'CONFIRMED')}
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      Подтвердить
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdateDealStatus(deal.id, 'CANCELLED')}
                      className="text-red-600 hover:text-red-700"
                    >
                      <XCircleIcon className="h-4 w-4 mr-1" />
                      Отменить
                    </Button>
                  </>
                )}

                {deal.status === 'CONFIRMED' && (
                  <Button
                    size="sm"
                    onClick={() => onUpdateDealStatus(deal.id, 'SHIPPED')}
                  >
                    <TruckIcon className="h-4 w-4 mr-1" />
                    Отметить отправку
                  </Button>
                )}

                {deal.status === 'SHIPPED' && (
                  <Button
                    size="sm"
                    onClick={() => onUpdateDealStatus(deal.id, 'COMPLETED')}
                  >
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    Отметить доставку
                  </Button>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {sortedDeals.length === 0 && (
        <Card className="p-8 text-center">
          <div className="text-gray-400 mb-4">
            <MagnifyingGlassIcon className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Сделки не найдены
          </h3>
          <p className="text-gray-600">
            Попробуйте изменить параметры поиска или фильтры
          </p>
        </Card>
      )}
    </div>
  )
}
