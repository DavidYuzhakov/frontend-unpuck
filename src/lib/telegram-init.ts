// Глобальная инициализация Telegram Mini App
export class TelegramMiniApp {
  private static instance: TelegramMiniApp
  private webApp: any = null
  private isInitialized = false

  private constructor() {}

  public static getInstance(): TelegramMiniApp {
    if (!TelegramMiniApp.instance) {
      TelegramMiniApp.instance = new TelegramMiniApp()
    }
    return TelegramMiniApp.instance
  }

  public async init(): Promise<boolean> {
    if (this.isInitialized) return true

    try {
      // Ждем загрузки Telegram WebApp
      await this.waitForTelegramWebApp()
      
      if (this.webApp) {
        console.log('🚀 Telegram Mini App инициализирован')
        console.log('🔍 TWA версия:', this.webApp.version)
        console.log('🔍 TWA платформа:', this.webApp.platform)
        console.log('🔍 TWA initDataUnsafe:', this.webApp.initDataUnsafe)
        console.log('🔍 TWA initData:', this.webApp.initData)
        
        // Инициализируем TWA
        this.webApp.ready()
        this.webApp.expand()
        this.webApp.enableClosingConfirmation()
        this.webApp.setHeaderColor('#ffffff')
        this.webApp.setBackgroundColor('#ffffff')
        
        // Ждем немного для полной инициализации
        await new Promise(resolve => setTimeout(resolve, 200))
        
        console.log('🔍 TWA после инициализации:')
        console.log('🔍 isExpanded:', this.webApp.isExpanded)
        console.log('🔍 initDataUnsafe после инициализации:', this.webApp.initDataUnsafe)
        console.log('🔍 user после инициализации:', this.webApp.initDataUnsafe?.user)
        
        this.isInitialized = true
        return true
      }
      
      return false
    } catch (error) {
      console.error('❌ Ошибка инициализации Telegram Mini App:', error)
      return false
    }
  }

  private async waitForTelegramWebApp(): Promise<void> {
    return new Promise((resolve, reject) => {
      let attempts = 0
      const maxAttempts = 50 // 5 секунд максимум
      
      const checkTelegram = () => {
        attempts++
        console.log(`🔍 Попытка ${attempts}/${maxAttempts} найти Telegram WebApp...`)
        
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
          this.webApp = window.Telegram.WebApp
          console.log('✅ Telegram WebApp найден:', this.webApp)
          console.log('🔍 initDataUnsafe:', this.webApp.initDataUnsafe)
          console.log('🔍 user:', this.webApp.initDataUnsafe?.user)
          resolve()
        } else if (attempts >= maxAttempts) {
          console.log('❌ Telegram WebApp не найден после максимального количества попыток')
          reject(new Error('Telegram WebApp не найден'))
        } else {
          setTimeout(checkTelegram, 100)
        }
      }
      checkTelegram()
    })
  }

  public getWebApp(): any {
    return this.webApp
  }

  public isInTelegram(): boolean {
    return this.webApp !== null && this.isInitialized
  }

  public getUserData(): any {
    return this.webApp?.initDataUnsafe?.user || null
  }

  public getInitData(): string {
    return this.webApp?.initData || ''
  }
}

// Глобальный экземпляр
export const telegramApp = TelegramMiniApp.getInstance()
