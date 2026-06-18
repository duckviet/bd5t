import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { ProgressMatrixCriteriaScoresItem } from "@/services/generated/api"
import {
  getActiveBadge,
  getGeneralBadges,
  getSpecificBadges,
  summarizeScores,
} from "@/entities/badge"

interface BadgePositionsState {
  positions: Record<string, { x: number; y: number }>
  setPositions: (
    positions:
      | Record<string, { x: number; y: number }>
      | ((
        prev: Record<string, { x: number; y: number }>,
      ) => Record<string, { x: number; y: number }>),
  ) => void
  resetPositions: () => void
}

export const useBadgePositionsStore = create<BadgePositionsState>()(
  persist(
    (set) => ({
      positions: {},
      setPositions: (updater) =>
        set((state) => ({
          positions:
            typeof updater === "function"
              ? updater(state.positions)
              : updater,
        })),
      resetPositions: () => set({ positions: {} }),
    }),
    {
      name: "badge-teaser-positions",
    },
  ),
)

export function useBadgeTeaser(
  criteriaScores: readonly ProgressMatrixCriteriaScoresItem[],
) {
  const summary = useMemo(() => summarizeScores(criteriaScores), [criteriaScores])
  const generalBadges = useMemo(() => getGeneralBadges(summary), [summary])
  const specificBadges = useMemo(() => getSpecificBadges(summary), [summary])

  const activeGeneralBadge = useMemo(
    () => getActiveBadge(generalBadges),
    [generalBadges],
  )
  const activeSpecificBadge = useMemo(
    () => getActiveBadge(specificBadges),
    [specificBadges],
  )

  // Get all earned (unlocked) badges
  const allUnlockedBadges = useMemo(() => {
    const list = [
      // ...generalBadges.filter((b) => b.unlocked),
      ...specificBadges.filter((b) => b.unlocked),
    ]
    // Filter duplicates by ID
    return list.filter(
      (item, index, self) => self.findIndex((b) => b.id === item.id) === index,
    )
  }, [specificBadges])

  const { positions, setPositions, resetPositions } = useBadgePositionsStore()
  const [isLoaded, setIsLoaded] = useState(false)
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const dragStartRef = useRef<{
    id: string
    startX: number
    startY: number
    initialX: number
    initialY: number
  } | null>(null)

  // Mark as loaded on client mount to avoid hydration mismatch
  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // Auto-calculated default grid positions if none stored
  const defaultPositions = useMemo(() => {
    const result: Record<string, { x: number; y: number }> = {}
    const cols = 5
    allUnlockedBadges.forEach((badge, index) => {
      const col = index % cols
      const row = Math.floor(index / cols)
      // Space them out within [4%, 84%] bounds
      const x = 4 + col * 18
      const y = 4 + row * 22
      result[badge.id] = { x, y }
    })
    return result
  }, [allUnlockedBadges])

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, id: string) => {
      e.preventDefault()
      const element = e.currentTarget
      element.setPointerCapture(e.pointerId)

      const initialX = positions[id]?.x ?? defaultPositions[id]?.x ?? 4
      const initialY = positions[id]?.y ?? defaultPositions[id]?.y ?? 4

      dragStartRef.current = {
        id,
        startX: e.clientX,
        startY: e.clientY,
        initialX,
        initialY,
      }
      setDraggingId(id)
    },
    [positions, defaultPositions],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragStartRef.current) {
        return
      }
      const { id, startX, startY, initialX, initialY } = dragStartRef.current
      if (id !== draggingId) {
        return
      }

      const container = containerRef.current
      if (!container) {
        return
      }

      const rect = container.getBoundingClientRect()
      const deltaX = e.clientX - startX
      const deltaY = e.clientY - startY

      const deltaPercentX = (deltaX / rect.width) * 100
      const deltaPercentY = (deltaY / rect.height) * 100

      // Clamp coordinates to keep badge inside the bounds (e.g. 2% to 86%)
      const newX = Math.max(2, Math.min(initialX + deltaPercentX, 86))
      const newY = Math.max(2, Math.min(initialY + deltaPercentY, 78))

      setPositions((prev) => ({
        ...prev,
        [id]: { x: newX, y: newY },
      }))
    },
    [draggingId],
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (dragStartRef.current) {
        e.currentTarget.releasePointerCapture(e.pointerId)
        dragStartRef.current = null
        setDraggingId(null)
      }
    },
    [],
  )

  const handleReset = useCallback(() => {
    resetPositions()
  }, [resetPositions])

  return {
    allUnlockedBadges,
    positions: isLoaded ? positions : {},
    defaultPositions,
    draggingId,
    containerRef,
    isLoaded,
    activeGeneralBadge,
    activeSpecificBadge,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleReset,
  }
}
