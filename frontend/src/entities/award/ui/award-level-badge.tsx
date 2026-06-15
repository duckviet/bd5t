"use client"

import { cn } from "@/lib/utils"
import { AwardEvidenceItemAwardLevel } from "@/services/generated/api"

const awardConfig: Record<string, { readonly label: string; readonly className: string }> = {
  [AwardEvidenceItemAwardLevel.NHAT]: {
    label: "Nhất",
    className: "bg-yellow-100 text-yellow-800 border-yellow-300",
  },
  [AwardEvidenceItemAwardLevel.NHI]: {
    label: "Nhì",
    className: "bg-slate-100 text-slate-800 border-slate-300",
  },
  [AwardEvidenceItemAwardLevel.BA]: {
    label: "Ba",
    className: "bg-amber-100 text-amber-800 border-amber-300",
  },
  [AwardEvidenceItemAwardLevel.KHUYEN_KHICH]: {
    label: "Khuyến khích",
    className: "bg-green-100 text-green-800 border-green-300",
  },
}

interface AwardLevelBadgeProps {
  readonly level?: string | null
}

export function AwardLevelBadge({ level }: AwardLevelBadgeProps) {
  if (!level || level === AwardEvidenceItemAwardLevel.NONE) {
    return (
      <span className="inline-flex items-center rounded-full border border-dashed border-muted-foreground/30 px-2 py-0.5 text-xs font-medium text-muted-foreground">
        Không có giải
      </span>
    )
  }

  const config = awardConfig[level]

  if (!config) {
    return (
      <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium">
        {level}
      </span>
    )
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        config.className,
      )}
    >
      {config.label}
    </span>
  )
}

export interface AwardTheme {
  readonly iconBg: string
  readonly iconColor: string
}

export function getAwardTheme(level?: string | null): AwardTheme {
  switch (level) {
    case AwardEvidenceItemAwardLevel.NHAT:
      return {
        iconBg: "bg-yellow-100 dark:bg-yellow-500/10",
        iconColor: "text-yellow-600 dark:text-yellow-500",
      }
    case AwardEvidenceItemAwardLevel.NHI:
      return {
        iconBg: "bg-slate-100 dark:bg-slate-500/10",
        iconColor: "text-slate-500 dark:text-slate-400",
      }
    case AwardEvidenceItemAwardLevel.BA:
      return {
        iconBg: "bg-amber-100 dark:bg-amber-500/10",
        iconColor: "text-amber-600 dark:text-amber-500",
      }
    case AwardEvidenceItemAwardLevel.KHUYEN_KHICH:
      return {
        iconBg: "bg-green-100 dark:bg-green-500/10",
        iconColor: "text-green-600 dark:text-green-500",
      }
    default:
      return {
        iconBg: "bg-amber-500/10",
        iconColor: "text-amber-600",
      }
  }
}
