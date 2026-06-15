"use client"

import Link from "next/link"
import { ArrowRight, Award, Loader2, Sparkles, Trophy } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { ProgressMatrixCriteriaScoresItem } from "@/services/generated/api"
import { badgeIcons, type BadgeDefinition } from "@/entities/badge"
import { badgeIconImages } from "./badge-assets"
import { useBadgeTeaser } from "./use-badge-teaser"
import { DraggableBadge } from "./draggable-badge"

interface BadgeTeaserProps {
  readonly criteriaScores: readonly ProgressMatrixCriteriaScoresItem[]
}

export function BadgeTeaser({ criteriaScores }: BadgeTeaserProps) {
  const {
    allUnlockedBadges,
    positions,
    defaultPositions,
    draggingId,
    containerRef,
    isLoaded,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleReset,
  } = useBadgeTeaser(criteriaScores)

  return (
    <Card className="overflow-hidden bg-transparent">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-800">
          Huy hiệu đã thu thập
        </CardTitle>
        <Link
          href="/profile/badges"
          className="flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-primary/80"
        >
          Bộ sưu tập
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="relative">
          <div
            ref={containerRef}
            style={{
              backgroundImage: "radial-gradient(#e2e8f0 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
            className="relative w-full h-[280px] rounded-2xl overflow-hidden"
          >
            {!isLoaded ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
              </div>
            ) : allUnlockedBadges.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <Trophy className="h-10 w-10 text-slate-300 mb-2" />
                <span className="text-xs font-semibold text-slate-400">
                  Chưa có huy hiệu nào được mở khóa
                </span>
                <p className="text-[10px] text-slate-400/80 max-w-[240px] mt-1">
                  Hãy hoàn thành nhiệm vụ và tích lũy điểm để vinh danh huy hiệu của bạn tại đây!
                </p>
              </div>
            ) : (
              allUnlockedBadges.map((badge) => {
                const imgUrl = badgeIconImages[badge.id]
                const pos =
                  positions[badge.id] ??
                  defaultPositions[badge.id] ??
                  { x: 4, y: 4 }
                const isDragging = draggingId === badge.id

                return (
                  <DraggableBadge
                    key={badge.id}
                    badge={badge}
                    imgUrl={imgUrl}
                    pos={pos}
                    isDragging={isDragging}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                  />
                )
              })
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface BadgePreviewProps {
  readonly label: string
  readonly fallbackIcon: typeof Trophy
  readonly fallbackName: string
  readonly badge: BadgeDefinition | undefined
}

function BadgePreview({
  label,
  fallbackIcon: FallbackIcon,
  fallbackName,
  badge,
}: BadgePreviewProps) {
  const Icon = badge ? badgeIcons[badge.iconKey] : FallbackIcon

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100/80 bg-slate-50/50 p-3 transition-colors hover:bg-slate-50">
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm",
          badge
            ? `bg-gradient-to-br ${badge.gradientClass}`
            : "bg-slate-200 text-slate-400",
        )}
      >
        <Icon className="h-5.5 w-5.5" />
      </div>
      <div className="min-w-0">
        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </span>
        <div
          className="mt-0.5 truncate text-sm font-extrabold text-slate-700"
          title={badge?.name}
        >
          {badge?.name ?? fallbackName}
        </div>
      </div>
    </div>
  )
}

