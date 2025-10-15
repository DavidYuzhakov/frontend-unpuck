'use client'

import { forwardRef, memo, useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react'

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface OptimizedSelectProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  onFocus?: () => void
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  required?: boolean
  error?: string
  label?: string
  className?: string
  autoFocus?: boolean
  multiple?: boolean
  searchable?: boolean
  clearable?: boolean
}

export const OptimizedSelect = memo(forwardRef<HTMLSelectElement, OptimizedSelectProps>(function OptimizedSelect({
  value,
  onChange,
  onBlur,
  onFocus,
  options,
  placeholder,
  disabled = false,
  required = false,
  error,
  label,
  className = '',
  autoFocus = false,
  multiple = false,
  searchable = false,
  clearable = false
}, ref) {
  const selectRef = useRef<HTMLSelectElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Передаем ref
  useImperativeHandle(ref, () => selectRef.current!)

  // Мемоизированная обработка изменения
  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
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

  // Мемоизированная обработка очистки
  const handleClear = useCallback(() => {
    onChange('')
  }, [onChange])

  // Мемоизированная фильтрация опций
  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery) return options
    return options.filter(option => 
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [options, searchQuery, searchable])

  const baseClasses = 'w-full px-3 py-2 border rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
  const stateClasses = error 
    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
    : isFocused 
      ? 'border-blue-500 focus:ring-blue-500' 
      : 'border-gray-300 focus:ring-blue-500'
  const disabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {searchable && (
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        )}
        
        <select
          ref={selectRef}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          autoFocus={autoFocus}
          multiple={multiple}
          className={`${baseClasses} ${stateClasses} ${disabledClasses} ${className}`}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          
          {filteredOptions.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {clearable && value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}))
