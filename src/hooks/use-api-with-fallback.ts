import { useCallback, useState } from 'react'

interface UseApiWithFallbackOptions<T> {
  fallbackData: T[]
  onError?: (error: any) => void
  onSuccess?: (data: T[]) => void
}

export function useApiWithFallback<T>({
  fallbackData,
  onError,
  onSuccess
}: UseApiWithFallbackOptions<T>) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUsingFallback, setIsUsingFallback] = useState(false)

  const execute = useCallback(async (apiCall: () => Promise<any>) => {
    try {
      setLoading(true)
      setError(null)
      setIsUsingFallback(false)

      const response = await apiCall()
      const responseData = response.data?.data || response.data || []
      
      setData(responseData)
      onSuccess?.(responseData)
      console.log('✅ API данные загружены:', responseData.length)
    } catch (apiError: any) {
      console.warn('⚠️ API недоступен, используем fallback данные:', apiError.message)
      
      setData(fallbackData)
      setError(`API недоступен: ${apiError.message}`)
      setIsUsingFallback(true)
      onError?.(apiError)
      console.log('✅ Используем fallback данные:', fallbackData.length)
    } finally {
      setLoading(false)
    }
  }, [fallbackData, onError, onSuccess])

  return {
    data,
    loading,
    error,
    isUsingFallback,
    execute
  }
}

