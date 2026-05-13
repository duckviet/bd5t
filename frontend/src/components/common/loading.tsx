"use client"

import { cn } from "@/lib/utils"

interface LoadingSkeletonProps {
  className?: string
}

export function LoadingSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div className={cn("animate-pulse bg-muted rounded-lg", className)} />
  )
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
      <LoadingSkeleton className="h-4 w-1/3" />
      <LoadingSkeleton className="h-6 w-2/3" />
      <LoadingSkeleton className="h-4 w-full" />
      <LoadingSkeleton className="h-4 w-2/3" />
      <div className="flex gap-2">
        <LoadingSkeleton className="h-8 w-20" />
        <LoadingSkeleton className="h-8 w-20" />
      </div>
    </div>
  )
}

export function ActivityCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <LoadingSkeleton className="aspect-video" />
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <LoadingSkeleton className="h-5 w-16 rounded-full" />
          <LoadingSkeleton className="h-5 w-16 rounded-full" />
        </div>
        <LoadingSkeleton className="h-5 w-3/4" />
        <LoadingSkeleton className="h-4 w-1/2" />
        <div className="flex gap-2">
          <LoadingSkeleton className="h-8 flex-1" />
          <LoadingSkeleton className="h-8 flex-1" />
        </div>
      </div>
    </div>
  )
}

export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-border">
      {Array.from({ length: columns }).map((_, i) => (
        <LoadingSkeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <LoadingSkeleton className="h-24 w-24 rounded-full mx-auto mb-4" />
          <LoadingSkeleton className="h-6 w-2/3 mx-auto mb-2" />
          <LoadingSkeleton className="h-4 w-1/3 mx-auto" />
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <LoadingSkeleton className="h-6 w-1/2 mb-4" />
          <div className="space-y-3">
            <LoadingSkeleton className="h-4 w-full" />
            <LoadingSkeleton className="h-4 w-full" />
            <LoadingSkeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-2xl border border-border bg-card p-6">
          <LoadingSkeleton className="h-6 w-1/3 mb-4" />
          <LoadingSkeleton className="h-64 w-full" />
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <LoadingSkeleton className="h-6 w-1/3 mb-4" />
          <div className="space-y-3">
            <LoadingSkeleton className="h-16 w-full" />
            <LoadingSkeleton className="h-16 w-full" />
            <LoadingSkeleton className="h-16 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}