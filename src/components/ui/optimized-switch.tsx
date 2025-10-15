'use client'

import { forwardRef, memo, useCallback, useImperativeHandle, useRef, useState } from 'react'

interface OptimizedSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  onBlur?: () => void
  onFocus?: () => void
  label?: string
  disabled?: boolean
  required?: boolean
  error?: string
  className?: string
  autoFocus?: boolean
  size?: 'sm' | 'md' | 'lg'
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple'
}

const sizeClasses = {
  sm: 'w-8 h-4',
  md: 'w-10 h-5',
  lg: 'w-12 h-6'
}

const thumbSizeClasses = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5'
}

const colorClasses = {
  blue: 'bg-blue-600 focus:ring-blue-500',
  green: 'bg-green-600 focus:ring-green-500',
  red: 'bg-red-600 focus:ring-red-500',
  yellow: 'bg-yellow-600 focus:ring-yellow-500',
  purple: 'bg-purple-600 focus:ring-purple-500'
}

export const OptimizedSwitch = memo(forwardRef<HTMLInputElement, OptimizedSwitchProps>(function OptimizedSwitch({
  checked,
  onChange,
  onBlur,
  onFocus,
  label,
  disabled = false,
  required = false,
  error,
  className = '',
  autoFocus = false,
  size = 'md',
  color = 'blue'
}, ref) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  // Передаем ref
  useImperativeHandle(ref, () => inputRef.current!)

  // Мемоизированная обработка изменения
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked)
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

  const baseClasses = 'relative inline-flex rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
  const stateClasses = error 
    ? 'bg-red-300 focus:ring-red-500' 
    : checked 
      ? colorClasses[color]
      : 'bg-gray-300 focus:ring-gray-500'
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'

  return (
    <div className="w-full">
      <label className={`flex items-center space-x-2 ${disabledClasses}`}>
        <div className={`${baseClasses} ${stateClasses} ${sizeClasses[size]} ${className}`}>
          <input
            ref={inputRef}
            type="checkbox"
            checked={checked}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            required={required}
            autoFocus={autoFocus}
            className="sr-only"
          />
          
          <div
            className={`${thumbSizeClasses[size]} bg-white rounded-full shadow transform transition-transform ${
              checked ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </div>
        
        {label && (
          <span className="text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </span>
        )}
      </label>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}))
