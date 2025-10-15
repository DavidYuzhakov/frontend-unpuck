import { User } from '@/types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setLoading: (loading: boolean) => void
  login: (user: User, token: string) => void
  logout: () => void
  clearAuth: () => void
  updateUser: (updates: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setLoading: (isLoading) => set({ isLoading }),

      login: (user, token) => {
        set({ user, token, isLoading: false })
        // Сохраняем токен в localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', token)
        }
      },

      logout: () => {
        set({ user: null, token: null, isLoading: false })
        // Очищаем токен из localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token')
        }
      },

      clearAuth: () => {
        set({ user: null, token: null, isLoading: false })
        // Очищаем все данные из localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('auth-storage')
          localStorage.removeItem('user_data')
          localStorage.removeItem('auth_user')
        }
      },

      updateUser: (updates) => {
        const currentUser = get().user
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
)
