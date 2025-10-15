'use client'

import { ChatMessages } from '@/components/admin/chat-messages'
import { DealManagementMobile } from '@/components/admin/deal-management-mobile'
import { DealModal } from '@/components/admin/deal-modal'
import { EnhancedProductModal } from '@/components/admin/enhanced-product-modal'
// import { Notification } from '@/components/admin/notification'
import { ProductManagement } from '@/components/admin/product-management'
import { UserManagement } from '@/components/admin/user-management'
import { UserModal, UserModalData } from '@/components/admin/user-modal'
import { RoleGuard } from '@/components/auth/role-guard'
import { MainLayout } from '@/components/layouts/main-layout'
import { useTelegramData } from '@/components/providers/telegram-data-provider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { adminAPI, supportAPI } from '@/lib/api'
import { tokenManager } from '@/lib/token-manager'
import {
  AdminStats,
  AdminUser,
  Deal,
  DealStatus,
  IMessage,
  Product,
  SupportTicket,
  User,
} from '@/types'
import {
  ArrowLeftIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  ShoppingBagIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'

// Инициализация с пустыми данными
const initialStats: AdminStats = {
  totalUsers: 0,
  totalProducts: 0,
  totalDeals: 0,
  pendingMessages: 0,
  revenue: 0,
  newUsersToday: 0,
  newProductsToday: 0,
  completedDealsToday: 0,
}

type AdminTab = 'dashboard' | 'messages' | 'products' | 'deals' | 'users'

function AdminContent() {
  const {
    userData,
    isLoading: telegramLoading,
    isInTelegram,
  } = useTelegramData()
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard')
  const [selectedMessage, setSelectedMessage] = useState<SupportTicket | null>(
    null
  )
  const [replyText, setReplyText] = useState('')

  const [showProductModal, setShowProductModal] = useState(false)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showDealModal, setShowDealModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)

  const tabs = [
    { id: 'dashboard', icon: ChartBarIcon },
    { id: 'messages', icon: ChatBubbleLeftRightIcon },
    { id: 'products', icon: ShoppingBagIcon },
    { id: 'deals', icon: ChartBarIcon },
    { id: 'users', icon: UserGroupIcon },
  ]
  const [productModalMode, setProductModalMode] = useState<'create' | 'edit'>(
    'create'
  )
  const [userModalMode, setUserModalMode] = useState<'create' | 'edit'>(
    'create'
  )
  const [stats, setStats] = useState<AdminStats>(initialStats)
  const [products, setProducts] = useState<Product[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [deals, setDeals] = useState<Deal[]>([])
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState<{
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
    isVisible: boolean
  }>({
    message: '',
    type: 'info',
    isVisible: false,
  })
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    type?: 'warning' | 'danger' | 'info'
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'warning',
  })

  // Загружаем данные при монтировании компонента
  useEffect(() => {
    // Сначала пытаемся авторизоваться, затем загружаем данные
    const initializeAdmin = async () => {
      try {
        // Пытаемся авторизоваться автоматически
        await tokenManager.autoAuth()
      } catch (error) {
        console.error('❌ Ошибка авторизации в админке:', error)
      }

      // Загружаем данные независимо от результата авторизации
      loadAdminData()
    }

    initializeAdmin()
  }, [])

  // Автоматическая проверка новых сообщений каждые 30 секунд
  useEffect(() => {
    const interval = setInterval(() => {
      loadAdminData() // автообновление
    }, 60000) // 60 секунд

    return () => clearInterval(interval)
  }, [])

  const loadAdminData = async () => {
    try {
      setLoading(true)
      const [
        statsResponse,
        productsResponse,
        usersResponse,
        dealsResponse,
        ticketsResponse,
      ] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getProducts(),
        adminAPI.getUsers(),
        adminAPI.getDeals(),
        supportAPI.getTickets(),
      ])

      if (statsResponse.data) {
        const apiStats = statsResponse.data
        setStats({
          totalUsers: apiStats.totalUsers || 0,
          totalProducts: apiStats.totalProducts || 0,
          totalDeals: apiStats.totalDeals || 0,
          pendingMessages: apiStats.newMessages || 0,
          revenue: apiStats.totalRevenue || 0,
          newUsersToday: apiStats.usersChange || 0,
          newProductsToday: apiStats.productsChange || 0,
          completedDealsToday: apiStats.dealsChange || 0,
        })
      }
      if (productsResponse.data) {
        const apiProducts = Array.isArray(productsResponse.data)
          ? productsResponse.data
          : []
        // Преобразуем данные API в формат Product
        const formattedProducts: Product[] = apiProducts.map((prod: any) => ({
          id: prod.id,
          title: prod.title,
          description: prod.description,
          price: parseInt(prod.price) || 0,
          originalPrice: parseInt(prod.price) || 0,
          category: (prod.category as any) || 'other',
          subcategory: (prod.category as any) || 'other',
          images: prod.images || [],
          rating: 4.5,
          reviewsCount: 0,
          seller: {
            id: prod.seller.id,
            firstName: prod.seller.firstName,
            avatar: prod.seller.avatar,
            lastName: prod.seller.lastName,
            username: prod.seller.username,
            isVerified: prod.seller.isVerified,
          },
          inStock: prod.isActive || false,
          tags: [],
          createdAt: prod.createdAt,
          updatedAt: prod.updatedAt,
        }))
        setProducts(formattedProducts)
      }

      if (usersResponse.data) {
        const apiUsers = Array.isArray(usersResponse.data)
          ? usersResponse.data
          : []
        // Преобразуем данные API в формат AdminUser
        const formattedUsers: AdminUser[] = apiUsers.map((user: AdminUser) => ({
          id: user.id,
          telegramId: user.telegramId,
          username: user.username,
          email: user.email || '',
          phone: user.phone || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          avatar: user.avatar || '/avatars/default.jpg',
          balance: user.balance || 0,
          role: user.role || 'BUYER',
          isActive: user.isActive ?? true,
          isVerified: user.isVerified || false,
          isBlocked: user.isBlocked || false,
          referralCode: user.referralCode || '',
          createdAt: user.createdAt || new Date().toISOString(),
          updatedAt: user.updatedAt || new Date().toISOString(),
          lastLoginAt: user.lastLoginAt,
          lastLogin: user.lastLoginAt,
          totalSpent: user.totalSpent || 0,
          totalEarned: user.totalEarned || 0,
          dealsCount: user.dealsCount || 0,
          productsCount: user.productsCount || 0,
          blockReason: user.blockReason,
        }))
        setUsers(formattedUsers)
      }

      if (dealsResponse.data) {
        const apiDeals = Array.isArray(dealsResponse.data)
          ? dealsResponse.data
          : []
        // Преобразуем данные API в формат Deal
        const formattedDeals: Deal[] = apiDeals.map((deal: any) => ({
          id: deal.id,
          product: {
            id: deal.product?.id || '',
            title: deal.product?.title || '',
            description: '',
            price: parseInt(deal.product?.price) || 0,
            originalPrice: parseInt(deal.product?.price) || 0,
            category: 'other' as const,
            subcategory: 'other' as const,
            images: deal.product?.images || [],
            rating: 4.5,
            reviewsCount: 0,
            seller: {
              id: deal.seller?.id || '',
              name: `${deal.seller?.firstName || ''} ${
                deal.seller?.lastName || ''
              }`.trim(),
              avatar: '/avatars/default.jpg',
              verified: true,
            },
            inStock: true,
            tags: [],
            createdAt: deal.createdAt,
            updatedAt: deal.updatedAt,
          },
          buyer: {
            id: deal.buyer?.id || '',
            name: `${deal.buyer?.firstName || ''} ${
              deal.buyer?.lastName || ''
            }`.trim(),
            email: deal.buyer?.email || '',
            role: 'SELLER' as const,
            verified: deal.buyer?.isVerified || false,
            createdAt: deal.buyer?.createdAt || new Date().toISOString(),
            updatedAt: deal.buyer?.updatedAt || new Date().toISOString(),
          },
          seller: {
            id: deal.seller?.id || '',
            name: `${deal.seller?.firstName || ''} ${
              deal.seller?.lastName || ''
            }`.trim(),
            email: deal.seller?.email || '',
            role: 'SELLER' as const,
            verified: deal.seller?.isVerified || false,
            avatar: deal.seller?.avatar || '/avatars/default.jpg',
            createdAt: deal.seller?.createdAt || new Date().toISOString(),
            updatedAt: deal.seller?.updatedAt || new Date().toISOString(),
          },
          status: deal.status || 'PENDING',
          totalPrice: parseInt(deal.amount) || 0,
          quantity: 1,
          shippingAddress: {
            street: '',
            city: '',
            postalCode: '',
            country: '',
          },
          paymentMethod: 'card',
          trackingNumber: undefined,
          notes: deal.description || '',
          createdAt: deal.createdAt,
          updatedAt: deal.updatedAt,
          estimatedDelivery: deal.createdAt,
        }))
        setDeals(formattedDeals)
      }

      if (ticketsResponse.data) {
        setTickets(ticketsResponse.data)
      }
    } catch (error: any) {
      console.error('Ошибка загрузки админ данных:', error)
      showNotification(
        'Ошибка загрузки данных: ' + (error.message || 'Неизвестная ошибка'),
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  const showNotification = (
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info'
  ) => {
    setNotification({
      message,
      type,
      isVisible: true,
    })
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, isVisible: false }))
    }, 5000)
  }

  const handleBackToMenu = () => {
    window.location.href = '/'
  }

  const handleCreateProduct = () => {
    setSelectedProduct(null)
    setProductModalMode('create')
    setShowProductModal(true)
  }

  const handleSaveProduct = async (productOrProducts: Product | Product[]) => {
    try {
      const products = Array.isArray(productOrProducts)
        ? productOrProducts
        : [productOrProducts]

      for (const product of products) {
        if (productModalMode === 'create' || Array.isArray(productOrProducts)) {
          await adminAPI.createProduct({
            title: product.title,
            description: product.description,
            price: product.price,
            category: product.category,
            images: product.images,
            isActive: product.inStock,
          })
        } else {
          await adminAPI.updateProduct(product.id, {
            title: product.title,
            description: product.description,
            price: product.price,
            category: product.category,
            isActive: product.inStock,
          })
        }
      }

      // silent success
      setShowProductModal(false)

      loadAdminData()
    } catch (error) {
      // silent error
    }
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setProductModalMode('edit')
    setShowProductModal(true)
  }

  const handleDeleteProduct = async (productId: string) => {
    try {
      await adminAPI.deleteProduct(productId)
      loadAdminData()
    } catch (error) {
      console.log(error)
      // silent error
    }
  }

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product)
    setShowProductModal(true)
  }

  const handleCreateUser = () => {
    // Генерируем уникальный email для нового пользователя
    const uniqueEmail = `user${Date.now()}@test.com`

    setSelectedUser({
      id: '',
      telegramId: undefined,
      username: undefined,
      email: uniqueEmail,
      phone: '',
      firstName: '',
      lastName: '',
      avatar: '/avatars/default.jpg',
      balance: 0,
      role: 'BUYER',
      isActive: true,
      isVerified: false,
      isBlocked: false,
      referralCode: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: undefined,
      lastLogin: undefined,
      totalSpent: 0,
      totalEarned: 0,
      dealsCount: 0,
      productsCount: 0,
      blockReason: undefined,
    })
    setUserModalMode('create')
    setShowUserModal(true)
  }

  const handleSaveUser = async (user: UserModalData, userId: string) => {
    try {
      if (userModalMode === 'create') {
        await adminAPI.createUser({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phone: user.phone || '',
          role: user.role,
          verified: user.isVerified,
        })
        showNotification('Пользователь создан', 'success')
      } else {
        console.log
        await adminAPI.updateUser(userId, user)
        showNotification('Пользователь обновлен', 'success')
      }
      setShowUserModal(false)
      loadAdminData()
    } catch (error: any) {
      console.error('Ошибка при сохранении пользователя:', error)

      // Обрабатываем разные типы ошибок
      let errorMessage = 'Ошибка при сохранении пользователя'

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }

      // Специальная обработка для разных статусов
      if (error.response?.status === 409) {
        errorMessage = 'Пользователь с таким email уже существует'
      } else if (error.response?.status === 400) {
        errorMessage = errorMessage || 'Некорректные данные'
      } else if (error.response?.status === 401) {
        errorMessage = 'Необходима авторизация'
      } else if (error.response?.status === 403) {
        errorMessage = 'Недостаточно прав'
      }

      showNotification(errorMessage, 'error')
    }
  }

  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user)
    setUserModalMode('edit')
    setShowUserModal(true)
  }

  const handleBlockUser = async (userId: string, reason: string) => {
    console.log(userId)
    if (
      confirm(
        `Вы уверены, что хотите заблокировать этого пользователя? Причина: ${reason}`
      )
    ) {
      try {
        await adminAPI.blockUser(userId, { reason })
        showNotification('Пользователь заблокирован', 'success')
        loadAdminData()
      } catch (error) {
        showNotification('Ошибка при блокировке пользователя', 'error')
      }
    }
  }

  const handleUnblockUser = async (userId: string) => {
    if (confirm('Вы уверены, что хотите разблокировать этого пользователя?')) {
      try {
        await adminAPI.unblockUser(userId)
        showNotification('Пользователь разблокирован', 'success')
        loadAdminData()
      } catch (error) {
        console.log(error)
        showNotification('Ошибка при разблокировке пользователя', 'error')
      }
    }
  }

  const handleVerifyUser = async (userId: string) => {
    if (confirm('Вы уверены, что хотите верифицировать этого пользователя?')) {
      try {
        await adminAPI.verifyUser(userId)
        showNotification('Пользователь верифицирован', 'success')
        loadAdminData()
      } catch (error) {
        console.log(error)
        showNotification('Ошибка при верификации пользователя', 'error')
      }
    }
  }

  const handleViewDeal = (deal: Deal) => {
    setSelectedDeal(deal)
    setShowDealModal(true)
  }

  const handleCloseDeal = async (dealId: string) => {
    try {
      await adminAPI.closeDeal(dealId)
      loadAdminData()
    } catch (error) {
      // silent error
    }
  }

  const handleOpenDeal = async (dealId: string) => {
    try {
      await adminAPI.openDeal(dealId)
      loadAdminData()
    } catch (error) {
      // silent error
    }
  }

  const handleCancelDeal = async (dealId: string) => {
    try {
      await adminAPI.cancelDeal(dealId)
      loadAdminData()
    } catch (error) {
      // silent error
    }
  }

  const handleDisputeDeal = async (dealId: string) => {
    try {
      await adminAPI.disputeDeal(dealId)
      loadAdminData()
    } catch (error) {
      // silent error
    }
  }

  const handleUpdateDealStatusConfirm = async (
    dealId: string,
    status: DealStatus
  ) => {
    try {
      await adminAPI.updateDealStatus(dealId, status)
      loadAdminData()
    } catch (error) {
      // silent error
    }
  }

  const handleResolveDispute = async (dealId: string, resolution: string) => {
    try {
      // Здесь можно добавить API для разрешения спора
      loadAdminData()
    } catch (error) {
      // silent error
    }
  }

  const handleReplyToSupportMessage = async (
    ticketId: string,
    content: string
  ) => {
    try {
      await supportAPI.replyToTicket(ticketId, content)

      showNotification('Ответ отправлен пользователю', 'success')
      setSelectedMessage(null)
      setReplyText('')
      loadAdminData()
    } catch (error) {
      console.log(error)
      showNotification('Ошибка при отправке ответа', 'error')
    }
  }

  const renderDashboard = () => (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Панель</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <UserGroupIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                Пользователи
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {stats.totalUsers}
              </p>
              <p className="text-xs sm:text-sm text-green-600 truncate">
                +{stats.newUsersToday}% за месяц
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
              <ShoppingBagIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                Товары
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {stats.totalProducts}
              </p>
              <p className="text-xs sm:text-sm text-green-600 truncate">
                +{stats.newProductsToday}% за месяц
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
              <ChartBarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                Сделки
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {stats.totalDeals}
              </p>
              <p className="text-xs sm:text-sm text-green-600 truncate">
                +{stats.completedDealsToday}% за месяц
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
              <ChatBubbleLeftRightIcon className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                Сообщения
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {stats.pendingMessages}
              </p>
              <p className="text-xs sm:text-sm text-red-600 truncate">
                Требуют внимания
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Доход */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Общий доход
        </h3>
        <div className="text-3xl font-bold text-green-600">
          {stats.revenue.toLocaleString()} ₽
        </div>
        <p className="text-sm text-gray-600 mt-2">За все время</p>
      </Card>
    </div>
  )

  const renderProducts = () => (
    <div className="space-y-6">
      <ProductManagement
        products={products}
        onEditProduct={handleEditProduct}
        onDeleteProduct={handleDeleteProduct}
        onViewProduct={handleViewProduct}
        onCreateProduct={handleCreateProduct}
      />
    </div>
  )

  const renderDeals = () => (
    <DealManagementMobile
      deals={deals}
      onViewDeal={handleViewDeal}
      onUpdateDealStatus={handleUpdateDealStatusConfirm}
      onResolveDispute={handleResolveDispute}
      onCloseDeal={handleCloseDeal}
      onOpenDeal={handleOpenDeal}
      onCancelDeal={handleCancelDeal}
      onDisputeDeal={handleDisputeDeal}
    />
  )

  const renderUsers = () => (
    <UserManagement
      users={users}
      onEditUser={handleEditUser}
      onBlockUser={handleBlockUser}
      onUnblockUser={handleUnblockUser}
      onVerifyUser={handleVerifyUser}
      onCreateUser={handleCreateUser}
    />
  )

  const renderMessages = () => (
    <ChatMessages tickets={tickets} onReply={handleReplyToSupportMessage} />
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 space-y-4 sm:space-y-0">
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
                  Админ панель
                </h1>
              </div>
              <p className="text-sm sm:text-base text-gray-600 truncate">
                Управление платформой и пользователями
              </p>
            </div>
            <Button
              onClick={handleBackToMenu}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Назад в меню</span>
              <span className="sm:hidden">Назад</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <nav className="flex overflow-x-auto space-x-2 sm:space-x-8 pb-2 sm:pb-0">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as AdminTab)}
                  className={`py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center space-x-1 sm:space-x-2 whitespace-nowrap w-full ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 sm:h-5 sm:w-5 flex-shrink-0 text-center w-full" />
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Загрузка данных...</p>
            </div>
          </div>
        )}

        {!loading && (
          <>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'messages' && renderMessages()}
            {activeTab === 'products' && renderProducts()}
            {activeTab === 'deals' && renderDeals()}
            {activeTab === 'users' && renderUsers()}
          </>
        )}
      </div>

      {/* Modals */}
      {showProductModal && (
        <EnhancedProductModal
          product={selectedProduct}
          mode={productModalMode}
          onClose={() => setShowProductModal(false)}
          onSave={handleSaveProduct}
        />
      )}

      {showUserModal && (
        <UserModal
          user={selectedUser}
          mode={userModalMode}
          onClose={() => setShowUserModal(false)}
          onSave={handleSaveUser}
        />
      )}

      {showDealModal && selectedDeal && (
        <DealModal
          deal={selectedDeal}
          onClose={() => setShowDealModal(false)}
          onUpdate={async (deal) => {
            try {
              await adminAPI.updateDealStatus(deal.id, deal.status)
              showNotification('Сделка обновлена', 'success')
              setShowDealModal(false)
              loadAdminData()
            } catch (error) {
              showNotification('Ошибка при обновлении сделки', 'error')
            }
          }}
        />
      )}
    </div>
  )
}

export default function AdminPage() {
  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <MainLayout>
        <AdminContent />
      </MainLayout>
    </RoleGuard>
  )
}
