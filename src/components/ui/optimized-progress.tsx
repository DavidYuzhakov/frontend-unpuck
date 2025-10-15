'use client'

import { memo, useMemo } from 'react'

interface OptimizedProgressProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray'
  showValue?: boolean
  showPercentage?: boolean
  animated?: boolean
  striped?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3'
}

const colorClasses = {
  blue: 'bg-blue-600',
  green: 'bg-green-600',
  red: 'bg-red-600',
  yellow: 'bg-yellow-600',
  purple: 'bg-purple-600',
  gray: 'bg-gray-600'
}

export const OptimizedProgress = memo(function OptimizedProgress({
  value,
  max = 100,
  size = 'md',
  color = 'blue',
  showValue = false,
  showPercentage = true,
  animated = false,
  striped = false,
  className = ''
}: OptimizedProgressProps) {
  // Вычисляем процент
  const percentage = useMemo(() => {
    return Math.min(Math.max((value / max) * 100, 0), 100)
  }, [value, max])

  // Мемоизированные классы
  const progressClasses = useMemo(() => {
    const baseClasses = 'w-full bg-gray-200 rounded-full overflow-hidden'
    const sizeClass = sizeClasses[size]
    return `${baseClasses} ${sizeClass} ${className}`
  }, [size, className])

  const barClasses = useMemo(() => {
    const baseClasses = 'h-full transition-all duration-300 ease-in-out'
    const colorClass = colorClasses[color]
    const animatedClass = animated ? 'animate-pulse' : ''
    const stripedClass = striped ? 'bg-stripes' : ''
    return `${baseClasses} ${colorClass} ${animatedClass} ${stripedClass}`
  }, [color, animated, striped])

  return (
    <div className="w-full">
      <div className={progressClasses}>
        <div
          className={barClasses}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {(showValue || showPercentage) && (
        <div className="flex justify-between mt-1 text-sm text-gray-600">
          {showValue && (
            <span>{value} / {max}</span>
          )}
          {showPercentage && (
            <span>{Math.round(percentage)}%</span>
          )}
        </div>
      )}
    </div>
  )
})
