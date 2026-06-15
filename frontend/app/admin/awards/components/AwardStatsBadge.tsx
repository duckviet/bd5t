"use client"

import { AwardEvidenceInfoAwardLevel } from "@/services/generated/api"

interface AwardStatsBadgeProps {
  stats?: {
    NHAT?: number
    NHI?: number
    BA?: number
    KHUYEN_KHICH?: number
    NONE?: number
  }
}

export function AwardStatsBadge({ stats }: AwardStatsBadgeProps) {
  if (!stats) return null

  const items = []
  if (stats.NHAT) items.push({ icon: "🏆", label: "Nhất", count: stats.NHAT, className: "text-yellow-700 bg-yellow-50 border-yellow-200" })
  if (stats.NHI) items.push({ icon: "🥈", label: "Nhì", count: stats.NHI, className: "text-slate-700 bg-slate-50 border-slate-200" })
  if (stats.BA) items.push({ icon: "🥉", label: "Ba", count: stats.BA, className: "text-amber-700 bg-amber-50 border-amber-200" })
  if (stats.KHUYEN_KHICH) items.push({ icon: "🎖", label: "KK", count: stats.KHUYEN_KHICH, className: "text-green-700 bg-green-50 border-green-200" })
  if (stats.NONE) items.push({ label: "Không giải", count: stats.NONE, className: "text-muted-foreground bg-muted/30 border-border" })

  if (items.length === 0) return <span className="text-xs text-muted-foreground">Chưa có giải</span>

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item.label}
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${item.className}`}
        >
          {item.icon && <span>{item.icon}</span>}
          {item.count}
        </span>
      ))}
    </div>
  )
}
