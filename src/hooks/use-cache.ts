import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

// Оптимизированная конфигурация кэширования для React Query
export const queryConfig = {
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 минут - увеличиваем время кэша
      gcTime: 30 * 60 * 1000, // 30 минут - увеличиваем время хранения в памяти
      retry: (failureCount: number, error: any) => {
        // Более агрессивная стратегия retry
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false
        }
        return failureCount < 3
      },
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: true,
      networkMode: 'online' as const,
    },
    mutations: {
      retry: 1,
      networkMode: 'online' as const,
    },
  },
}

// Хук для работы с кэшем
export const useCache = () => {
  const queryClient = useQueryClient()

  // Очистка кэша
  const clearCache = useCallback(() => {
    queryClient.clear()
  }, [queryClient])

  // Инвалидация конкретного запроса
  const invalidateQuery = useCallback((queryKey: string[]) => {
    queryClient.invalidateQueries({ queryKey })
  }, [queryClient])

  // Предзагрузка данных
  const prefetchQuery = useCallback(async (queryKey: string[], queryFn: () => Promise<any>) => {
    await queryClient.prefetchQuery({
      queryKey,
      queryFn,
      staleTime: 5 * 60 * 1000,
    })
  }, [queryClient])

  // Получение данных из кэша
  const getCachedData = useCallback((queryKey: string[]) => {
    return queryClient.getQueryData(queryKey)
  }, [queryClient])

  // Установка данных в кэш
  const setCachedData = useCallback((queryKey: string[], data: any) => {
    queryClient.setQueryData(queryKey, data)
  }, [queryClient])

  return {
    clearCache,
    invalidateQuery,
    prefetchQuery,
    getCachedData,
    setCachedData,
  }
}

// Хук для кэшированных запросов
export const useCachedQuery = <T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options?: {
    enabled?: boolean
    staleTime?: number
    gcTime?: number
  }
) => {
  return useQuery({
    queryKey,
    queryFn,
    staleTime: options?.staleTime || 5 * 60 * 1000,
    gcTime: options?.gcTime || 10 * 60 * 1000,
    enabled: options?.enabled !== false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })
}
