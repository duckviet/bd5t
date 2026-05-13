"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { gsap } from "gsap"

interface AnimateOnMountProps {
  children: ReactNode
  animation?: "fadeInUp" | "scaleIn" | "slideInLeft" | "none"
  delay?: number
  className?: string
}

export function AnimateOnMount({ 
  children, 
  animation = "fadeInUp",
  delay = 0,
  className 
}: AnimateOnMountProps) {
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!elementRef.current || animation === "none") return

    const element = elementRef.current
    
    switch (animation) {
      case "fadeInUp":
        gsap.fromTo(
          element,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, delay, ease: "power2.out" }
        )
        break
      case "scaleIn":
        gsap.fromTo(
          element,
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 0.5, delay, ease: "back.out(1.2)" }
        )
        break
      case "slideInLeft":
        gsap.fromTo(
          element,
          { opacity: 0, x: -30 },
          { opacity: 1, x: 0, duration: 0.5, delay, ease: "power2.out" }
        )
        break
    }

    return () => {
      gsap.killTweensOf(element)
    }
  }, [animation, delay])

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  )
}

interface StaggerRevealProps {
  children: ReactNode
  className?: string
  stagger?: number
}

export function StaggerReveal({ children, className, stagger = 0.1 }: StaggerRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const children = containerRef.current.children
    gsap.fromTo(
      children,
      { opacity: 0, y: 20 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.5, 
        stagger, 
        ease: "power2.out" 
      }
    )

    return () => {
      gsap.killTweensOf(children)
    }
  }, [stagger])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}