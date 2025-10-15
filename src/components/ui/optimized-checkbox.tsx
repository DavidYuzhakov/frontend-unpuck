'use client'

import { forwardRef, memo, useCallback, useImperativeHandle, useRef, useState } from 'react'

interface OptimizedCheckboxProps {
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
  indeterminate?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6'
}

export const OptimizedCheckbox = memo(forwardRef<HTMLInputElement, OptimizedCheckboxProps>(function OptimizedCheckbox({
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
  indeterminate = false,
  size = 'md'
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

  const baseClasses = 'rounded border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
  const stateClasses = error 
    ? 'border-red-300 focus:ring-red-500' 
    : isFocused 
      ? 'border-blue-500 focus:ring-blue-500' 
      : 'border-gray-300 focus:ring-blue-500'
  const checkedClasses = checked 
    ? 'bg-blue-600 border-blue-600 text-white' 
    : 'bg-white border-gray-300'
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'

  return (
    <div className="w-full">
      <label className={`flex items-center space-x-2 ${disabledClasses}`}>
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
          className={`${baseClasses} ${stateClasses} ${checkedClasses} ${sizeClasses[size]} ${className}`}
        />
        
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
