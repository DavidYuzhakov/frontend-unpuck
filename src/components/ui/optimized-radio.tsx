'use client'

import { forwardRef, memo, useCallback, useImperativeHandle, useRef, useState } from 'react'

interface RadioOption {
  value: string
  label: string
  disabled?: boolean
}

interface OptimizedRadioProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  onFocus?: () => void
  options: RadioOption[]
  name: string
  disabled?: boolean
  required?: boolean
  error?: string
  label?: string
  className?: string
  autoFocus?: boolean
  size?: 'sm' | 'md' | 'lg'
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple'
  direction?: 'horizontal' | 'vertical'
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6'
}

const colorClasses = {
  blue: 'text-blue-600 focus:ring-blue-500',
  green: 'text-green-600 focus:ring-green-500',
  red: 'text-red-600 focus:ring-red-500',
  yellow: 'text-yellow-600 focus:ring-yellow-500',
  purple: 'text-purple-600 focus:ring-purple-500'
}

export const OptimizedRadio = memo(forwardRef<HTMLInputElement, OptimizedRadioProps>(function OptimizedRadio({
  value,
  onChange,
  onBlur,
  onFocus,
  options,
  name,
  disabled = false,
  required = false,
  error,
  label,
  className = '',
  autoFocus = false,
  size = 'md',
  color = 'blue',
  direction = 'vertical'
}, ref) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  // Передаем ref
  useImperativeHandle(ref, () => inputRef.current!)

  // Мемоизированная обработка изменения
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
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

  const baseClasses = 'rounded-full border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
  const stateClasses = error 
    ? 'border-red-300 focus:ring-red-500' 
    : isFocused 
      ? 'border-blue-500 focus:ring-blue-500' 
      : 'border-gray-300 focus:ring-blue-500'
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
  const directionClasses = direction === 'horizontal' ? 'flex-row space-x-4' : 'flex-col space-y-2'

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className={`flex ${directionClasses}`}>
        {options.map((option) => {
          const isChecked = value === option.value
          const checkedClasses = isChecked 
            ? colorClasses[color]
            : 'bg-white border-gray-300'
          
          return (
            <label
              key={option.value}
              className={`flex items-center space-x-2 ${disabledClasses}`}
            >
              <input
              ref={inputRef}
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              disabled={disabled || option.disabled}
              required={required}
              autoFocus={autoFocus}
              className={`${baseClasses} ${stateClasses} ${checkedClasses} ${sizeClasses[size]} ${className}`}
            />
            
            <span className="text-sm font-medium text-gray-700">
              {option.label}
            </span>
          </label>
          )
        })}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}))
