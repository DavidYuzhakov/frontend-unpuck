'use client'

import { MainLayout } from '@/components/layouts/main-layout'
import { useTelegramData } from '@/components/providers/telegram-data-provider'
import { UserRole } from '@/hooks/use-role'
import { usersAPI } from '@/lib/api'
import { useTokenManager } from '@/lib/token-manager'
import { useAuthStore } from '@/store/auth'
import { getRoleText } from '@/utils/getRoleText'
import { User, CircleUserRound } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const roles: UserRole[] = ['BLOGGER', 'BUYER', 'MANAGER', 'SELLER', 'ADMIN']

export default function ProfilePage() {
  const router = useRouter()
  const { user, logout, updateUser } = useAuthStore()
  const { updateUser: updateUserTM } = useTokenManager()
  const {
    userData: telegramData,
    isLoading,
    error,
    isInTelegram,
    refreshUserData,
  } = useTelegramData()

  const [currentUser, setCurrentUser] = useState(telegramData || user || null)

  const handleLogout = () => {
    console.log('Выход из системы')
    logout()
    router.push('/')
  }

  const changeRole = async (role: UserRole) => {
    if (!currentUser || role === currentUser.role) return

    try {
      const updates = { ...currentUser, role }
      await usersAPI.updateProfile(updates)
      await refreshUserData()
      updateUser(updates)
      setCurrentUser(updates)
      updateUserTM(updates)
    } catch (error) {
      console.error('❌ Ошибка обновления роли:', error)
      alert('Не удалось обновить роль. Попробуйте позже')
    }
  }

  console.log(user, telegramData)

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка профиля...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (error && !user) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Ошибка загрузки данных
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-white">
        {/* Заголовок */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900">Профиль</h1>
        </div>

        <div className="px-4 py-4 space-y-4 pb-20 sm:space-y-6">
          {/* Информация о пользователе */}
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="relative h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0">
                {(() => {
                  const avatarUrl =
                    (currentUser as any)?.avatar ||
                    (currentUser as any)?.photoUrl
                  return avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={currentUser?.firstName || 'Пользователь'}
                      className="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover"
                    />
                  ) : null
                })() || (
                  <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                  </div>
                )}
                {(currentUser?.isVerified ||
                  (currentUser as any)?.isPremium) && (
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                    <svg
                      className="h-3 w-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                  {currentUser
                    ? `${currentUser.firstName} ${
                        currentUser.lastName || ''
                      }`.trim()
                    : 'Пользователь'}
                </h2>
                {(currentUser as any)?.telegramId && (
                  <p className="text-xs sm:text-sm text-gray-500 truncate">
                    Telegram ID:{' '}
                    {(currentUser as any).telegramId || (currentUser as any).id}
                  </p>
                )}
                {currentUser?.username && (
                  <p className="text-xs sm:text-sm text-gray-500 truncate">
                    @{currentUser.username}
                  </p>
                )}
                {currentUser?.role && (
                  <p className="text-xs sm:text-sm text-blue-600 truncate font-medium">
                    {currentUser.role === 'BUYER' && '👤 Покупатель'}
                    {currentUser.role === 'SELLER' && '🛍️ Продавец'}
                    {currentUser.role === 'BLOGGER' && '📢 Блогер'}
                    {currentUser.role === 'MANAGER' && '👥 Менеджер'}
                    {currentUser.role === 'ADMIN' && '⚙️ Администратор'}
                  </p>
                )}
                {!isInTelegram && (
                  <p className="text-xs text-yellow-600 truncate">
                    ⚠️ Не в Telegram WebApp
                  </p>
                )}
                {error && (
                  <p className="text-xs text-red-600 truncate">❌ {error}</p>
                )}
              </div>
            </div>
          </div>

          {/* Профиль */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-3 sm:px-4 py-3 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Профиль
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              <button
                onClick={() => router.push('/profile/transactions')}
                className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <svg
                    className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  <div className="flex-1 text-left min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      Транзакции
                    </h4>
                    <p className="text-xs text-gray-500 truncate">
                      История операций
                    </p>
                  </div>
                </div>
                <svg
                  className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
              <button
                onClick={() => router.push('/profile/social')}
                className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <svg
                    className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                    />
                  </svg>
                  <div className="flex-1 text-left min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      Соцсети
                    </h4>
                    <p className="text-xs text-gray-500 truncate">
                      Связанные аккаунты
                    </p>
                  </div>
                </div>
                <svg
                  className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
              <button
                onClick={() => router.push('/profile/verification')}
                className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <svg
                    className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <div className="flex-1 text-left min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      Верификация
                    </h4>
                    <p className="text-xs text-gray-500 truncate">
                      Подтверждение личности
                    </p>
                  </div>
                </div>
                <svg
                  className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Инструменты */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-3 sm:px-4 py-3 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Инструменты
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              <button
                onClick={() => router.push('/faq')}
                className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <svg
                    className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="flex-1 text-left min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      FAQ
                    </h4>
                    <p className="text-xs text-gray-500 truncate">
                      Часто задаваемые вопросы
                    </p>
                  </div>
                </div>
                <svg
                  className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
              <button
                onClick={() => router.push('profile/statistics')}
                className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <svg
                    className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <div className="flex-1 text-left min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      Статистика
                    </h4>
                    <p className="text-xs text-gray-500 truncate">
                      Аналитика и отчеты
                    </p>
                  </div>
                </div>
                <svg
                  className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Другое */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-3 sm:px-4 py-3 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Другое
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              <button
                onClick={() => router.push('/profile/support')}
                className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <svg
                    className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <div className="flex-1 text-left min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      Поддержка
                    </h4>
                    <p className="text-xs text-gray-500 truncate">
                      Помощь и контакты
                    </p>
                  </div>
                </div>
                <svg
                  className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
              <button
                onClick={() => router.push('/profile/affiliate')}
                className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <svg
                    className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <div className="flex-1 text-left min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      Партнерская программа
                    </h4>
                    <p className="text-xs text-gray-500 truncate">
                      Зарабатывайте с нами
                    </p>
                  </div>
                </div>
                <svg
                  className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
              <div className="w-full flex items-center justify-between p-3 sm:p-4 transition-colors">
                <div className="flex items-center flex-wrap gap-3">
                  <CircleUserRound size={20} color={'#9ca3af'} />
                  <h4 className="text-sm font-medium text-gray-900 flex-shrink-0 w-full flex-1">
                    Роль
                  </h4>
                  <div className="flex items-center gap-[6px] flex-wrap">
                    {roles.map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => changeRole(role)}
                        className={`text-xs font-medium rounded px-1.5 py-1 min-h-0 ${
                          role === currentUser?.role
                            ? 'text-blue-600 border border-blue-600'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        {getRoleText(role)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
