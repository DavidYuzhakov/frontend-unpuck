'use client'

import dynamic from 'next/dynamic'
import { ComponentType } from 'react'

// Компонент для ленивой загрузки страниц
export function createLazyPage<T = {}>(importFunc: () => Promise<{ default: ComponentType<T> }>) {
  return dynamic(importFunc, {
    loading: () => (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    ),
    ssr: false, // Отключаем SSR для лучшей производительности
  })
}

// Предзагруженные страницы
export const LazyCatalogPage = createLazyPage(() => import('@/app/catalog/page'))
export const LazyProfilePage = createLazyPage(() => import('@/app/profile/page'))
export const LazyDealsPage = createLazyPage(() => import('@/app/deals/page'))
export const LazyAdminPage = createLazyPage(() => import('@/app/admin/page'))
export const LazySellerPage = createLazyPage(() => import('@/app/seller/page'))
export const LazyBloggerPage = createLazyPage(() => import('@/app/blogger/page'))
export const LazyManagerPage = createLazyPage(() => import('@/app/manager/page'))
export const LazyAffiliatePage = createLazyPage(() => import('@/app/affiliate/page'))
export const LazyStatisticsPage = createLazyPage(() => import('@/app/statistics/page'))
export const LazySupportPage = createLazyPage(() => import('@/app/support/page'))
export const LazyAcademyPage = createLazyPage(() => import('@/app/academy/page'))
export const LazyFaqPage = createLazyPage(() => import('@/app/faq/page'))
export const LazyPaymentPage = createLazyPage(() => import('@/app/payment/page'))
export const LazySecureDealPage = createLazyPage(() => import('@/app/secure-deal/page'))
