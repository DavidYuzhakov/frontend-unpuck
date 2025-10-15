'use client'

import { forwardRef, memo, useCallback, useImperativeHandle, useRef, useState } from 'react'

interface OptimizedTextareaProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  onFocus?: () => void
  placeholder?: string
  disabled?: boolean
  required?: boolean
  error?: string
  label?: string
  className?: string
  autoFocus?: boolean
  maxLength?: number
  minLength?: number
  rows?: number
  cols?: number
  resize?: 'none' | 'both' | 'horizontal' | 'vertical'
}

export const OptimizedTextarea = memo(forwardRef<HTMLTextAreaElement, OptimizedTextareaProps>(function OptimizedTextarea({
  value,
  onChange,
  onBlur,
  onFocus,
  placeholder,
  disabled = false,
  required = false,
  error,
  label,
  className = '',
  autoFocus = false,
  maxLength,
  minLength,
  rows = 3,
  cols,
  resize = 'vertical'
}, ref) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  // Передаем ref
  useImperativeHandle(ref, () => textareaRef.current!)

  // Мемоизированная обработка изменения
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
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

  const baseClasses = 'w-full px-3 py-2 border rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
  const stateClasses = error 
    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
    : isFocused 
      ? 'border-blue-500 focus:ring-blue-500' 
      : 'border-gray-300 focus:ring-blue-500'
  const disabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
  const resizeClasses = {
    none: 'resize-none',
    both: 'resize',
    horizontal: 'resize-x',
    vertical: 'resize-y'
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoFocus={autoFocus}
        maxLength={maxLength}
        minLength={minLength}
        rows={rows}
        cols={cols}
        className={`${baseClasses} ${stateClasses} ${disabledClasses} ${resizeClasses[resize]} ${className}`}
      />
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}))
