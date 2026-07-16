import { useEffect } from 'react'

interface KeyboardNavigationOptions {
  onPrevious: () => void
  onNext: () => void
  onFirst: () => void
  onLast: () => void
  onDetails: () => void
  onFullscreen: () => void
  onEscape: () => void
}

export function useKeyboardNavigation(options: KeyboardNavigationOptions) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.matches('input, textarea, select, [contenteditable="true"]')) return

      const handlers: Record<string, () => void> = {
        ArrowLeft: options.onPrevious,
        ArrowRight: options.onNext,
        Home: options.onFirst,
        End: options.onLast,
        i: options.onDetails,
        I: options.onDetails,
        f: options.onFullscreen,
        F: options.onFullscreen,
        Escape: options.onEscape,
      }

      const handler = handlers[event.key]
      if (!handler) return
      event.preventDefault()
      handler()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [options])
}
