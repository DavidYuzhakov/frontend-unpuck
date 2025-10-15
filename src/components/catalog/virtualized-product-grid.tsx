'use client'

import { Product } from '@/types'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ProductCardOptimized } from './product-card-optimized'

interface VirtualizedProductGridProps {
  products: Product[]
  viewMode: 'grid' | 'list'
  onToggleFavorite?: (productId: string) => void
  favorites?: string[]
  itemHeight?: number
  containerHeight?: number
  overscan?: number
}

export function VirtualizedProductGrid({
  products,
  viewMode,
  onToggleFavorite,
  favorites = [],
  itemHeight = 300, // Высота одного товара в grid режиме
  containerHeight = 600,
  overscan = 5
}: VirtualizedProductGridProps) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Вычисляем видимые элементы
  const visibleItems = useMemo(() => {
    const itemsPerRow = 2 // 2 товара в ряд
    const rowHeight = itemHeight
    const totalRows = Math.ceil(products.length / itemsPerRow)
    const visibleRows = Math.ceil(containerHeight / rowHeight)
    
    const startRow = Math.floor(scrollTop / rowHeight)
    const endRow = Math.min(startRow + visibleRows + overscan, totalRows)
    
    const startIndex = startRow * itemsPerRow
    const endIndex = Math.min(endRow * itemsPerRow, products.length)
    
    return {
      startIndex,
      endIndex,
      startRow,
      endRow,
      totalRows,
      visibleRows
    }
  }, [products.length, scrollTop, itemHeight, containerHeight, overscan])

  // Обработчик прокрутки
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }

  // Эффект для отслеживания прокрутки
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScrollEvent = () => {
      setScrollTop(container.scrollTop)
    }

    container.addEventListener('scroll', handleScrollEvent)
    return () => container.removeEventListener('scroll', handleScrollEvent)
  }, [])

  // Видимые товары
  const visibleProducts = products.slice(visibleItems.startIndex, visibleItems.endIndex)

  // Высота всего контента
  const totalHeight = visibleItems.totalRows * itemHeight

  // Смещение для видимых элементов
  const offsetY = visibleItems.startRow * itemHeight

  return (
    <div
      ref={containerRef}
      className="overflow-auto"
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            {visibleProducts.map((product, index) => (
              <ProductCardOptimized
                key={product.id}
                product={product}
                viewMode={viewMode}
                priority={index < 4}
                isFavorite={favorites.includes(product.id)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}