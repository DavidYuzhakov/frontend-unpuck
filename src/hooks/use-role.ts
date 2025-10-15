import { useTelegramData } from '@/components/providers/telegram-data-provider'
import { useAuthStore } from '@/store/auth'

export type UserRole = 'BUYER' | 'SELLER' | 'BLOGGER' | 'MANAGER' | 'ADMIN'

export function useRole() {
  const { user } = useAuthStore()
  const { userData } = useTelegramData()
  
  // Используем роль из Telegram данных, если доступна, иначе из store
  const currentUser = userData || user

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!currentUser) return false
    
    if (Array.isArray(role)) {
      return role.includes(currentUser.role as UserRole)
    }
    
    return currentUser.role === role
  }

  const isBuyer = (): boolean => hasRole('BUYER')
  const isAdmin = (): boolean => hasRole('ADMIN')
  const isSeller = (): boolean => hasRole('SELLER')
  const isBlogger = (): boolean => hasRole('BLOGGER')
  const isManager = (): boolean => hasRole('MANAGER')
  
  const canAccess = (requiredRoles: UserRole[]): boolean => {
    return hasRole(requiredRoles)
  }

  return {
    user: currentUser,
    role: currentUser?.role as UserRole | undefined,
    hasRole,
    isBuyer,
    isAdmin,
    isSeller,
    isBlogger,
    isManager,
    canAccess,
  }
}
