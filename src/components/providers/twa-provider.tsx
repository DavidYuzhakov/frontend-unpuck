'use client'

import { useSuppressHydrationWarning } from '@/hooks/use-suppress-hydration-warning'
import { createContext, useContext, useEffect, useState } from 'react'
import { ClientOnly } from '../client-only'

interface TWAContextType {
  isTWA: boolean
  theme: 'light' | 'dark'
  platform: string
  version: string
  initData: string | null
  initDataUnsafe: any
  isExpanded: boolean
  viewportHeight: number
  viewportStableHeight: number
  headerColor: string
  backgroundColor: string
  isClosingConfirmationEnabled: boolean
  isVerticalSwipesEnabled: boolean
  isHorizontalSwipesEnabled: boolean
  ready: () => void
  expand: () => void
  close: () => void
  enableClosingConfirmation: () => void
  disableClosingConfirmation: () => void
  enableVerticalSwipes: () => void
  disableVerticalSwipes: () => void
  enableHorizontalSwipes: () => void
  disableHorizontalSwipes: () => void
  onEvent: (eventType: string, eventHandler: () => void) => void
  offEvent: (eventType: string, eventHandler: () => void) => void
  sendData: (data: any) => void
  showAlert: (message: string) => void
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void
  showPopup: (params: any, callback?: (buttonId: string) => void) => void
  showScanQrPopup: (params: any, callback?: (text: string) => void) => void
  closeScanQrPopup: () => void
  readTextFromClipboard: (callback?: (text: string) => void) => void
  requestWriteAccess: (callback?: (granted: boolean) => void) => void
  requestContact: (callback?: (granted: boolean, contact?: any) => void) => void
  openLink: (url: string, options?: any) => void
  openTelegramLink: (url: string) => void
  openInvoice: (url: string, callback?: (status: string) => void) => void
}

const TWAContext = createContext<TWAContextType | null>(null)

function TWAProviderContent({ children }: { children: React.ReactNode }) {
  // Suppress hydration warnings from external sources
  useSuppressHydrationWarning()
  
  const [isTWA, setIsTWA] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [platform, setPlatform] = useState('')
  const [version, setVersion] = useState('')
  const [initData, setInitData] = useState<string | null>(null)
  const [initDataUnsafe, setInitDataUnsafe] = useState<any>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [viewportHeight, setViewportHeight] = useState(0)
  const [viewportStableHeight, setViewportStableHeight] = useState(0)
  const [headerColor, setHeaderColor] = useState('')
  const [backgroundColor, setBackgroundColor] = useState('')
  const [isClosingConfirmationEnabled, setIsClosingConfirmationEnabled] = useState(false)
  const [isVerticalSwipesEnabled, setIsVerticalSwipesEnabled] = useState(true)
  const [isHorizontalSwipesEnabled, setIsHorizontalSwipesEnabled] = useState(true)

  useEffect(() => {
    // Set client-side flag
    setIsClient(true)
    
    const initTWA = async () => {
      // Ждем инициализации TWA
      let tg = window.Telegram?.WebApp
      let attempts = 0
      const maxAttempts = 10

      while (!tg && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100))
        tg = window.Telegram?.WebApp
        attempts++
      }

      if (tg) {
        console.log('✅ TWA Provider: Telegram WebApp найден')
        setIsTWA(true)
        setTheme(tg.colorScheme)
        setPlatform(tg.platform)
        setVersion(tg.version)
        setInitData(tg.initData)
        setInitDataUnsafe(tg.initDataUnsafe)
        setIsExpanded(tg.isExpanded)
        setViewportHeight(tg.viewportHeight)
        setViewportStableHeight(tg.viewportStableHeight)
        setHeaderColor(tg.headerColor)
        setBackgroundColor(tg.backgroundColor)
        setIsClosingConfirmationEnabled(tg.isClosingConfirmationEnabled)
        setIsVerticalSwipesEnabled(tg.isVerticalSwipesEnabled)
        setIsHorizontalSwipesEnabled(tg.isHorizontalSwipesEnabled)

        // Слушаем изменения темы
        tg.onEvent('themeChanged', () => {
          setTheme(tg.colorScheme)
        })

        // Слушаем изменения viewport
        tg.onEvent('viewportChanged', () => {
          setViewportHeight(tg.viewportHeight)
          setViewportStableHeight(tg.viewportStableHeight)
          setIsExpanded(tg.isExpanded)
        })
      } else {
        console.log('❌ TWA Provider: Telegram WebApp не найден')
      }
    }

    if (typeof window !== 'undefined') {
      initTWA()
    }
  }, [])

  const contextValue: TWAContextType = {
    isTWA,
    theme,
    platform,
    version,
    initData,
    initDataUnsafe,
    isExpanded,
    viewportHeight,
    viewportStableHeight,
    headerColor,
    backgroundColor,
    isClosingConfirmationEnabled,
    isVerticalSwipesEnabled,
    isHorizontalSwipesEnabled,
    ready: () => window.Telegram?.WebApp?.ready(),
    expand: () => window.Telegram?.WebApp?.expand(),
    close: () => window.Telegram?.WebApp?.close(),
    enableClosingConfirmation: () => window.Telegram?.WebApp?.enableClosingConfirmation(),
    disableClosingConfirmation: () => window.Telegram?.WebApp?.disableClosingConfirmation(),
    enableVerticalSwipes: () => window.Telegram?.WebApp?.enableVerticalSwipes(),
    disableVerticalSwipes: () => window.Telegram?.WebApp?.disableVerticalSwipes(),
    enableHorizontalSwipes: () => window.Telegram?.WebApp?.enableHorizontalSwipes(),
    disableHorizontalSwipes: () => window.Telegram?.WebApp?.disableHorizontalSwipes(),
    onEvent: (eventType: string, eventHandler: () => void) => window.Telegram?.WebApp?.onEvent(eventType, eventHandler),
    offEvent: (eventType: string, eventHandler: () => void) => window.Telegram?.WebApp?.offEvent(eventType, eventHandler),
    sendData: (data: any) => window.Telegram?.WebApp?.sendData(data),
    showAlert: (message: string) => window.Telegram?.WebApp?.showAlert(message),
    showConfirm: (message: string, callback?: (confirmed: boolean) => void) => window.Telegram?.WebApp?.showConfirm(message, callback),
    showPopup: (params: any, callback?: (buttonId: string) => void) => window.Telegram?.WebApp?.showPopup(params, callback),
    showScanQrPopup: (params: any, callback?: (text: string) => void) => window.Telegram?.WebApp?.showScanQrPopup(params, callback),
    closeScanQrPopup: () => window.Telegram?.WebApp?.closeScanQrPopup(),
    readTextFromClipboard: (callback?: (text: string) => void) => window.Telegram?.WebApp?.readTextFromClipboard(callback),
    requestWriteAccess: (callback?: (granted: boolean) => void) => window.Telegram?.WebApp?.requestWriteAccess(callback),
    requestContact: (callback?: (granted: boolean, contact?: any) => void) => window.Telegram?.WebApp?.requestContact(callback),
    openLink: (url: string, options?: any) => window.Telegram?.WebApp?.openLink(url, options),
    openTelegramLink: (url: string) => window.Telegram?.WebApp?.openTelegramLink(url),
    openInvoice: (url: string, callback?: (status: string) => void) => window.Telegram?.WebApp?.openInvoice(url, callback),
  }

  return (
    <TWAContext.Provider value={contextValue}>
      {children}
    </TWAContext.Provider>
  )
}

export function useTWA() {
  const context = useContext(TWAContext)
  if (!context) {
    throw new Error('useTWA must be used within a TWAProvider')
  }
  return context
}

// Расширяем Window interface для TypeScript
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void
        expand: () => void
        close: () => void
        colorScheme: 'light' | 'dark'
        platform: string
        version: string
        initData: string
        initDataUnsafe: any
        isExpanded: boolean
        viewportHeight: number
        viewportStableHeight: number
        headerColor: string
        backgroundColor: string
        isClosingConfirmationEnabled: boolean
        isVerticalSwipesEnabled: boolean
        isHorizontalSwipesEnabled: boolean
        enableClosingConfirmation: () => void
        disableClosingConfirmation: () => void
        enableVerticalSwipes: () => void
        disableVerticalSwipes: () => void
        enableHorizontalSwipes: () => void
        disableHorizontalSwipes: () => void
        onEvent: (eventType: string, eventHandler: () => void) => void
        offEvent: (eventType: string, eventHandler: () => void) => void
        sendData: (data: any) => void
        showAlert: (message: string) => void
        showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void
        showPopup: (params: any, callback?: (buttonId: string) => void) => void
        showScanQrPopup: (params: any, callback?: (text: string) => void) => void
        closeScanQrPopup: () => void
        readTextFromClipboard: (callback?: (text: string) => void) => void
        requestWriteAccess: (callback?: (granted: boolean) => void) => void
        requestContact: (callback?: (granted: boolean, contact?: any) => void) => void
        openLink: (url: string, options?: any) => void
        openTelegramLink: (url: string) => void
        openInvoice: (url: string, callback?: (status: string) => void) => void
      }
    }
  }
}

export function TWAProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClientOnly fallback={<div>{children}</div>}>
      <TWAProviderContent>{children}</TWAProviderContent>
    </ClientOnly>
  )
}
