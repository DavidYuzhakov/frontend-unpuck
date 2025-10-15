import { productsAPI } from '@/lib/api'
import { Product } from '@/types'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

interface UseProductsParams {
  searchQuery?: string
  category?: string
  showFavorites?: boolean
  priceRange?: { min: number; max: number }
  sortBy?: 'newest' | 'price-low' | 'price-high' | 'rating'
  limit?: number
  offset?: number
  favorites?: string[]
}

export function useProducts({
  searchQuery = '',
  category = 'all',
  showFavorites = false,
  priceRange = { min: 0, max: 0 },
  sortBy = 'newest',
  limit = 30,
  offset = 0,
  favorites = []
}: UseProductsParams = {}) {
  // Мемоизированные параметры запроса
  const queryParams = useMemo(() => ({
    search: searchQuery || undefined,
    category: category !== 'all' ? category : undefined,
    minPrice: priceRange.min > 0 ? priceRange.min : undefined,
    maxPrice: priceRange.max > 0 ? priceRange.max : undefined,
    sortBy: sortBy === 'newest' ? 'date' : sortBy === 'price-low' ? 'price' : sortBy === 'price-high' ? 'price' : 'rating',
    sortOrder: sortBy === 'price-high' ? 'desc' : 'asc',
    limit,
    offset
  }), [searchQuery, category, priceRange, sortBy, limit, offset])

  // Используем React Query для кэширования
  const query = useQuery({
    queryKey: ['products', queryParams],
    queryFn: () => productsAPI.getProducts(queryParams),
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 10 * 60 * 1000, // 10 минут
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  // Мемоизированные товары
  const products = useMemo(() => {
    if (!query.data?.data) return []
    
    const productsArray = Array.isArray(query.data.data.products) 
      ? query.data.data.products 
      : Array.isArray(query.data.data) 
        ? query.data.data 
        : []
    
    return productsArray as Product[]
  }, [query.data])

  // Мемоизированная фильтрация товаров по избранному
  const filteredProducts = useMemo(() => {
    if (!showFavorites) return products
    
    return products.filter((product) => {
      const isInFavorites = favorites.includes(product.id)
      return isInFavorites || product.isFavorite
    })
  }, [products, showFavorites, favorites])

  // Мемоизированная пагинация
  const pagination = useMemo(() => {
    if (!query.data?.data) return null
    
    return {
      total: query.data.data.pagination?.total || 0,
      hasMore: (offset + limit) < (query.data.data.pagination?.total || 0),
      currentPage: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil((query.data.data.pagination?.total || 0) / limit)
    }
  }, [query.data, offset, limit])

  return {
    products: filteredProducts,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    pagination,
    // Дополнительные данные
    allProducts: products,
    isFetching: query.isFetching,
    isStale: query.isStale
  }
}
