'use client'

import { RoleBasedNav } from '@/components/navigation/role-based-nav'
import { useTelegramData } from '@/components/providers/telegram-data-provider'
import { useAuthStore } from '@/store/auth'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Основной контент */}
      <main className="pb-16">{children}</main>

      {/* Нижняя навигация */}
      <RoleBasedNav />
    </div>
  )
}
