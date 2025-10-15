'use client'

import { memo, useCallback, useState } from 'react'

interface OptimizedButtonProps {
  children: React.ReactNode
  onClick?: () => void | Promise<void>
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  className?: string
  onPress?: () => void
  onPressStart?: () => void
  onPressEnd?: () => void
}

const variantClasses = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
  secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
  outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
  ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
  destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg'
}

export const OptimizedButton = memo(function OptimizedButton({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  onPress,
  onPressStart,
  onPressEnd
}: OptimizedButtonProps) {
  const [isPressed, setIsPressed] = useState(false)

  // Мемоизированная обработка клика
  const handleClick = useCallback(async () => {
    if (disabled || loading) return

    try {
      await onClick?.()
    } catch (error) {
      console.error('Button click error:', error)
    }
  }, [onClick, disabled, loading])

  // Мемоизированная обработка нажатия
  const handlePressStart = useCallback(() => {
    if (disabled || loading) return
    
    setIsPressed(true)
    onPressStart?.()
  }, [disabled, loading, onPressStart])

  // Мемоизированная обработка отпускания
  const handlePressEnd = useCallback(() => {
    if (disabled || loading) return
    
    setIsPressed(false)
    onPressEnd?.()
  }, [disabled, loading, onPressEnd])

  // Мемоизированная обработка нажатия
  const handlePress = useCallback(() => {
    if (disabled || loading) return
    
    onPress?.()
  }, [disabled, loading, onPress])

  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  const variantClass = variantClasses[variant]
  const sizeClass = sizeClasses[size]
  const pressedClass = isPressed ? 'scale-95' : 'scale-100'

  return (
    <button
      type={type}
      onClick={handleClick}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      onTouchCancel={handlePressEnd}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClass} ${sizeClass} ${pressedClass} ${className}`}
    >
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
      )}
      {children}
    </button>
  )
})
