'use client'

import { memo, useCallback, useMemo, useState } from 'react'

interface OptimizedFormProps {
  onSubmit: (data: any) => void | Promise<void>
  children: React.ReactNode
  className?: string
  validateOnChange?: boolean
  validateOnBlur?: boolean
}

export const OptimizedForm = memo(function OptimizedForm({
  onSubmit,
  children,
  className = '',
  validateOnChange = false,
  validateOnBlur = false
}: OptimizedFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Мемоизированная обработка отправки формы
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSubmitting) return

    setIsSubmitting(true)
    setErrors({})

    try {
      const formData = new FormData(e.currentTarget as HTMLFormElement)
      const data = Object.fromEntries(formData.entries())
      
      await onSubmit(data)
    } catch (error: any) {
      console.error('Form submission error:', error)
      setErrors({ submit: error.message || 'Произошла ошибка при отправке формы' })
    } finally {
      setIsSubmitting(false)
    }
  }, [onSubmit, isSubmitting])

  // Мемоизированная обработка изменения полей
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (validateOnChange) {
      // Валидация при изменении
      const { name, value } = e.target
      if (value.trim() === '') {
        setErrors(prev => ({ ...prev, [name]: 'Поле обязательно для заполнения' }))
      } else {
        setErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors[name]
          return newErrors
        })
      }
    }
  }, [validateOnChange])

  // Мемоизированная обработка потери фокуса
  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (validateOnBlur) {
      // Валидация при потере фокуса
      const { name, value } = e.target
      if (value.trim() === '') {
        setErrors(prev => ({ ...prev, [name]: 'Поле обязательно для заполнения' }))
      } else {
        setErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors[name]
          return newErrors
        })
      }
    }
  }, [validateOnBlur])

  // Мемоизированный контекст формы
  const formContext = useMemo(() => ({
    isSubmitting,
    errors,
    handleChange,
    handleBlur
  }), [isSubmitting, errors, handleChange, handleBlur])

  return (
    <form 
      onSubmit={handleSubmit}
      className={className}
      noValidate
    >
      <FormContext.Provider value={formContext}>
        {children}
      </FormContext.Provider>
    </form>
  )
})

// Контекст для передачи состояния формы
import { createContext, useContext } from 'react'

interface FormContextType {
  isSubmitting: boolean
  errors: Record<string, string>
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
}

const FormContext = createContext<FormContextType | null>(null)

export const useFormContext = () => {
  const context = useContext(FormContext)
  if (!context) {
    throw new Error('useFormContext must be used within OptimizedForm')
  }
  return context
}
