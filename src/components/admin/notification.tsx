'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircleIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'

interface NotificationProps {
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  isVisible: boolean
  onClose: () => void
  duration?: number
}

export function Notification({ message, type, isVisible, onClose, duration = 3000 }: NotificationProps) {
  const [show, setShow] = useState(isVisible)

  useEffect(() => {
    setShow(isVisible)
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        setShow(false)
        setTimeout(onClose, 300) // Задержка для анимации
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!show) return null

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
      case 'info':
      default:
        return <CheckCircleIcon className="h-5 w-5 text-blue-500" />
    }
  }

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
      <Card className={`p-4 ${getBgColor()} border shadow-lg`}>
        <div className="flex items-center space-x-3">
          {getIcon()}
          <span className="text-sm font-medium text-gray-900">{message}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShow(false)
              setTimeout(onClose, 300)
            }}
            className="ml-auto h-6 w-6 p-0"
          >
            <XMarkIcon className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  )
}



