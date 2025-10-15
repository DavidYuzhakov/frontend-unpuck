'use client'

import { Avatar } from '@/components/ui/avatar'
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

interface DealManagementProps {
  deals: Deal[]
  onViewDeal: (deal: Deal) => void
  onUpdateDealStatus: (dealId: string, status: DealStatus) => void
  onResolveDispute: (dealId: string, resolution: string) => void
  onCloseDeal: (dealId: string) => void
  onOpenDeal: (dealId: string) => void
  onCancelDeal: (dealId: string) => void
  onDisputeDeal: (dealId: string) => void
}

export function DealManagementMobile({ 
  deals,
  onViewDeal, 
  onUpdateDealStatus, 
  onResolveDispute,
  onCloseDeal,
  onOpenDeal,
  onCancelDeal,
  onDisputeDeal
}: DealManagementProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [showFilters, setShowFilters] = useState(false)
  const [activeFilter, setActiveFilter] = useState<'pending' | 'active' | 'completed' | 'all'>('all')

  const statuses = [
    { value: 'all', label: 'Все статусы' },
    { value: 'PENDING', label: 'Ожидает подтверждения' },
    { value: 'CONFIRMED', label: 'Подтверждена' },
    { value: 'SHIPPED', label: 'Отправлена' },
    { value: 'COMPLETED', label: 'Завершена' },
    { value: 'CANCELLED', label: 'Отменена' },
  ]

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         deal.buyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         deal.seller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         deal.id.includes(searchQuery)
    
    // Фильтр по статусу из выпадающего списка
    const matchesStatus = selectedStatus === 'all' || deal.status === selectedStatus
    
    // Фильтр по кнопкам (Ожидают, Активные, Завершены)
    let matchesActiveFilter = true
    if (activeFilter === 'pending') {
      matchesActiveFilter = deal.status === 'PENDING'
    } else if (activeFilter === 'active') {
      matchesActiveFilter = ['CONFIRMED', 'SHIPPED'].includes(deal.status)
    } else if (activeFilter === 'completed') {
      matchesActiveFilter = deal.status === 'COMPLETED'
    }
    
    return matchesSearch && matchesStatus && matchesActiveFilter
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <ClockIcon className="h-4 w-4" />
      case 'CONFIRMED': return <CheckCircleIcon className="h-4 w-4" />
      case 'SHIPPED': return <TruckIcon className="h-4 w-4" />
      case 'COMPLETED': return <CheckCircleIcon className="h-4 w-4" />
      case 'CANCELLED': return <XCircleIcon className="h-4 w-4" />
      default: return <ClockIcon className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800'
      case 'SHIPPED': return 'bg-purple-100 text-purple-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Ожидает подтверждения'
      case 'CONFIRMED': return 'Подтверждена'
      case 'SHIPPED': return 'Отправлена'
      case 'COMPLETED': return 'Завершена'
      case 'CANCELLED': return 'Отменена'
      default: return status
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'card': return 'Карта'
      case 'wallet': return 'Кошелек'
      case 'crypto': return 'Криптовалюта'
      default: return method
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Заголовок и статистика */}
      <div className="flex flex-col space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Управление сделками</h2>
          <p className="text-sm sm:text-base text-gray-600">Всего сделок: {deals.length}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveFilter('pending')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              activeFilter === 'pending'
                ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Ожидают: {deals.filter(d => d.status === 'PENDING').length}
          </button>
          <button
            onClick={() => setActiveFilter('active')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              activeFilter === 'active'
                ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Активные: {deals.filter(d => ['CONFIRMED', 'SHIPPED'].includes(d.status)).length}
          </button>
          <button
            onClick={() => setActiveFilter('completed')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              activeFilter === 'completed'
                ? 'bg-green-100 text-green-800 border-2 border-green-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Завершены: {deals.filter(d => d.status === 'COMPLETED').length}
          </button>
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              activeFilter === 'all'
                ? 'bg-gray-100 text-gray-800 border-2 border-gray-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Все: {deals.length}
          </button>
        </div>
      </div>

      {/* Поиск и фильтры */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск сделок..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {statuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="date">По дате</option>
              <option value="price">По сумме</option>
              <option value="buyer">По покупателю</option>
              <option value="seller">По продавцу</option>
            </select>
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center px-3 py-2 text-sm"
            >
              <FunnelIcon className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Фильтры</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Список сделок */}
      <div className="space-y-4">
        {sortedDeals.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">Сделки не найдены</p>
          </Card>
        ) : (
          sortedDeals.map((deal) => (
            <Card key={deal.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col space-y-3">
                {/* Заголовок сделки */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {deal.product.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">ID: {deal.id.slice(0, 8)}...</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(deal.status)}`}>
                      {getStatusIcon(deal.status)}
                      <span className="ml-1 hidden sm:inline">{getStatusLabel(deal.status)}</span>
                    </span>
                  </div>
                </div>

                {/* Информация о сделке */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center space-x-2">
                    <Avatar
                      name={deal.buyer.name}
                      src={(deal.buyer as any).avatar}
                      size={16}
                      className="flex-shrink-0"
                    />
                    <div>
                      <span className="text-gray-500">Покупатель:</span>
                      <p className="font-medium truncate">{deal.buyer.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Avatar
                      name={deal.seller.name}
                      src={deal.seller.avatar}
                      size={16}
                      className="flex-shrink-0"
                    />
                    <div>
                      <span className="text-gray-500">Продавец:</span>
                      <p className="font-medium truncate">{deal.seller.name}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Сумма:</span>
                    <p className="font-medium text-blue-600">{deal.totalPrice.toLocaleString()} ₽</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Оплата:</span>
                    <p className="font-medium">{getPaymentMethodLabel(deal.paymentMethod)}</p>
                  </div>
                </div>

                {/* Количество и дата */}
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Количество: {deal.quantity}</span>
                  <span>{new Date(deal.createdAt).toLocaleDateString()}</span>
                </div>

                {/* Действия */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewDeal(deal)}
                    className="flex-1 sm:flex-none text-xs"
                  >
                    <EyeIcon className="h-3 w-3 mr-1" />
                    Просмотр
                  </Button>
                  
                  {/* Кнопки в зависимости от статуса */}
                  {deal.status === 'PENDING' && (
                    <>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => onUpdateDealStatus(deal.id, 'CONFIRMED')}
                        className="flex-1 sm:flex-none text-xs"
                      >
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                        Подтвердить
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onCancelDeal(deal.id)}
                        className="flex-1 sm:flex-none text-xs"
                      >
                        <XCircleIcon className="h-3 w-3 mr-1" />
                        Отменить
                      </Button>
                    </>
                  )}
                  
                  {deal.status === 'CONFIRMED' && (
                    <>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => onUpdateDealStatus(deal.id, 'SHIPPED')}
                        className="flex-1 sm:flex-none text-xs"
                      >
                        <TruckIcon className="h-3 w-3 mr-1" />
                        Отправить
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onCancelDeal(deal.id)}
                        className="flex-1 sm:flex-none text-xs"
                      >
                        <XCircleIcon className="h-3 w-3 mr-1" />
                        Отменить
                      </Button>
                    </>
                  )}
                  
                  {deal.status === 'SHIPPED' && (
                    <>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => onUpdateDealStatus(deal.id, 'COMPLETED')}
                        className="flex-1 sm:flex-none text-xs"
                      >
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                        Доставлено
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDisputeDeal(deal.id)}
                        className="flex-1 sm:flex-none text-xs"
                      >
                        <XCircleIcon className="h-3 w-3 mr-1" />
                        Спор
                      </Button>
                    </>
                  )}
                  
                  {deal.status === 'COMPLETED' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onOpenDeal(deal.id)}
                      className="flex-1 sm:flex-none text-xs"
                    >
                      <ClockIcon className="h-3 w-3 mr-1" />
                      Открыть
                    </Button>
                  )}
                  
                  {deal.status === 'CANCELLED' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onOpenDeal(deal.id)}
                      className="flex-1 sm:flex-none text-xs"
                    >
                      <ClockIcon className="h-3 w-3 mr-1" />
                      Открыть
                    </Button>
                  )}
                  
                  {deal.status === 'DISPUTED' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onResolveDispute(deal.id, 'Спор разрешен в пользу покупателя')}
                      className="flex-1 sm:flex-none text-xs"
                    >
                      <CheckCircleIcon className="h-3 w-3 mr-1" />
                      Разрешить спор
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
