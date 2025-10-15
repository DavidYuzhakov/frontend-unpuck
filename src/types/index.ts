// Основные типы приложения
export interface User {
  id: string
  telegramId?: string
  username?: string
  email?: string
  phone?: string
  firstName?: string
  lastName?: string
  avatar?: string
  balance?: number // убрали баланс

  // Системные поля
  role: 'BUYER' | 'SELLER' | 'BLOGGER' | 'MANAGER' | 'ADMIN'
  isActive: boolean //default true
  isVerified: boolean //default false
  isBlocked: boolean //default false
  referralCode: string

  // Метаданные
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
}

export interface Product {
  id: string
  title: string
  description: string
  price: number
  originalPrice?: number
  category: ProductCategory
  subcategory?: ProductSubcategory
  images: string[]
  rating: number
  reviewsCount: number
  seller: {
    id: string
    firstName: string
    lastName: string
    avatar: string
    username: string
    isVerified: boolean
  }
  inStock: boolean
  tags?: string[]
  createdAt: string
  updatedAt: string
  isFavorite?: boolean
}

export type DealStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED'

export interface Deal {
  id: string
  product: {
    id: string
    title: string
    description: string
    price: number
    originalPrice?: number
    category: ProductCategory
    images: string[]
    rating: number
    reviewsCount: number
    seller: {
      id: string
      name: string
      avatar?: string
      verified: boolean
    }
    inStock: boolean
    tags?: string[]
    createdAt: string
    updatedAt: string
  }
  buyer: {
    id: string
    name: string
    email: string
    role: 'BUYER' | 'SELLER' | 'BLOGGER' | 'MANAGER' | 'ADMIN'
    verified: boolean
    createdAt: string
    updatedAt: string
  }
  seller: {
    id: string
    name: string
    email: string
    role: 'BUYER' | 'SELLER' | 'BLOGGER' | 'MANAGER' | 'ADMIN'
    verified: boolean
    avatar?: string
    createdAt: string
    updatedAt: string
  }
  status: DealStatus
  quantity: number
  totalPrice: number
  paymentMethod: 'card' | 'wallet' | 'crypto'
  trackingNumber?: string
  createdAt: string
  updatedAt: string
  estimatedDelivery?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  icon: string
  parentId?: string
  children?: Category[]
}

export interface SearchFilters {
  query?: string
  category?: string
  subcategory?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: 'price' | 'name' | 'date' | 'rating'
  inStock?: boolean
  favoritesOnly?: boolean
}

export type ProductCategory =
  | 'all'
  | 'clothing'
  | 'beauty'
  | 'home'
  | 'electronics'
  | 'other'
export type ProductSubcategory =
  | 'shirts'
  | 'pants'
  | 'dresses'
  | 'shoes'
  | 'accessories'
  | 'makeup'
  | 'skincare'
  | 'furniture'
  | 'decor'
  | 'kitchen'
  | 'phones'
  | 'laptops'
  | 'other'

export interface PaymentMethod {
  id: string
  type: 'card' | 'wallet' | 'crypto'
  name: string
  last4?: string
  isDefault: boolean
}

export interface SocialLink {
  id: string
  platform: 'telegram' | 'instagram' | 'youtube' | 'tiktok'
  username: string
  url: string
  verified: boolean
}

export interface AdminStats {
  totalUsers: number
  totalProducts: number
  totalDeals: number
  pendingMessages: number
  revenue: number
  newUsersToday: number
  newProductsToday: number
  completedDealsToday: number
}

export interface AdminUser extends User {
  lastLogin?: string
  totalSpent: number
  totalEarned: number
  dealsCount: number
  productsCount: number
  isBlocked: boolean
  blockReason?: string
}

// Навигация
export type TabType =
  | 'catalog'
  | 'deals'
  | 'profile'
  | 'admin'
  | 'blogger'
  | 'seller'
  | 'manager'
  | 'campaigns'

// Состояние приложения
export interface AppState {
  currentTab: TabType
  user: User | null
  products: Product[]
  deals: Deal[]
  categories: Category[]
  searchFilters: SearchFilters
  loading: boolean
  error: string | null
}

// API ответы
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface SupportTicket {
  id: string
  status: 'OPEN' | 'RESOLVED'
  userId: string
  createdAt: string
  updatedAt: string
  messages: IMessage[]
}

export interface IMessage {
  id: string
  ticketId: string
  sender: 'USER' | 'ADMIN'
  text: string
  user: User
  createdAt: string
}
