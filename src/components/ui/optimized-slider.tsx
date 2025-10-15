'use client'

import { forwardRef, memo, useCallback, useImperativeHandle, useRef, useState } from 'react'

interface OptimizedSliderProps {
  value: number
  onChange: (value: number) => void
  onBlur?: () => void
  onFocus?: () => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  required?: boolean
  error?: string
  label?: string
  className?: string
  autoFocus?: boolean
  size?: 'sm' | 'md' | 'lg'
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple'
  showValue?: boolean
  showTicks?: boolean
  showLabels?: boolean
}

const sizeClasses = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3'
}

const thumbSizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6'
}

const colorClasses = {
  blue: 'bg-blue-600 focus:ring-blue-500',
  green: 'bg-green-600 focus:ring-green-500',
  red: 'bg-red-600 focus:ring-red-500',
  yellow: 'bg-yellow-600 focus:ring-yellow-500',
  purple: 'bg-purple-600 focus:ring-purple-500'
}

export const OptimizedSlider = memo(forwardRef<HTMLInputElement, OptimizedSliderProps>(function OptimizedSlider({
  value,
  onChange,
  onBlur,
  onFocus,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  required = false,
  error,
  label,
  className = '',
  autoFocus = false,
  size = 'md',
  color = 'blue',
  showValue = true,
  showTicks = false,
  showLabels = false
}, ref) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  // Передаем ref
  useImperativeHandle(ref, () => inputRef.current!)

  // Мемоизированная обработка изменения
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value))
  }, [onChange])

  // Мемоизированная обработка фокуса
  const handleFocus = useCallback(() => {
    setIsFocused(true)
    onFocus?.()
  }, [onFocus])

  // Мемоизированная обработка потери фокуса
  const handleBlur = useCallback(() => {
    setIsFocused(false)
    onBlur?.()
  }, [onBlur])

  const baseClasses = 'w-full rounded-lg appearance-none cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
  const stateClasses = error 
    ? 'bg-red-300 focus:ring-red-500' 
    : isFocused 
      ? 'bg-blue-500 focus:ring-blue-500' 
      : colorClasses[color]
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'

  // Вычисляем процент для стилизации
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={inputRef}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          autoFocus={autoFocus}
          className={`${baseClasses} ${stateClasses} ${sizeClasses[size]} ${disabledClasses} ${className}`}
          style={{
            background: `linear-gradient(to right, ${colorClasses[color].split(' ')[0]} ${percentage}%, #e5e7eb ${percentage}%)`
          }}
        />
        
        {showValue && (
          <div className="absolute -top-8 left-0 text-sm text-gray-600">
            {value}
          </div>
        )}
        
        {showTicks && (
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>{min}</span>
            <span>{max}</span>
          </div>
        )}
        
        {showLabels && (
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Min: {min}</span>
            <span>Max: {max}</span>
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}))
