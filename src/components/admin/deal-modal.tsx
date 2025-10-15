'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Deal, DealStatus } from '@/types'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

interface DealModalProps {
  deal: Deal
  onClose: () => void
  onUpdate: (deal: Deal) => void
}

export function DealModal({ deal, onClose, onUpdate }: DealModalProps) {
  const [formData, setFormData] = useState({
    status: deal.status,
    trackingNumber: deal.trackingNumber || '',
  })

  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const updatedDeal: Deal = {
        ...deal,
        status: formData.status as DealStatus,
        trackingNumber: formData.trackingNumber,
        updatedAt: new Date().toISOString(),
      }

      onUpdate(updatedDeal)
    } catch (error) {
      console.error('Ошибка обновления сделки:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">Управление сделкой</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Информация о сделке */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Информация о сделке</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">ID сделки:</span>
                <p className="font-medium">{deal.id}</p>
              </div>
              <div>
                <span className="text-gray-600">Сумма:</span>
                <p className="font-medium">{deal.totalPrice.toLocaleString()} ₽</p>
              </div>
              <div>
                <span className="text-gray-600">Покупатель:</span>
                <p className="font-medium">{deal.buyer.name}</p>
              </div>
              <div>
                <span className="text-gray-600">Продавец:</span>
                <p className="font-medium">{deal.seller.name}</p>
              </div>
              <div>
                <span className="text-gray-600">Товар:</span>
                <p className="font-medium">{deal.product.title}</p>
              </div>
              <div>
                <span className="text-gray-600">Дата создания:</span>
                <p className="font-medium">{new Date(deal.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Форма управления */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="status">Статус сделки</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as DealStatus })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="PENDING">Ожидает подтверждения</option>
                <option value="CONFIRMED">Подтверждена</option>
                <option value="SHIPPED">Отправлена</option>
                <option value="COMPLETED">Завершена</option>
                <option value="CANCELLED">Отменена</option>
                <option value="DISPUTED">Спор</option>
              </select>
            </div>

            <div>
              <Label htmlFor="trackingNumber">Номер отслеживания</Label>
              <Input
                id="trackingNumber"
                value={formData.trackingNumber}
                onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                placeholder="Введите номер отслеживания"
              />
            </div>


            <div className="flex justify-end space-x-3 pt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Отмена
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Сохранение...' : 'Сохранить изменения'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}