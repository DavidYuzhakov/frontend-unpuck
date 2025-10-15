import { useCallback, useEffect, useRef, useState } from 'react'

interface UsePaginationOptions {
  initialPageSize?: number
  loadMoreSize?: number
  threshold?: number // Расстояние до конца для подгрузки (в пикселях)
}

interface PaginationState {
  page: number
  pageSize: number
  hasMore: boolean
  isLoading: boolean
  isLoadingMore: boolean
  total: number
}

export function usePagination({
  initialPageSize = 30,
  loadMoreSize = 10,
  threshold = 1000
}: UsePaginationOptions = {}) {
  const [state, setState] = useState<PaginationState>({
    page: 1,
    pageSize: initialPageSize,
    hasMore: true,
    isLoading: false,
    isLoadingMore: false,
    total: 0
  })

  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  const updateState = useCallback((updates: Partial<PaginationState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  const loadMore = useCallback(() => {
    if (state.isLoading || state.isLoadingMore || !state.hasMore) return

    updateState({
      isLoadingMore: true,
      page: state.page + 1,
      pageSize: state.page === 1 ? initialPageSize : loadMoreSize
    })
  }, [state.isLoading, state.isLoadingMore, state.hasMore, state.page, initialPageSize, loadMoreSize, updateState])

  const reset = useCallback(() => {
    setState({
      page: 1,
      pageSize: initialPageSize,
      hasMore: true,
      isLoading: false,
      isLoadingMore: false,
      total: 0
    })
  }, [initialPageSize])

  const setTotal = useCallback((total: number) => {
    updateState({ 
      total,
      hasMore: state.page * state.pageSize < total
    })
  }, [state.page, state.pageSize, updateState])

  const setLoading = useCallback((isLoading: boolean) => {
    updateState({ isLoading })
  }, [updateState])

  const setLoadingMore = useCallback((isLoadingMore: boolean) => {
    updateState({ isLoadingMore })
  }, [updateState])

  const setHasMore = useCallback((hasMore: boolean) => {
    updateState({ hasMore })
  }, [updateState])

  // Intersection Observer для автоматической подгрузки
  useEffect(() => {
    if (!loadMoreRef.current) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const target = entries[0]
        if (target.isIntersecting && state.hasMore && !state.isLoading && !state.isLoadingMore) {
          loadMore()
        }
      },
      {
        rootMargin: `${threshold}px`
      }
    )

    observerRef.current.observe(loadMoreRef.current)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [state.hasMore, state.isLoading, state.isLoadingMore, loadMore, threshold])

  return {
    ...state,
    loadMore,
    reset,
    setTotal,
    setLoading,
    setLoadingMore,
    setHasMore,
    loadMoreRef
  }
}





