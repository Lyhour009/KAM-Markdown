import { useSyncExternalStore, useCallback } from 'react'

/**
 * Hook to evaluate CSS media queries reactively using React's useSyncExternalStore.
 * SSR-safe, avoids cascading renders, and synchronizes with matchMedia events.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (callback: () => void) => {
      if (typeof window === 'undefined') return () => {}

      const mediaQueryList = window.matchMedia(query)
      if (mediaQueryList.addEventListener) {
        mediaQueryList.addEventListener('change', callback)
        return () => mediaQueryList.removeEventListener('change', callback)
      } else {
        mediaQueryList.addListener(callback)
        return () => mediaQueryList.removeListener(callback)
      }
    },
    [query]
  )

  const getSnapshot = useCallback(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  }, [query])

  const getServerSnapshot = useCallback(() => false, [])

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
