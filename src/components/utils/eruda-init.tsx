'use client'

import { useEffect } from 'react';

export function ErudaInit() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    // Only initialize once
    if ((window as any).__ERUDA_INITIALIZED__) return
    ;(window as any).__ERUDA_INITIALIZED__ = true

    // Lazy import to keep bundle light
    import('eruda')
      .then((eruda) => {
        if (!eruda?.default) return
        // Attach only in dev and for mobile-like user agents for convenience
        const isDev = process.env.NODE_ENV === 'development'
        if (!isDev) return

        eruda.default.init({
          tool: ['console', 'network', 'resources', 'snippets', 'info', 'sources'],
        })
        try {
          (eruda.default as any).position({ x: 10, y: 10 })
        } catch {}
      })
      .catch(() => {})
  }, [])

  return null
}


