'use client'

import { createContext, ReactNode, useContext, useEffect, useState } from 'react'

interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  is_premium?: boolean
  photo_url?: string
}

interface TelegramWebApp {
  initData: string
  initDataUnsafe: {
    user?: TelegramUser
    auth_date?: number
    hash?: string
  }
  version: string
  platform: string
  colorScheme: 'light' | 'dark'
  themeParams: {
    bg_color?: string
    text_color?: string
    hint_color?: string
    link_color?: string
    button_color?: string
    button_text_color?: string
    secondary_bg_color?: string
  }
  isExpanded: boolean
  viewportHeight: number
  viewportStableHeight: number
  headerColor: string
  backgroundColor: string
  isClosingConfirmationEnabled: boolean
  BackButton: {
    isVisible: boolean
    show(): void
    hide(): void
    onClick(callback: () => void): void
    offClick(callback: () => void): void
  }
  MainButton: {
    text: string
    color: string
    textColor: string
    isVisible: boolean
    isProgressVisible: boolean
    isActive: boolean
    setText(text: string): void
    onClick(callback: () => void): void
    offClick(callback: () => void): void
    show(): void
    hide(): void
    enable(): void
    disable(): void
    showProgress(leaveActive?: boolean): void
    hideProgress(): void
    setParams(params: {
      text?: string
      color?: string
      text_color?: string
      is_active?: boolean
      is_visible?: boolean
    }): void
  }
  HapticFeedback: {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void
    notificationOccurred(type: 'error' | 'success' | 'warning'): void
    selectionChanged(): void
  }
  CloudStorage: {
    setItem(key: string, value: string, callback?: (error: string | null, result?: boolean) => void): void
    getItem(key: string, callback: (error: string | null, result?: string) => void): void
    getItems(keys: string[], callback: (error: string | null, result?: Record<string, string>) => void): void
    removeItem(key: string, callback?: (error: string | null, result?: boolean) => void): void
    removeItems(keys: string[], callback?: (error: string | null, result?: boolean) => void): void
    getKeys(callback: (error: string | null, result?: string[]) => void): void
  }
  BiometricManager: {
    isInited: boolean
    isBiometricAvailable: boolean
    biometricType: 'finger' | 'face' | 'unknown'
    isAccessRequested: boolean
    isAccessGranted: boolean
    isBiometricTokenSaved: boolean
    requestAccess(params: {
      reason?: string
    }, callback: (granted: boolean) => void): void
    authenticate(params: {
      reason?: string
    }, callback: (success: boolean, token?: string) => void): void
    updateBiometricToken(token: string, callback: (updated: boolean) => void): void
    openSettings(): void
  }
  ready(): void
  expand(): void
  close(): void
  sendData(data: string): void
  switchInlineQuery(query: string, choose_chat_types?: string[]): void
  openLink(url: string, options?: { try_instant_view?: boolean }): void
  openTelegramLink(url: string): void
  openInvoice(url: string, callback?: (status: string) => void): void
  showPopup(params: {
    title?: string
    message: string
    buttons?: Array<{
      id?: string
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'
      text?: string
    }>
  }, callback?: (buttonId: string) => void): void
  showAlert(message: string, callback?: () => void): void
  showConfirm(message: string, callback?: (confirmed: boolean) => void): void
  showScanQrPopup(params: {
    text?: string
  }, callback?: (text: string) => void): void
  closeScanQrPopup(): void
  readTextFromClipboard(callback?: (text: string) => void): void
  requestWriteAccess(callback?: (granted: boolean) => void): void
  requestContact(callback?: (granted: boolean) => void): void
  onEvent(eventType: string, eventHandler: () => void): void
  offEvent(eventType: string, eventHandler: () => void): void
  sendData(data: string): void
  switchInlineQuery(query: string, choose_chat_types?: string[]): void
  openLink(url: string, options?: { try_instant_view?: boolean }): void
  openTelegramLink(url: string): void
  openInvoice(url: string, callback?: (status: string) => void): void
  showPopup(params: {
    title?: string
    message: string
    buttons?: Array<{
      id?: string
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'
      text?: string
    }>
  }, callback?: (buttonId: string) => void): void
  showAlert(message: string, callback?: () => void): void
  showConfirm(message: string, callback?: (confirmed: boolean) => void): void
  showScanQrPopup(params: {
    text?: string
  }, callback?: (text: string) => void): void
  closeScanQrPopup(): void
  readTextFromClipboard(callback?: (text: string) => void): void
  requestWriteAccess(callback?: (granted: boolean) => void): void
  requestContact(callback?: (granted: boolean) => void): void
  onEvent(eventType: string, eventHandler: () => void): void
  offEvent(eventType: string, eventHandler: () => void): void
}

interface TelegramContextType {
  webApp: TelegramWebApp | null
  user: TelegramUser | null
  isLoading: boolean
  isReady: boolean
  theme: 'light' | 'dark'
  haptic: {
    impact: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
    notification: (type: 'error' | 'success' | 'warning') => void
    selection: () => void
  }
  showAlert: (message: string) => Promise<void>
  showConfirm: (message: string) => Promise<boolean>
  showPopup: (params: {
    title?: string
    message: string
    buttons?: Array<{
      id?: string
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'
      text?: string
    }>
  }) => Promise<string | null>
  openLink: (url: string) => void
  sendData: (data: string) => void
  close: () => void
}

const TelegramContext = createContext<TelegramContextType | null>(null)

export const useTelegram = () => {
  const context = useContext(TelegramContext)
  if (!context) {
    throw new Error('useTelegram must be used within a TelegramProvider')
  }
  return context
}

interface TelegramProviderProps {
  children: ReactNode
}

export function TelegramProvider({ children }: TelegramProviderProps) {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null)
  const [user, setUser] = useState<TelegramUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isReady, setIsReady] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Проверяем, что мы в Telegram WebApp
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp as any
      
      // Инициализируем WebApp
      tg.ready()
      tg.expand()
      
      setWebApp(tg)
      setUser(tg.initDataUnsafe.user || null)
      setTheme(tg.colorScheme)
      setIsReady(true)
      
      // Настраиваем тему
      document.documentElement.setAttribute('data-theme', tg.colorScheme)
      
      // Слушаем изменения темы
      tg.onEvent('themeChanged', () => {
        setTheme(tg.colorScheme)
        document.documentElement.setAttribute('data-theme', tg.colorScheme)
      })
      
      // Настраиваем кнопку "Назад"
      tg.BackButton.onClick(() => {
        if (window.history.length > 1) {
          window.history.back()
        } else {
          tg.close()
        }
      })
      
      setIsLoading(false)
    } else {
      // Fallback для разработки
      console.log('Telegram WebApp not detected, using fallback')
      setIsLoading(false)
      setIsReady(true)
    }
  }, [])

  const haptic = {
    impact: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => {
      webApp?.HapticFeedback.impactOccurred(style)
    },
    notification: (type: 'error' | 'success' | 'warning') => {
      webApp?.HapticFeedback.notificationOccurred(type)
    },
    selection: () => {
      webApp?.HapticFeedback.selectionChanged()
    }
  }

  const showAlert = (_message: string): Promise<void> => Promise.resolve()

  const showConfirm = (_message: string): Promise<boolean> => Promise.resolve(false)

  const showPopup = (_params: any): Promise<string | null> => Promise.resolve(null)

  const openLink = (url: string) => {
    if (webApp) {
      webApp.openLink(url)
    } else {
      window.open(url, '_blank')
    }
  }

  const sendData = (data: string) => {
    if (webApp) {
      webApp.sendData(data)
    } else {
      console.log('Telegram WebApp sendData:', data)
    }
  }

  const close = () => {
    if (webApp) {
      webApp.close()
    } else {
      console.log('Telegram WebApp close')
    }
  }

  const value: TelegramContextType = {
    webApp,
    user,
    isLoading,
    isReady,
    theme,
    haptic,
    showAlert,
    showConfirm,
    showPopup,
    openLink,
    sendData,
    close
  }

  return (
    <TelegramContext.Provider value={value}>
      {children}
    </TelegramContext.Provider>
  )
}

// Глобальные типы уже объявлены в twa-provider.tsx
