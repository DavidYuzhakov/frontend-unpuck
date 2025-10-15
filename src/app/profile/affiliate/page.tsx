'use client'

import { MainLayout } from '@/components/layouts/main-layout'
import { affiliateAPI } from '@/lib/api'
import { ArrowLeftIcon, ShareIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useEffect, useState } from 'react'
// toast removed

interface AffiliateStats {
  referralLink: string
}

export default function AffiliatePage() {
  // Инициализируем с моковыми данными, чтобы избежать ошибок
  const [stats, setStats] = useState<AffiliateStats>({
    referralLink: 'https://unpacksbot.com/ref/IVAN2024'
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSharing, setIsSharing] = useState(false)

  useEffect(() => {
    loadAffiliateStats()
  }, [])

  const loadAffiliateStats = async () => {
    try {
      setIsLoading(true)
      console.log('Загружаем данные партнерской программы...')
      
      try {
        const response = await affiliateAPI.getReferralStats()
        console.log('Ответ API:', response)
        
        if (response?.data) {
          const data = response.data.data || response.data
          console.log('Данные из API:', data)
          
          if (data?.referralLink) {
            setStats({
              referralLink: data.referralLink
            })
            console.log('Установлена ссылка из API:', data.referralLink)
          } else {
            console.log('API не вернул referralLink, используем моковые данные')
          }
        } else {
          console.log('API не вернул данные, используем моковые данные')
        }
      } catch (apiError) {
        console.error('Ошибка API, используем моковые данные:', apiError)
        // Моковые данные уже установлены при инициализации
      }
      
    } catch (error: any) {
      console.error('Общая ошибка загрузки:', error)
      // Моковые данные уже установлены при инициализации
    } finally {
      setIsLoading(false)
    }
  }



  const shareReferralLink = async () => {
    console.log('Текущее состояние stats:', stats)
    
    const referralLink = stats?.referralLink || 'https://unpacksbot.com/ref/IVAN2024'
    console.log('Используем ссылку:', referralLink)

    if (isSharing) {
      return // Предотвращаем множественные нажатия
    }

    setIsSharing(true)
    console.log('Попытка поделиться ссылкой:', referralLink)
    console.log('navigator.share доступен:', !!navigator.share)
    console.log('navigator.clipboard доступен:', !!navigator.clipboard)

    try {
      // Проверяем поддержку нативного API поделиться
      if (navigator.share) {
        console.log('Используем нативное API поделиться')
        await navigator.share({
          title: 'Присоединяйтесь к UnpacksBot!',
          text: 'Зарабатывайте с нами через партнерскую программу',
          url: referralLink
        })
        // success silent
        return
      }

      // Fallback: копируем в буфер обмена
      console.log('Используем fallback - копирование в буфер обмена')
      
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(referralLink)
        return
      }

      // Если clipboard API недоступен, используем старый метод
      console.log('Используем старый метод копирования')
      const textArea = document.createElement('textarea')
      textArea.value = referralLink
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      
      if (!successful) {
        throw new Error('Не удалось скопировать ссылку')
      }

    } catch (error) {
      console.error('Ошибка при попытке поделиться:', error)
    } finally {
      setIsSharing(false)
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
            <h1 className="text-xl font-bold text-gray-900">Партнерская программа</h1>
          </div>
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Referral Link */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Ваша реферальная ссылка</h3>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600 break-all">
                  {stats?.referralLink || 'https://unpacksbot.com/ref/IVAN2024'}
                </p>
              </div>
              <button
                onClick={shareReferralLink}
                disabled={isSharing}
                className={`w-full flex items-center justify-center space-x-2 py-3 rounded-lg transition-colors ${
                  isSharing 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSharing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Копируем...</span>
                  </>
                ) : (
                  <>
                    <ShareIcon className="h-5 w-5" />
                    <span>Поделиться</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}




