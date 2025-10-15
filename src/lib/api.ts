import { useAuthStore } from '@/store/auth'
import axios from 'axios'
import { tokenManager } from './token-manager'
import { UserRole } from '@/hooks/use-role'
import { IMessage, Product, SupportTicket } from '@/types'
import { UserModalData } from '@/components/admin/user-modal'

const API_URL = '/api'
const isBrowser = typeof window !== 'undefined'
const BASE_URL = isBrowser ? '/api' : API_URL

interface AuthTelegramResponseData {
  user: {
    id: string
    telegramId: string
    username: string
    firstName: string
    lastName: string
    avatar: string
    role: UserRole
    isVerified: boolean
    referralCode: string
  }
  token: string
}

// Кэш для GET запросов
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 минут

// Функция для проверки кэша
const getCachedData = (key: string) => {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  return null
}

// Функция для сохранения в кэш
const setCachedData = (key: string, data: any) => {
  cache.set(key, { data, timestamp: Date.now() })
}

// Функция для очистки кэша
export const clearCache = () => {
  cache.clear()
}

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'max-age=300', // 5 минут кэш
  },
})

api.interceptors.request.use(
  async (config) => {
    let token = tokenManager.getToken()

    if (!token) {
      console.log('⚠️ Токен не найден для запроса:', config.url)
      const authResult = await tokenManager.autoAuth()
      if (authResult) {
        console.log('✅ Авторизация через Telegram успешна')
        token = tokenManager.getToken()
      } else {
        console.log(
          '❌ Авторизация не выполнена, запрос может быть отклонён (401)'
        )
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    } else {
      console.log('❌ Токен не найден, запрос будет отправлен без авторизации')
    }

    if (config.method === 'get' && !config.url?.includes('/statistics/')) {
      const cacheKey = `${config.url}?${JSON.stringify(config.params || {})}`
      const cachedData = getCachedData(cacheKey)
      if (cachedData) {
        return {
          ...config,
          data: cachedData,
          fromCache: true,
        }
      }
    }

    return config
  },
  (error) => {
    console.log('❌ Ошибка в request interceptor:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling and caching
api.interceptors.response.use(
  (response) => {
    // Кэшируем успешные GET запросы
    if (response.config.method === 'get' && response.status === 200) {
      const cacheKey = `${response.config.url}?${JSON.stringify(
        response.config.params || {}
      )}`
      setCachedData(cacheKey, response.data)
    }
    return response
  },
  (error) => {
    const { response } = error
    console.log('❌ API Error:', error.config?.url, 'Status:', response?.status)
    console.log('📄 Error response:', response?.data)

    if (error.code === 'ERR_NETWORK') {
      console.warn('Сетевая ошибка. Проверьте доступность API:', API_URL)
      return Promise.reject(error)
    } else if (response?.status === 401) {
      // Token expired or invalid - очищаем глобальный токен
      tokenManager.clearAuth()
      useAuthStore.getState().logout()

      // Check if we're on transactions page - don't redirect or show toast
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname
        if (currentPath.includes('/profile/transactions')) {
          return Promise.reject(error)
        }
      }

      console.warn('Сессия истекла. Переход на страницу входа.')

      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login'
      }
    } else if (response?.status === 403) {
      console.warn('Нет прав для выполнения этого действия')
    } else if (response?.status === 500) {
      console.error('Ошибка сервера 500:', response.data)
      // Добавляем дополнительную информацию об ошибке
      error.serverError = true
      error.message = response.data?.message || 'Внутренняя ошибка сервера'
    } else if (response?.status === 404) {
      console.warn('Ресурс не найден - API эндпоинт недоступен')
      // Не выбрасываем ошибку для 404, позволяем компонентам обработать fallback
    } else if (response?.status >= 500) {
      console.warn('Ошибка сервера. Попробуйте позже.')
    } else if (response?.data?.message) {
      console.warn('Ошибка:', response.data.message)
    } else if (error.code === 'ECONNABORTED') {
      console.warn('Превышено время ожидания')
    } else if (typeof navigator !== 'undefined' && !navigator.onLine) {
      console.warn('Проверьте подключение к интернету')
    }

    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (credentials: { identifier: string; password: string }) =>
    api.post('/auth/login', credentials),

  register: (data: {
    firstName: string
    lastName?: string
    email?: string
    username?: string
    password: string
    role: string
    referralCode?: string
  }) => api.post('/auth/register', data),

  telegramAuth: (data: {
    telegramId: string
    firstName: string
    lastName: string
    username: string
    photoUrl: string
  }) => api.post<AuthTelegramResponseData>('/auth/telegram', data),

  getProfile: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
}

// Users API
export const usersAPI = {
  updateProfile: (
    data: Partial<{
      firstName: string
      lastName: string
      email: string
      phone: string
      avatar: string
    }>
  ) => api.put('/users/profile', data),

  getReferrals: () => api.get('/users/referrals'),
  getBalance: () => api.get('/users/balance'),
}

// Products API
export const productsAPI = {
  getProducts: (params?: {
    search?: string
    category?: string
    brand?: string
    minPrice?: number
    maxPrice?: number
    sellerId?: string
    limit?: number
    offset?: number
    sortBy?: string
    sortOrder?: string
  }) => {
    return api.get('/products', { params })
  },

  getProduct: (id: string) => {
    return api.get<Product>(`/products/${id}`)
  },

  createProduct: (data: {
    title: string
    description?: string
    price: number
    images: string[]
    category: string
    brand?: string
  }) => api.post('/products', data),

  updateProduct: (
    id: string,
    data: Partial<{
      title: string
      description: string
      price: number
      images: string[]
      category: string
      brand: string
    }>
  ) => api.put(`/products/${id}`, data),

  deleteProduct: (id: string) => api.delete(`/products/${id}`),
  getMyProducts: (params?: {
    limit?: number
    offset?: number
    isActive?: boolean
  }) => api.get('/products/my/products', { params }),
}

// Campaigns API
export const campaignsAPI = {
  getCampaigns: (params?: {
    type?: string
    status?: string
    advertiserId?: string
    limit?: number
    offset?: number
  }) => api.get('/campaigns', { params }),

  getCampaign: (id: string) => api.get(`/campaigns/${id}`),

  createCampaign: (data: {
    title: string
    description?: string
    type: 'product' | 'channel'
    budget: number
    pricePerClick: number
    maxClicks?: number
    startDate?: string
    endDate?: string
    productId?: string
    channelId?: string
  }) => api.post('/campaigns', data),

  updateCampaign: (
    id: string,
    data: Partial<{
      title: string
      description: string
      budget: number
      pricePerClick: number
      maxClicks: number
      startDate: string
      endDate: string
    }>
  ) => api.put(`/campaigns/${id}`, data),

  startCampaign: (id: string) => api.post(`/campaigns/${id}/start`),
  pauseCampaign: (id: string) => api.post(`/campaigns/${id}/pause`),
  deleteCampaign: (id: string) => api.delete(`/campaigns/${id}`),
  recordClick: (id: string) => api.post(`/campaigns/${id}/click`),
  getMyCampaigns: (params?: {
    status?: string
    limit?: number
    offset?: number
    bloggerId?: string
  }) => api.get('/campaigns/my/campaigns', { params }),
}

// Transactions API
export const transactionsAPI = {
  getTransactions: (params?: {
    type?: string
    status?: string
    limit?: number
    offset?: number
    dateFrom?: string
    dateTo?: string
  }) => api.get('/transactions', { params }),

  getAllData: () => api.get('/transactions/all-data'),

  requestWithdrawal: (data: {
    amount: number
    method: 'bank_card' | 'yoomoney' | 'qiwi'
    details: {
      cardNumber?: string
      accountId?: string
      phone?: string
    }
  }) => api.post('/transactions/withdrawal', data),

  getStats: (params?: { period?: '7d' | '30d' | '90d' | '1y' }) =>
    api.get('/transactions/stats', { params }),

  cancelTransaction: (id: string) => api.post(`/transactions/${id}/cancel`),
}

// Deals API
export const dealsAPI = {
  getDeals: (params?: {
    status?: string
    buyerId?: string
    sellerId?: string
    limit?: number
    offset?: number
  }) => api.get('/deals', { params }),

  getDeal: (id: string) => api.get(`/deals/${id}`),

  createDeal: (data: {
    productId: string
    quantity: number
    totalPrice: number
    paymentMethod: 'card' | 'wallet' | 'crypto'
  }) => api.post('/deals', data),

  updateDeal: (
    id: string,
    data: Partial<{
      status: string
      trackingNumber: string
      notes: string
    }>
  ) => api.put(`/deals/${id}`, data),

  cancelDeal: (id: string) => api.post(`/deals/${id}/cancel`),

  getMyDeals: (params?: { status?: string; limit?: number; offset?: number }) =>
    api.get('/deals/my/deals', { params }),
}

// Payment API
export const paymentAPI = {
  createPayment: (data: {
    amount: number
    paymentMethod: 'card' | 'wallet' | 'crypto'
    description?: string
    metadata?: any
    userId?: string
  }) => api.post('/payment/create', data),

  quickCreatePayment: (data: {
    productId: string
    quantity: number
    price: number
    title: string
    sellerId: string
    userId: string
  }) => api.post('/payment/quick-create', data),

  getPayment: (id: string) => api.get(`/payment/${id}`),

  confirmPayment: (id: string) => api.post(`/payment/${id}/confirm`),

  cancelPayment: (id: string) => api.post(`/payment/${id}/cancel`),
}

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),

  getUsers: (params?: {
    role?: string
    verified?: boolean
    blocked?: boolean
    limit?: number
    offset?: number
  }) => api.get('/admin/users', { params }),

  createUser: (data: {
    firstName: string
    lastName: string
    email: string
    phone?: string
    role: string
    password?: string
    verified?: boolean
  }) => api.post('/admin/users', data),

  updateUser: (userId: string, data: UserModalData) =>
    api.put(`/admin/users/${userId}`, data),

  blockUser: (userId: string, data: { reason: string }) =>
    api.post(`/admin/users/${userId}/block`, data),

  unblockUser: (userId: string) => api.post(`/admin/users/${userId}/unblock`),

  verifyUser: (userId: string) => api.post(`/admin/users/${userId}/verify`),

  getProducts: (params?: {
    sellerId?: string
    category?: string
    status?: string
    limit?: number
    offset?: number
  }) => api.get('/admin/products', { params }),

  createProduct: (data: {
    title: string
    description: string
    price: number
    category: string
    images?: string[]
    isActive?: boolean
  }) => api.post('/admin/products', data),

  updateProduct: (
    productId: string,
    data: Partial<{
      title: string
      description: string
      price: number
      category: string
      isActive: boolean
    }>
  ) => api.put(`/admin/products/${productId}`, data),

  deleteProduct: (productId: string) =>
    api.delete(`/admin/products/${productId}`),

  getDeals: (params?: {
    status?: string
    buyerId?: string
    sellerId?: string
    limit?: number
    offset?: number
  }) => api.get('/admin/deals', { params }),

  updateDealStatus: (dealId: string, status: string | { status: string }) => {
    const statusValue = typeof status === 'string' ? status : status.status
    return api.put(`/admin/deals/${dealId}/status`, { status: statusValue })
  },

  closeDeal: (dealId: string) => api.post(`/admin/deals/${dealId}/close`),

  openDeal: (dealId: string) => api.post(`/admin/deals/${dealId}/open`),

  cancelDeal: (dealId: string) => api.post(`/admin/deals/${dealId}/cancel`),

  disputeDeal: (dealId: string) => api.post(`/admin/deals/${dealId}/dispute`),

  resolveDispute: (
    dealId: string,
    data: { resolution: string; refundAmount?: number }
  ) => api.post(`/admin/deals/${dealId}/resolve-dispute`, data),
}

// Support API
export const supportAPI = {
  getTickets: (params?: { status?: 'OPEN' | 'RESOLVED' }) => {
    return api.get<SupportTicket[]>('/support/tickets', { params })
  },
  createTickets: (text: string) => {
    return api.post<SupportTicket>('/support/tickets', { text })
  },
  replyToTicket: (ticketId: string, text: string) => {
    return api.post(`/support/${ticketId}/reply`, { text })
  },
  getMessages: (params?: { sender?: 'USER' | 'ADMIN' }) => {
    return api.get<IMessage[]>('/support/messages', { params })
  },
}

// Upload API
export const uploadAPI = {
  uploadFile: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/upload/file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  uploadFiles: (files: File[]) => {
    const formData = new FormData()
    files.forEach((file) => formData.append('files', file))
    return api.post('/upload/files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  uploadAvatar: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  deleteFile: (filename: string) => api.delete(`/upload/file/${filename}`),
  getFileInfo: (filename: string) => api.get(`/upload/file/${filename}/info`),
}

// Statistics API
export const statisticsAPI = {
  getUserStats: (params?: { period?: '7d' | '30d' | '90d' | '1y' }) =>
    api.get('/statistics/user', { params }),

  getProductStats: (
    productId: string,
    params?: { period?: '7d' | '30d' | '90d' | '1y' }
  ) =>
    api.get(`/statistics/product/${productId}`, {
      params,
    }),

  getSalesStats: (params?: { period?: '7d' | '30d' | '90d' | '1y' }) =>
    api.get('/statistics/sales', { params }),

  // Manager statistics
  getManagerStats: () => api.get('/statistics/manager'),

  getUsersStats: () => api.get('/statistics/users'),

  getRecentActivities: () => api.get('/statistics/activities'),
}

// Moderation API
export const moderationAPI = {
  getPendingProducts: (params?: { page?: number; limit?: number }) =>
    api.get('/moderation/products', { params }),

  getPendingUsers: (params?: { page?: number; limit?: number }) =>
    api.get('/moderation/users', { params }),

  approveProduct: (id: string) => api.put(`/moderation/products/${id}/approve`),

  rejectProduct: (id: string, reason: string) =>
    api.put(`/moderation/products/${id}/reject`, { reason }),

  approveUser: (id: string) => api.put(`/moderation/users/${id}/approve`),

  rejectUser: (id: string, reason: string) =>
    api.put(`/moderation/users/${id}/reject`, { reason }),

  getModerationStats: () => api.get('/moderation/stats'),
}

// Profile API
export const profileAPI = {
  getPayments: () => api.get('/users/payments'),

  addPaymentMethod: (data: {
    type: 'card' | 'wallet' | 'crypto'
    name: string
    last4?: string
    isDefault?: boolean
  }) => api.post('/users/payments', data),

  removePaymentMethod: (paymentId: string) =>
    api.delete(`/users/payments/${paymentId}`),

  getTransactions: () => api.get('/transactions/all-data'),

  createPayment: (data: {
    amount: number
    paymentMethod: 'card' | 'wallet' | 'crypto'
    description?: string
  }) => api.post('/payment/create', data),

  // Social methods
  getSocialLinks: () => api.get('/social/links'),

  createSocialLink: (data: {
    platform: string
    username: string
    url: string
    verified?: boolean
  }) => api.post('/social/links', data),

  updateSocialLink: (
    id: string,
    data: { username?: string; url?: string; verified?: boolean }
  ) => api.put(`/social/links/${id}`, data),

  deleteSocialLink: (id: string) => api.delete(`/social/links/${id}`),

  getUserData: (platform: string, username: string) =>
    api.get(`/social/user-data/${platform}/${username}`),

  getUserDataByBody: (data: { platform: string; username: string }) =>
    api.post('/social/user-data', data),

  validateSocialLink: (data: { platform: string; username: string }) =>
    api.post('/social/validate', data),

  getSupportedPlatforms: () => api.get('/social/platforms'),

  // Verification methods
  getVerificationStatus: () => api.get('/users/verification'),

  submitVerification: (data: {
    documentType: 'passport' | 'driver_license' | 'id_card'
    documentNumber: string
    documentImages: string[]
  }) => api.post('/users/verification', data),
}

// Notifications API
export const notificationsAPI = {
  getNotifications: (params?: { limit?: number }) =>
    api.get('/users/notifications', { params }),

  getNotificationSettings: () => api.get('/users/notification-settings'),

  updateNotificationSettings: (data: {
    email: boolean
    push: boolean
    sms: boolean
    telegram: boolean
  }) => api.put('/users/notifications', data),

  markAsRead: (notificationId: string) =>
    api.put(`/users/notifications/${notificationId}/read`),

  markAllAsRead: () => api.put('/users/notifications/read-all'),

  getTestNotifications: () => api.get('/users/test-notifications'),
}

// Verification API
export const verificationAPI = {
  getStatus: () => api.get('/users/verification'),

  submitDocuments: (data: {
    documentType: 'passport' | 'driver_license' | 'id_card'
    documentNumber: string
    documentImages: string[]
  }) => api.post('/users/verification', data),

  getDocumentTypes: () => api.get('/verification/document-types'),

  getVerificationHistory: () => api.get('/verification/history'),
}

// Social API
export const socialAPI = {
  getLinks: () => api.get('/social/links'),

  createLink: (data: {
    platform: string
    username: string
    url: string
    verified?: boolean
  }) => api.post('/social/links', data),

  updateLink: (
    id: string,
    data: {
      username?: string
      url?: string
      verified?: boolean
    }
  ) => api.put(`/social/links/${id}`, data),

  deleteLink: (id: string) => api.delete(`/social/links/${id}`),

  getUserData: (platform: string, username: string) =>
    api.get(`/social/user-data/${platform}/${username}`),

  getUserDataByBody: (data: { platform: string; username: string }) =>
    api.post('/social/user-data', data),

  validateLink: (data: { platform: string; username: string }) =>
    api.post('/social/validate', data),

  getSupportedPlatforms: () => api.get('/social/platforms'),
}

// Academy API
export const academyAPI = {
  getCourses: (params?: {
    category?: string
    level?: string
    limit?: number
    offset?: number
  }) => api.get('/academy/courses', { params }),

  getCourse: (courseId: string) => api.get(`/academy/courses/${courseId}`),

  getLessons: (courseId: string) =>
    api.get(`/academy/courses/${courseId}/lessons`),

  getLesson: (courseId: string, lessonId: string) =>
    api.get(`/academy/courses/${courseId}/lessons/${lessonId}`),

  markLessonComplete: (courseId: string, lessonId: string) =>
    api.post(`/academy/courses/${courseId}/lessons/${lessonId}/complete`),

  getProgress: (courseId?: string) =>
    api.get('/academy/progress', {
      params: courseId ? { courseId } : {},
    }),
}

// Affiliate API
export const affiliateAPI = {
  getStats: () => api.get('/affiliate/stats'),

  getReferralStats: () => api.get('/affiliate/stats'),

  getReferrals: (params?: {
    status?: string
    limit?: number
    offset?: number
  }) => api.get('/affiliate/referrals', { params }),

  getCommissions: (params?: {
    status?: string
    dateFrom?: string
    dateTo?: string
    limit?: number
    offset?: number
  }) => api.get('/affiliate/commissions', { params }),

  requestPayout: (data: {
    amount: number
    method: 'bank_card' | 'yoomoney' | 'qiwi'
    details: {
      cardNumber?: string
      accountId?: string
      phone?: string
    }
  }) => api.post('/affiliate/payout', data),

  getPayoutHistory: (params?: {
    status?: string
    limit?: number
    offset?: number
  }) => api.get('/affiliate/payouts', { params }),
}

// Telegram API
export const telegramAPI = {
  getUserInfo: (telegramId: string) => api.get(`/telegram/user/${telegramId}`),

  getUserPhoto: (telegramId: string) =>
    api.get(`/telegram/user/${telegramId}/photo`),

  searchUser: (username: string) => api.get(`/telegram/search/${username}`),

  verifyUser: (
    telegramId: string,
    data: {
      firstName: string
      lastName?: string
      username?: string
      photoUrl?: string
    }
  ) => api.post(`/telegram/verify/${telegramId}`, data),

  connectAccount: (data: {
    platform: 'telegram' | 'instagram' | 'youtube' | 'tiktok'
    username: string
    url: string
    telegramId?: string
  }) => api.post('/social/connect', data),

  getSocialLinks: () => api.get('/social/links'),

  updateSocialLink: (
    linkId: string,
    data: {
      username: string
      url: string
      verified: boolean
    }
  ) => api.put(`/social/links/${linkId}`, data),

  deleteSocialLink: (linkId: string) => api.delete(`/social/links/${linkId}`),

  verifyTelegram: (
    telegramId: string,
    data: {
      photoUrl?: string
    }
  ) => api.post(`/telegram/verify/${telegramId}`, data),
}

// Images API
export const imagesAPI = {
  getImagesByCategory: (category: string, params?: { limit?: number }) =>
    api.get(`/images/category/${category}`, { params }),

  getRandomProductImages: (params?: { count?: number }) =>
    api.get('/images/random/products', { params }),

  getRandomAvatars: (params?: { count?: number }) =>
    api.get('/images/random/avatars', { params }),

  initializeImages: () => api.post('/images/initialize'),

  updateProductImages: () => api.post('/images/update-products'),

  updateUserAvatars: () => api.post('/images/update-avatars'),
}
