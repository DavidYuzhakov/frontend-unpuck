'use client'

import { CatalogContent } from '@/components/catalog/catalog-content'
import { MainLayout } from '@/components/layouts/main-layout'
import { useTelegramData } from '@/components/providers/telegram-data-provider'

export default function CatalogPage() {
  const { userData, isLoading, isInTelegram } = useTelegramData()

  // Отладочная информация
  console.log('🔍 CatalogPage - userData:', userData)
  console.log('🔍 CatalogPage - isInTelegram:', isInTelegram)
  console.log('🔍 CatalogPage - isLoading:', isLoading)

  return (
    <MainLayout>
      <CatalogContent />
    </MainLayout>
  )
}

