'use client'

import { DealsContent } from '@/components/deals/deals-content'
import { MainLayout } from '@/components/layouts/main-layout'
import { useTelegramData } from '@/components/providers/telegram-data-provider'

export default function DealsPage() {
  const { userData, isLoading, isInTelegram } = useTelegramData()

  // Отладочная информация
  console.log('🔍 DealsPage - userData:', userData)
  console.log('🔍 DealsPage - isInTelegram:', isInTelegram)
  console.log('🔍 DealsPage - isLoading:', isLoading)

  return (
    <MainLayout>
      <DealsContent />
    </MainLayout>
  )
}

