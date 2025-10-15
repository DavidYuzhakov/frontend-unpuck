import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

// Хук для работы с кэшированием API
export function useApiCache() {
  const queryClient = useQueryClient()

  // Предзагрузка данных
  const prefetchData = useCallback(async (
    queryKey: string[],
    queryFn: () => Promise<any>,
    options?: {
      staleTime?: number
      gcTime?: number
    }
  ) => {
    await queryClient.prefetchQuery({
      queryKey,
      queryFn,
      staleTime: options?.staleTime || 5 * 60 * 1000,
      gcTime: options?.gcTime || 10 * 60 * 1000,
    })
  }, [queryClient])

  // Инвалидация кэша
  const invalidateCache = useCallback((queryKey: string[]) => {
    queryClient.invalidateQueries({ queryKey })
  }, [queryClient])

  // Очистка кэша
  const clearCache = useCallback(() => {
    queryClient.clear()
  }, [queryClient])

  // Получение данных из кэша
  const getCachedData = useCallback((queryKey: string[]) => {
    return queryClient.getQueryData(queryKey)
  }, [queryClient])

  // Установка данных в кэш
  const setCachedData = useCallback((queryKey: string[], data: any) => {
    queryClient.setQueryData(queryKey, data)
  }, [queryClient])

  // Обновление данных в кэше
  const updateCachedData = useCallback((
    queryKey: string[],
    updater: (oldData: any) => any
  ) => {
    queryClient.setQueryData(queryKey, updater)
  }, [queryClient])

  // Удаление данных из кэша
  const removeCachedData = useCallback((queryKey: string[]) => {
    queryClient.removeQueries({ queryKey })
  }, [queryClient])

  // Получение состояния кэша
  const getCacheState = useCallback((queryKey: string[]) => {
    return queryClient.getQueryState(queryKey)
  }, [queryClient])

  return {
    prefetchData,
    invalidateCache,
    clearCache,
    getCachedData,
    setCachedData,
    updateCachedData,
    removeCachedData,
    getCacheState,
  }
}

// Хук для работы с кэшированными запросами
export function useCachedQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options?: {
    enabled?: boolean
    staleTime?: number
    gcTime?: number
    retry?: boolean | number | ((failureCount: number, error: any) => boolean)
    refetchOnWindowFocus?: boolean
    refetchOnMount?: boolean
    refetchOnReconnect?: boolean | 'always'
  }
) {
  return useQuery({
    queryKey,
    queryFn,
    staleTime: options?.staleTime || 5 * 60 * 1000,
    gcTime: options?.gcTime || 10 * 60 * 1000,
    enabled: options?.enabled !== false,
    retry: options?.retry !== false,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    refetchOnMount: options?.refetchOnMount ?? false,
    refetchOnReconnect: options?.refetchOnReconnect ?? 'always',
  })
}
