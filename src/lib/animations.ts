"use client"

import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export function fadeInUp(element: Element | null, delay = 0) {
  if (!element) return
  return gsap.fromTo(
    element,
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      delay,
      ease: "power2.out",
    }
  )
}

export function staggerFadeIn(elements: Element[] | NodeListOf<Element>, stagger = 0.1, delay = 0) {
  if (!elements || elements.length === 0) return
  return gsap.fromTo(
    elements,
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger,
      delay,
      ease: "power2.out",
    }
  )
}

export function scaleIn(element: Element | null, delay = 0) {
  if (!element) return
  return gsap.fromTo(
    element,
    { opacity: 0, scale: 0.9 },
    {
      opacity: 1,
      scale: 1,
      duration: 0.5,
      delay,
      ease: "back.out(1.2)",
    }
  )
}

export function slideInFromLeft(element: Element | null, delay = 0) {
  if (!element) return
  return gsap.fromTo(
    element,
    { opacity: 0, x: -30 },
    {
      opacity: 1,
      x: 0,
      duration: 0.5,
      delay,
      ease: "power2.out",
    }
  )
}

export function createScrollReveal(
  element: Element | null,
  options: {
    y?: number
    delay?: number
    duration?: number
  } = {}
) {
  if (!element) return
  
  const { y = 30, delay = 0, duration = 0.6 } = options

  return gsap.fromTo(
    element,
    { opacity: 0, y },
    {
      opacity: 1,
      y: 0,
      duration,
      delay,
      ease: "power2.out",
      scrollTrigger: {
        trigger: element,
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
    }
  )
}

export function createStaggerScrollReveal(
  elements: Element[] | NodeListOf<Element>,
  options: {
    stagger?: number
    y?: number
    delay?: number
  } = {}
) {
  if (!elements || elements.length === 0) return
  
  const { stagger = 0.1, y = 30, delay = 0 } = options

  return gsap.fromTo(
    elements,
    { opacity: 0, y },
    {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger,
      delay,
      ease: "power2.out",
      scrollTrigger: {
        trigger: elements[0],
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
    }
  )
}

export { gsap, ScrollTrigger }