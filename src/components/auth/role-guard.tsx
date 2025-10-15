'use client'

import { useRole } from '@/hooks/use-role'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: string[]
  fallbackPath?: string
}

export function RoleGuard({ 
  children, 
  allowedRoles, 
  fallbackPath = '/catalog' 
}: RoleGuardProps) {
  const { user, canAccess } = useRole()
  const router = useRouter()

  // Отладочная информация
  console.log('🔍 RoleGuard - user:', user)
  console.log('🔍 RoleGuard - allowedRoles:', allowedRoles)
  console.log('🔍 RoleGuard - canAccess:', canAccess(allowedRoles as any))

  useEffect(() => {
    if (user && !canAccess(allowedRoles as any)) {
      console.log('❌ RoleGuard - доступ запрещен, перенаправляем на:', fallbackPath)
      router.push(fallbackPath)
    }
  }, [user, canAccess, allowedRoles, fallbackPath, router])

  if (!user) {
    // Если пользователь не загружен, перенаправляем на главную страницу
    useEffect(() => {
      router.push('/')
    }, [router])
    
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Перенаправление...</p>
        </div>
      </div>
    )
  }

  if (!canAccess(allowedRoles as any)) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Доступ запрещен</h1>
          <p className="text-gray-600 mb-4">У вас нет прав для доступа к этой странице</p>
          <button
            onClick={() => router.push(fallbackPath)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
