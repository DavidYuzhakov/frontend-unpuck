'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  type?: 'warning' | 'danger' | 'info'
}

export function ConfirmDialog({ 
  isOpen, 
  title, 
  message, 
  confirmText = 'Подтвердить', 
  cancelText = 'Отмена',
  onConfirm, 
  onCancel,
  type = 'warning'
}: ConfirmDialogProps) {
  if (!isOpen) return null

  const getIconColor = () => {
    switch (type) {
      case 'danger':
        return 'text-red-500'
      case 'warning':
        return 'text-yellow-500'
      case 'info':
      default:
        return 'text-blue-500'
    }
  }

  const getConfirmButtonVariant = () => {
    switch (type) {
      case 'danger':
        return 'destructive'
      case 'warning':
        return 'default'
      case 'info':
      default:
        return 'default'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <ExclamationTriangleIcon className={`h-6 w-6 ${getIconColor()}`} />
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          
          <p className="text-gray-600 mb-6">{message}</p>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onCancel}
            >
              {cancelText}
            </Button>
            <Button
              variant={getConfirmButtonVariant()}
              onClick={onConfirm}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}



