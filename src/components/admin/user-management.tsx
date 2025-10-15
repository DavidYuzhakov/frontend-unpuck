'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { UserRole } from '@/hooks/use-role'
import { AdminUser } from '@/types'
import { getRoleText } from '@/utils/getRoleText'
import {
  EyeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline'
import { useState } from 'react'

// Компонент для управления пользователями

interface UserManagementProps {
  users: AdminUser[]
  onEditUser: (user: AdminUser) => void
  onBlockUser: (userId: string, reason: string) => void
  onUnblockUser: (userId: string) => void
  onVerifyUser: (userId: string) => void
  onCreateUser: () => void
}

interface IRole {
  value: UserRole | 'all'
  label: string
}

export function UserManagement({
  users,
  onEditUser,
  onBlockUser,
  onUnblockUser,
  onVerifyUser,
  onCreateUser,
}: UserManagementProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState<IRole['value']>('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [sortBy, setSortBy] = useState('date')

  const roles: IRole[] = [
    { value: 'all', label: 'Все роли' },
    { value: 'SELLER', label: 'Продавцы' },
    { value: 'BLOGGER', label: 'Блогеры' },
    { value: 'BUYER', label: 'Покупатели' },
    { value: 'MANAGER', label: 'Менеджеры' },
  ]

  const statuses = [
    { value: 'all', label: 'Все статусы' },
    { value: 'verified', label: 'Верифицированные' },
    { value: 'unverified', label: 'Не верифицированные' },
    { value: 'blocked', label: 'Заблокированные' },
  ]

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.includes(searchQuery)

    const matchesRole = selectedRole === 'all' || user.role === selectedRole

    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'verified' && user.isVerified) ||
      (selectedStatus === 'unisVerified' && !user.isVerified) ||
      (selectedStatus === 'blocked' && user.isBlocked)
    return matchesSearch && matchesRole && matchesStatus
  })

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        const aName = a.firstName ?? ''
        const bName = b.firstName ?? ''
        return aName.localeCompare(bName)
      case 'spent':
        return (b.totalSpent || 0) - (a.totalSpent || 0)
      case 'earned':
        return (b.totalEarned || 0) - (a.totalEarned || 0)
      case 'deals':
        return (b.dealsCount || 0) - (a.dealsCount || 0)
      case 'date':
      default:
        return (
          new Date(b.createdAt || '').getTime() -
          new Date(a.createdAt || '').getTime()
        )
    }
  })

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'seller':
        return 'default'
      case 'blogger':
        return 'secondary'
      case 'buyer':
        return 'outline'
      case 'manager':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и действия */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Управление пользователями
          </h2>
          <p className="text-gray-600">Всего пользователей: {users.length}</p>
        </div>
        <Button className="w-full sm:w-auto" onClick={onCreateUser}>
          <UserPlusIcon className="h-4 w-4 mr-2" />
          Добавить пользователя
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
                placeholder="Поиск пользователей..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={selectedRole}
              onChange={(e) =>
                setSelectedRole(e.target.value as IRole['value'])
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>

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
              <option value="date">По дате регистрации</option>
              <option value="name">По имени</option>
              <option value="spent">По потраченному</option>
              <option value="earned">По заработанному</option>
              <option value="deals">По количеству сделок</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Список пользователей */}
      <div className="space-y-3">
        {sortedUsers.map((user) => (
          <Card
            key={user.id}
            className="p-4 hover:shadow-sm transition-shadow space-y-3"
          >
            <div className="flex items-center space-x-4 flex-wrap">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.firstName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-600">
                    {user.firstName?.substring(0, 5).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 shrink-0 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {user.firstName}
                </h3>
                <p className="text-sm text-gray-500 truncate">{user.email}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge
                    variant={getRoleBadgeVariant(user.role)}
                    className="text-xs"
                  >
                    {getRoleText(user.role)}
                  </Badge>
                  {user.isVerified && (
                    <ShieldCheckIcon className="h-4 w-4 text-green-500" />
                  )}
                  {user.isBlocked && (
                    <ShieldExclamationIcon className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
            </div>
            <div className="flex space-x-1 justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEditUser(user)}
                className="h-8 w-8 p-0"
              >
                <PencilIcon className="h-4 w-4" />
              </Button>
              {!user.isVerified && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onVerifyUser(user.id)}
                  className="h-8 w-8 p-0"
                >
                  <ShieldCheckIcon className="h-4 w-4" />
                </Button>
              )}
              {user.isBlocked ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUnblockUser(user.id)}
                  className="h-8 px-2 text-xs"
                >
                  Разблокировать
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onBlockUser(user.id, 'Test')}
                  className="h-8 w-8 p-0"
                >
                  <ShieldExclamationIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {sortedUsers.length === 0 && (
        <Card className="p-8 text-center">
          <div className="text-gray-400 mb-4">
            <MagnifyingGlassIcon className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Пользователи не найдены
          </h3>
          <p className="text-gray-600">
            Попробуйте изменить параметры поиска или фильтры
          </p>
        </Card>
      )}
    </div>
  )
}
