'use client'

import { cn } from '@/lib/utils'
import { FunnelIcon } from '@heroicons/react/24/outline'

interface FilterButtonProps {
  active: boolean
  onClick: () => void
}

export function FilterButton({ active, onClick }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center justify-center rounded-lg px-3 py-3 transition-colors',
        active
          ? 'bg-blue-600 text-white'
          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
      )}
    >
      <FunnelIcon className="h-5 w-5" />
    </button>
  )
}

