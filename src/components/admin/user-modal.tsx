'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserRole } from '@/hooks/use-role'
import { useTokenManager } from '@/lib/token-manager'
import { useAuthStore } from '@/store/auth'
import { AdminUser } from '@/types'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

interface UserModalProps {
  user: AdminUser | null
  mode: 'create' | 'edit'
  onClose: () => void
  onSave: (user: UserModalData, userId: string) => void
}

export interface UserModalData {
  firstName: string
  lastName: string
  email: string
  phone: string
  role: UserRole
  isVerified: boolean
  isActive: boolean
}

export function UserModal({ user, mode, onClose, onSave }: UserModalProps) {
  const [formData, setFormData] = useState<UserModalData>({
    firstName: user?.firstName?.split(' ')[0] || '',
    lastName: user?.lastName?.split(' ')[1] || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || 'BUYER',
    isVerified: user?.isVerified || false,
    isActive: user?.isActive || true,
  })
  const { updateUser } = useTokenManager()
  const { updateUser: updateStoreUser } = useAuthStore()

  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const userData: UserModalData = {
        email: formData.email,
        phone: formData.phone,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role.toUpperCase() as UserRole,
        isActive: formData.isActive ?? true,
        isVerified: formData.isVerified ?? false,
      }

      onSave(userData, user?.id || '')
      updateUser({ ...user, userData })
      updateStoreUser(userData)
    } catch (error) {
      console.error('Ошибка сохранения пользователя:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            {mode === 'create'
              ? 'Добавить пользователя'
              : 'Редактировать пользователя'}
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
              <Label htmlFor="firstName">Имя</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                placeholder="Введите имя"
                required
              />
            </div>

            <div>
              <Label htmlFor="lastName">Фамилия</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                placeholder="Введите фамилию"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="user@example.com"
              />
            </div>

            <div>
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                value={formData.phone}
                type="number"
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+7 (999) 123-45-67"
              />
            </div>

            <div>
              <Label htmlFor="role">Роль</Label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value as UserRole,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="BUYER">Покупатель</option>
                <option value="SELLER">Продавец</option>
                <option value="BLOGGER">Блогер</option>
                <option value="ADMIN">Администратор</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isVerified"
                checked={formData.isVerified}
                onChange={(e) =>
                  setFormData({ ...formData, isVerified: e.target.checked })
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <Label htmlFor="isVerified">Пользователь верифицирован</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <Label htmlFor="isActive">Пользователь активен</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 pb-14">
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? 'Сохранение...'
                : mode === 'create'
                ? 'Создать'
                : 'Сохранить'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
