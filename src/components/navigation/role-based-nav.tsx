'use client'

import { useTelegramData } from '@/components/providers/telegram-data-provider'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth'
import {
  ChartBarIcon,
  Cog6ToothIcon,
  MegaphoneIcon,
  ShoppingBagIcon,
  Squares2X2Icon,
  UserGroupIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import { ClientOnly } from '../client-only'

// Определяем вкладки для каждой роли
const getTabsForRole = (role: string) => {
  const baseTabs = [
    {
      id: 'catalog',
      label: 'Каталог',
      icon: Squares2X2Icon,
      href: '/catalog',
    },
    {
      id: 'deals',
      label: 'Сделки',
      icon: ShoppingBagIcon,
      href: '/deals',
    },
    {
      id: 'profile',
      label: 'Профиль',
      icon: UserIcon,
      href: '/profile',
    },
  ]

  switch (role) {
    case 'ADMIN':
      return [
        ...baseTabs,
        {
          id: 'admin',
          label: 'Админка',
          icon: Cog6ToothIcon,
          href: '/admin',
        },
      ]

    case 'SELLER':
      return [
        ...baseTabs,
        {
          id: 'seller',
          label: 'Продавец',
          icon: ChartBarIcon,
          href: '/seller',
        },
      ]

    case 'BLOGGER':
      return [
        ...baseTabs,
        {
          id: 'blogger',
          label: 'Блогер',
          icon: MegaphoneIcon,
          href: '/blogger',
        },
      ]

    case 'MANAGER':
      return [
        ...baseTabs,
        {
          id: 'manager',
          label: 'Менеджер',
          icon: UserGroupIcon,
          href: '/manager',
        },
      ]

    case 'BUYER':
      return baseTabs

    default:
      return baseTabs
  }
}

function RoleBasedNavContent() {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuthStore()
  const { userData } = useTelegramData()

  const userRole = user?.role || userData?.role || 'BUYER'
  const tabs = getTabsForRole(userRole)
  const displayTabs = tabs

  const handleTabClick = (href: string) => {
    router.push(href)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-pb">
      <div className="flex h-16 items-center justify-around px-4">
        {displayTabs.map((tab) => {
          const isActive = pathname.slice(1) === tab.id
          const Icon = tab.icon

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.href)}
              className={cn(
                'flex flex-col items-center justify-center space-y-1 px-3 py-2 rounded-lg transition-colors',
                isActive
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              )}
            >
              <div className="relative">
                <Icon className={cn('h-6 w-6', isActive && 'text-blue-600')} />
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-lg bg-blue-50 -z-10"
                    initial={false}
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 30,
                    }}
                  />
                )}
              </div>
              <span
                className={cn(
                  'text-xs font-medium',
                  isActive ? 'text-blue-600' : 'text-gray-500'
                )}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export function RoleBasedNav() {
  return (
    <ClientOnly
      fallback={
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-pb h-16" />
      }
    >
      <RoleBasedNavContent />
    </ClientOnly>
  )
}
