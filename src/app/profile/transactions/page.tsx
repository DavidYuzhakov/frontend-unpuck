'use client'

import { MainLayout } from '@/components/layouts/main-layout'
import { profileAPI } from '@/lib/api'
import { tokenManager } from '@/lib/token-manager'
import { useAuthStore } from '@/store/auth'
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowUpIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useEffect, useState } from 'react'
// toast removed

interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  description: string
  status: 'completed' | 'pending' | 'failed'
  createdAt: string
  category: string
  paymentMethod?: string
}

export default function TransactionsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const { login } = useAuthStore()

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    try {
      setIsLoading(true)

      // Проверяем, есть ли уже токен в глобальном менеджере
      if (!tokenManager.isAuthenticated()) {
        console.log(
          '🔐 Токен не найден, пытаемся авторизоваться автоматически...'
        )
        const authResult = await tokenManager.autoAuth()
        if (authResult) {
          // Сохраняем данные авторизации в store для совместимости
          login(authResult.user, authResult.token)
          console.log(
            '🔐 Автоматическая авторизация успешна:',
            authResult.user.firstName,
            authResult.user.lastName
          )
        }
      } else {
        console.log('🔑 Используем существующий токен из глобального менеджера')
      }

      const response = await profileAPI.getTransactions()
      console.log('📊 Ответ API:', response.data)

      if (response.data) {
        // Обрабатываем данные из allActivity
        const allActivity = response.data.allActivity || []
        const transactions = allActivity.map((item: any) => ({
          id: item.id,
          type: getTransactionType(item.type),
          amount: Number(item.amount),
          description: item.description || getTransactionDescription(item.type),
          status: item.status.toLowerCase(),
          createdAt: item.createdAt,
          category: getTransactionCategory(item.type),
          paymentMethod:
            item.paymentMethod || getPaymentMethodFromType(item.type),
        }))

        setTransactions(transactions)
        console.log('✅ Загружены транзакции:', transactions)
      }
    } catch (error: any) {
      console.error('Ошибка загрузки транзакций:', error)

      // Если ошибка 401 (не авторизован), показываем демо данные
      if (error.response?.status === 401) {
        console.log('🔐 Пользователь не авторизован, показываем демо данные')
        setTransactions([
          {
            id: '1',
            type: 'income',
            amount: 5000,
            description: 'Продажа товара "iPhone 15 Pro"',
            status: 'completed',
            createdAt: '2024-01-15T10:30:00Z',
            category: 'Продажа',
            paymentMethod: 'card',
          },
          {
            id: '2',
            type: 'expense',
            amount: 1500,
            description: 'Покупка товара "AirPods Pro"',
            status: 'completed',
            createdAt: '2024-01-14T15:20:00Z',
            category: 'Покупка',
            paymentMethod: 'wallet',
          },
          {
            id: '3',
            type: 'income',
            amount: 2500,
            description: 'Партнерская комиссия',
            status: 'completed',
            createdAt: '2024-01-13T09:15:00Z',
            category: 'Партнерство',
            paymentMethod: 'bank',
          },
        ])
      } else {
        // Для других ошибок показываем ошибку
        console.error(
          '❌ Не удалось загрузить транзакции. Проверьте подключение к серверу.'
        )
        setTransactions([])
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Вспомогательные функции для преобразования типов транзакций
  const getTransactionType = (type: string): 'income' | 'expense' => {
    switch (type) {
      case 'DEPOSIT':
      case 'REFERRAL':
      case 'COMMISSION':
        return 'income'
      case 'WITHDRAWAL':
      case 'PAYMENT':
      case 'CAMPAIGN_PAYMENT':
        return 'expense'
      default:
        return 'expense'
    }
  }

  const getTransactionDescription = (type: string): string => {
    switch (type) {
      case 'DEPOSIT':
        return 'Пополнение баланса'
      case 'WITHDRAWAL':
        return 'Вывод средств'
      case 'COMMISSION':
        return 'Комиссия платформы'
      case 'REFERRAL':
        return 'Партнерская комиссия'
      case 'CAMPAIGN_PAYMENT':
        return 'Оплата рекламной компании'
      case 'PAYMENT':
        return 'Платеж за товар'
      default:
        return 'Транзакция'
    }
  }

  const getTransactionCategory = (type: string): string => {
    switch (type) {
      case 'DEPOSIT':
        return 'Пополнение'
      case 'WITHDRAWAL':
        return 'Вывод'
      case 'COMMISSION':
        return 'Комиссия'
      case 'REFERRAL':
        return 'Партнерство'
      case 'CAMPAIGN_PAYMENT':
        return 'Реклама'
      case 'PAYMENT':
        return 'Покупка'
      default:
        return 'Другое'
    }
  }

  const getPaymentMethodFromType = (type: string): string => {
    switch (type) {
      case 'DEPOSIT':
      case 'WITHDRAWAL':
        return 'card'
      case 'COMMISSION':
      case 'REFERRAL':
        return 'bank'
      case 'CAMPAIGN_PAYMENT':
      case 'PAYMENT':
        return 'wallet'
      default:
        return 'card'
    }
  }

  // Функции для отображения
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50'
      case 'pending':
        return 'text-yellow-600 bg-yellow-50'
      case 'failed':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Завершена'
      case 'pending':
        return 'В обработке'
      case 'failed':
        return 'Ошибка'
      default:
        return status
    }
  }

  const getTypeIcon = (type: string) => {
    return type === 'income' ? (
      <ArrowUpIcon className="h-5 w-5 text-green-500" />
    ) : (
      <ArrowDownIcon className="h-5 w-5 text-red-500" />
    )
  }

  const getTypeColor = (type: string) => {
    return type === 'income' ? 'text-green-600' : 'text-red-600'
  }

  const getPaymentMethodIcon = (method?: string) => {
    switch (method) {
      case 'card':
        return '💳'
      case 'wallet':
        return '💰'
      case 'bank':
        return '🏦'
      case 'crypto':
        return '₿'
      default:
        return '💳'
    }
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center space-x-4">
            <Link
              href="/profile"
              className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Транзакции</h1>
          </div>
        </div>

        {/* Transactions List - Full Screen */}
        <div className="px-4 py-4">
          {transactions.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">Транзакции не найдены</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 mt-0.5">
                        {getTypeIcon(transaction.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 break-words">
                          {transaction.description}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-500">
                            {transaction.category}
                          </span>
                          {transaction.paymentMethod && (
                            <>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500">
                                {getPaymentMethodIcon(
                                  transaction.paymentMethod
                                )}
                              </span>
                            </>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(transaction.createdAt).toLocaleDateString(
                            'ru-RU',
                            {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p
                        className={`text-lg font-semibold ${getTypeColor(
                          transaction.type
                        )} whitespace-nowrap`}
                      >
                        {transaction.type === 'income' ? '+' : '-'}
                        {transaction.amount.toLocaleString()} ₽
                      </p>
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(
                          transaction.status
                        )} whitespace-nowrap mt-1`}
                      >
                        {getStatusText(transaction.status)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
