'use client'

import { useEffect } from 'react'

/**
 * Hook to suppress hydration warnings from external sources like browser extensions
 * This is particularly useful for attributes added by ad blockers, privacy extensions, etc.
 */
export function useSuppressHydrationWarning() {
  useEffect(() => {
    // Override console.error to filter out specific hydration warnings
    const originalError = console.error
    const originalWarn = console.warn
    
    const filterHydrationWarnings = (...args: any[]) => {
      const message = args[0]
      
      // Suppress warnings about extra attributes from server that are added by external sources
      if (
        typeof message === 'string' && 
        (message.includes('Warning: Extra attributes from the server:') ||
         message.includes('Warning: Text content did not match') ||
         message.includes('Warning: Prop') ||
         message.includes('Warning: Expected server HTML to contain')) &&
        (message.includes('bis_skin_checked') || 
         message.includes('data-adblock') ||
         message.includes('data-extension') ||
         message.includes('data-') ||
         message.includes('aria-'))
      ) {
        return // Suppress this specific warning
      }
      
      // Call original console methods for all other messages
      if (args.length > 0 && typeof args[0] === 'string' && args[0].startsWith('Warning:')) {
        originalWarn.apply(console, args)
      } else {
        originalError.apply(console, args)
      }
    }
    
    console.error = filterHydrationWarnings
    console.warn = filterHydrationWarnings
    
    // Cleanup function to restore original console methods
    return () => {
      console.error = originalError
      console.warn = originalWarn
    }
  }, [])
}
