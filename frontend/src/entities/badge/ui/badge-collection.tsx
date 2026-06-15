"use client"

import { Sparkles } from "lucide-react"
import type { ProgressMatrixCriteriaScoresItem } from "@/services/generated/api"
import {
  getSpecificBadges,
  summarizeScores,
} from "@/entities/badge"
import { SpecificBadgeGrid } from "./badge-lists"

interface BadgeCollectionProps {
  readonly criteriaScores: readonly ProgressMatrixCriteriaScoresItem[]
}

export function BadgeCollection({ criteriaScores }: BadgeCollectionProps) {
  const summary = summarizeScores(criteriaScores)
  const specificBadges = getSpecificBadges(summary)

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 flex items-center gap-2">
            Bộ sưu tập Huy hiệu
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Dựa trên tiến trình học tập và rèn luyện của bạn
          </p>
        </div>
      </div>

      {/* Grid content */}
      <div className="pt-2">
        <SpecificBadgeGrid badges={specificBadges} />
      </div>
    </div>
  )
}
