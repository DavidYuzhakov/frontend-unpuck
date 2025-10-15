'use client'

import { memo } from 'react'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray' | 'white'
  className?: string
  animated?: boolean
  text?: string
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
}

const colorClasses = {
  blue: 'text-blue-600',
  green: 'text-green-600',
  red: 'text-red-600',
  yellow: 'text-yellow-600',
  purple: 'text-purple-600',
  gray: 'text-gray-600',
  white: 'text-white'
}

export const OptimizedSpinner = memo(function OptimizedSpinner({
  size = 'md',
  color = 'blue',
  className = '',
  animated = true,
  text
}: SpinnerProps) {
  const baseClasses = 'animate-spin rounded-full border-2 border-solid border-current border-r-transparent'
  const sizeClass = sizeClasses[size]
  const colorClass = colorClasses[color]
  const animatedClass = animated ? 'animate-spin' : ''

  return (
    <div className="flex items-center justify-center">
      <div className={`${baseClasses} ${sizeClass} ${colorClass} ${animatedClass} ${className}`} />
      {text && (
        <span className="ml-2 text-sm text-gray-600">{text}</span>
      )}
    </div>
  )
})
