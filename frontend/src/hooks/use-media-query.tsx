"use client"

import { createContext, useEffect, useState, useContext, type ReactNode } from "react"

const BREAKPOINTS = {
  md: 768,
  lg: 1024,
}

type Device = "mobile" | "tablet" | "desktop"

export interface MediaQueryContextValue {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
}

function getDevice(): Device {
  if (typeof window === "undefined") return "desktop"
  const width = window.innerWidth
  if (width < BREAKPOINTS.md) return "mobile"
  if (width < BREAKPOINTS.lg) return "tablet"
  return "desktop"
}

export const MediaQueryContext = createContext<MediaQueryContextValue | null>(null)

export function MediaQueryProvider({ children }: { children: ReactNode }) {
  const [device, setDevice] = useState<Device>("desktop")

  useEffect(() => {
    if (typeof window === "undefined") return

    const mobileQuery = window.matchMedia(`(max-width: ${BREAKPOINTS.md - 1}px)`)
    const tabletQuery = window.matchMedia(
      `(min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`
    )

    const update = () => setDevice(getDevice())

    // Initial check
    update()

    // Add listeners
    mobileQuery.addEventListener("change", update)
    tabletQuery.addEventListener("change", update)

    return () => {
      mobileQuery.removeEventListener("change", update)
      tabletQuery.removeEventListener("change", update)
    }
  }, [])

  return (
    <MediaQueryContext.Provider
      value={{
        isMobile: device === "mobile",
        isTablet: device === "tablet",
        isDesktop: device === "desktop",
      }}
    >
      {children}
    </MediaQueryContext.Provider>
  )
}

export function useMediaQuery(): MediaQueryContextValue {
  const context = useContext(MediaQueryContext)
  if (!context) {
    throw new Error("useMediaQuery must be used within a MediaQueryProvider")
  }
  return context
}
