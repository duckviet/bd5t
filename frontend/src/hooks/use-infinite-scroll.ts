import { useEffect, useRef } from "react"

interface UseInfiniteScrollProps {
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  fetchNextPage: () => void
  disabled?: boolean
  rootMargin?: string
  threshold?: number
}

export function useInfiniteScroll({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  disabled = false,
  rootMargin = "200px",
  threshold = 0.1,
}: UseInfiniteScrollProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (disabled || !hasNextPage || isFetchingNextPage) {
      return
    }

    const node = sentinelRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          fetchNextPage()
        }
      },
      { rootMargin, threshold }
    )

    observer.observe(node)

    return () => {
      observer.disconnect()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, disabled, rootMargin, threshold])

  return sentinelRef
}
