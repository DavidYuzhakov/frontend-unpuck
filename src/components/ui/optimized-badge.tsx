'use client'

import { memo } from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  dot?: boolean
  rounded?: boolean
  animated?: boolean
}

const variantClasses = {
  default: 'bg-gray-100 text-gray-800',
  success: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
  warning: 'bg-yellow-100 text-yellow-800',
  info: 'bg-blue-100 text-blue-800',
  outline: 'border border-gray-300 bg-white text-gray-700'
}

const sizeClasses = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-2.5 py-1.5 text-sm',
  lg: 'px-3 py-2 text-base'
}

export const OptimizedBadge = memo(function OptimizedBadge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  dot = false,
  rounded = false,
  animated = false
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center font-medium'
  const variantClass = variantClasses[variant]
  const sizeClass = sizeClasses[size]
  const roundedClass = rounded ? 'rounded-full' : 'rounded-md'
  const animatedClass = animated ? 'animate-pulse' : ''

  return (
    <span className={`${baseClasses} ${variantClass} ${sizeClass} ${roundedClass} ${animatedClass} ${className}`}>
      {dot && (
        <span className="w-2 h-2 bg-current rounded-full mr-1" />
      )}
      {children}
    </span>
  )
})
