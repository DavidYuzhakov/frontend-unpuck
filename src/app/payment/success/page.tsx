'use client'

import { MainLayout } from '@/components/layouts/main-layout'
import { ArrowRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [paymentData, setPaymentData] = useState<{
    amount?: string
    paymentId?: string
  } | null>(null)

  useEffect(() => {
    // Получение данных из URL параметров
    const amount = searchParams.get('amount')
    const paymentId = searchParams.get('payment_id')
    
    if (amount || paymentId) {
      setPaymentData({
        amount: amount || undefined,
        paymentId: paymentId || undefined
      })
    }
  }, [searchParams])

  const handleGoToDeals = () => {
    router.push('/deals')
  }

  const handleGoToHome = () => {
    router.push('/')
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-white">
        {/* Заголовок */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-center">
            <h1 className="text-xl font-bold text-gray-900">Оплата завершена</h1>
          </div>
        </div>

        {/* Успешная оплата */}
        <div className="px-4 py-8">
          <div className="text-center">
            <CheckCircleIcon className="h-20 w-20 text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Оплата успешно завершена!</h2>
            
            {paymentData?.amount && (
              <p className="text-lg text-gray-600 mb-2">
                Сумма: <span className="font-semibold">{paymentData.amount} ₽</span>
              </p>
            )}
            
            {paymentData?.paymentId && (
              <p className="text-sm text-gray-500 mb-8">
                ID платежа: {paymentData.paymentId}
              </p>
            )}
            
            <p className="text-gray-600 mb-8">
              Ваш заказ принят в обработку. Мы уведомим вас о статусе заказа.
            </p>
            
            <div className="space-y-4">
              <button
                onClick={handleGoToDeals}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Перейти к сделкам</span>
                <ArrowRightIcon className="h-5 w-5" />
              </button>
              
              <button
                onClick={handleGoToHome}
                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                На главную
              </button>
            </div>
          </div>
        </div>

        {/* Дополнительная информация */}
        <div className="px-4 py-6 bg-gray-50">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Что дальше?</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Проверьте статус заказа в разделе "Сделки"</p>
              <p>• Свяжитесь с продавцом для уточнения деталей</p>
              <p>• Оставьте отзыв после получения товара</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}