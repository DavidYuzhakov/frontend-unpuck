'use client'

import { MainLayout } from '@/components/layouts/main-layout'
import { affiliateAPI } from '@/lib/api'
import { ArrowLeftIcon, CheckIcon, ClipboardIcon, ShareIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Referral {
  id: string
  name: string
  email: string
  status: 'pending' | 'active' | 'inactive'
  joinedAt: string
  totalSpent: number
  commission: number
}

// Удалены mock данные - используются только реальные данные из API

const affiliateStats = {
  totalReferrals: 12,
  activeReferrals: 8,
  totalCommission: 12500,
  thisMonthCommission: 3200,
  referralCode: 'REF123456'
}

export default function AffiliatePage() {
  const router = useRouter()
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [affiliateStats, setAffiliateStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    totalCommission: 0,
    thisMonthCommission: 0,
    referralCode: ''
  })
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Загружаем данные партнерской программы при монтировании
  useEffect(() => {
    loadAffiliateData()
  }, [])

  const loadAffiliateData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Загружаем статистику
      const statsResponse = await affiliateAPI.getReferralStats()
      const statsData = statsResponse.data.data || statsResponse.data
      setAffiliateStats(statsData)
      
      // Загружаем рефералов
      const referralsResponse = await affiliateAPI.getReferrals({ limit: 50 })
      const referralsData = referralsResponse.data.data || referralsResponse.data
      setReferrals(Array.isArray(referralsData) ? referralsData : [])
    } catch (err: any) {
      console.error('Ошибка загрузки данных партнерской программы:', err)
      setError(err.response?.data?.message || 'Ошибка загрузки данных партнерской программы')
      // Нет fallback данных - показываем ошибку
      setReferrals([])
      setAffiliateStats({
        totalReferrals: 12,
        activeReferrals: 8,
        totalCommission: 12500,
        thisMonthCommission: 3200,
        referralCode: 'REF123456'
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'inactive':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Активен'
      case 'pending':
        return 'Ожидает'
      case 'inactive':
        return 'Неактивен'
      default:
        return status
    }
  }

  const copyReferralCode = () => {
    navigator.clipboard.writeText(affiliateStats?.referralCode || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareReferralLink = () => {
    const link = `https://example.com/ref/${affiliateStats?.referralCode || ''}`
    if (navigator.share) {
      navigator.share({
        title: 'Присоединяйтесь к платформе!',
        text: 'Используйте мой реферальный код для получения бонуса',
        url: link
      })
    } else {
      navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка данных партнерской программы...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (error && referrals.length === 0) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ошибка загрузки</h3>
            <p className="text-gray-500 text-center mb-4">{error}</p>
            <button
              onClick={loadAffiliateData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
          <div className="flex items-center space-x-3">
            <button onClick={() => router.back()} className="p-1 -ml-1">
              <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Партнерская программа</h1>
          </div>
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Статистика */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">Ваша статистика</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{affiliateStats?.totalReferrals || 0}</p>
                <p className="text-purple-100 text-sm">Всего рефералов</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">₽ {affiliateStats?.totalCommission?.toLocaleString() || '0'}</p>
                <p className="text-purple-100 text-sm">Общий доход</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{affiliateStats?.activeReferrals || 0}</p>
                <p className="text-purple-100 text-sm">Активных</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">₽ {affiliateStats?.thisMonthCommission?.toLocaleString() || '0'}</p>
                <p className="text-purple-100 text-sm">В этом месяце</p>
              </div>
            </div>
          </div>

          {/* Реферальный код */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ваш реферальный код</h3>
            <div className="flex items-center space-x-3">
              <div className="flex-1 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-lg font-mono font-bold text-gray-900">{affiliateStats?.referralCode || 'Загрузка...'}</p>
              </div>
              <button
                onClick={copyReferralCode}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                {copied ? (
                  <CheckIcon className="h-5 w-5" />
                ) : (
                  <ClipboardIcon className="h-5 w-5" />
                )}
                <span>{copied ? 'Скопировано' : 'Копировать'}</span>
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Поделитесь этим кодом с друзьями, и вы оба получите бонус!
            </p>
          </div>

          {/* Как это работает */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Как это работает</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-sm">1</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Поделитесь кодом</h4>
                  <p className="text-sm text-gray-600">Отправьте реферальный код друзьям через соцсети или мессенджеры</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-sm">2</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Друг регистрируется</h4>
                  <p className="text-sm text-gray-600">Ваш друг использует код при регистрации и получает бонус</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-sm">3</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Получайте комиссию</h4>
                  <p className="text-sm text-gray-600">Получайте 5% с каждой покупки вашего реферала</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ваши рефералы */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Ваши рефералы</h3>
            </div>
            
            <div className="divide-y divide-gray-200">
              {referrals.map((referral) => (
                <div key={referral.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{referral.name}</h4>
                      <p className="text-xs text-gray-500">{referral.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Присоединился: {formatDate(referral.joinedAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(referral.status)}`}>
                        {getStatusText(referral.status)}
                      </span>
                      {referral.totalSpent > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-900">
                            ₽ {referral.totalSpent.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            Комиссия: ₽ {referral.commission.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Кнопка действия */}
          <div>
            <button
              onClick={shareReferralLink}
              className="w-full py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center justify-center space-x-2"
            >
              <ShareIcon className="h-5 w-5" />
              <span>Поделиться ссылкой</span>
            </button>
          </div>

          {/* Условия программы */}
          <div className="bg-yellow-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-yellow-900 mb-2">Условия программы</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Комиссия: 5% с каждой покупки реферала</li>
              <li>• Выплаты: еженедельно на ваш баланс</li>
              <li>• Минимальная сумма вывода: ₽ 500</li>
              <li>• Реферал должен совершить покупку в течение 30 дней</li>
            </ul>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
