"use client"

import { Trophy } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AwardLevelBadge,
  getProfileAwards,
  getAwardTheme,
  type ProfileAward,
} from "@/entities/award"
import { REVIEW_LEVELS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { EvidenceItem } from "@/services/generated/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ProfileAwardsSummaryProps {
  readonly evidences: readonly EvidenceItem[]
}

export function ProfileAwardsSummary({ evidences }: ProfileAwardsSummaryProps) {
  const awards = getProfileAwards(evidences)

  if (awards.length === 0) {
    return null
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Giải thưởng đạt được</CardTitle>
        <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
          {awards.length} giải
        </span>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between">
        <div className="space-y-3">
          {awards.slice(0, 3).map((award) => (
            <AwardSummaryRow key={award.id} award={award} />
          ))}
        </div>
        {awards.length > 3 && (
          <Dialog>
            <DialogTrigger asChild>
              <button className="mt-4 w-full text-center text-xs italic text-muted-foreground hover:text-primary hover:underline cursor-pointer transition-colors pb-1">
                Và {awards.length - 3} giải thưởng khác
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-6">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500 animate-bounce" />
                  Danh sách giải thưởng ({awards.length})
                </DialogTitle>
                <DialogDescription>
                  Tất cả các giải thưởng đã đạt được ghi nhận từ minh chứng của bạn.
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto pr-1 py-2 space-y-3 mt-4">
                {awards.map((award) => (
                  <AwardSummaryRow key={award.id} award={award} />
                ))}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  )
}

export function hasProfileAwards(evidences: readonly EvidenceItem[]): boolean {
  return getProfileAwards(evidences).length > 0
}

function AwardSummaryRow({ award }: { readonly award: ProfileAward }) {
  const theme = getAwardTheme(award.awardLevel)
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border p-4 transition-colors hover:bg-muted/50">
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", theme.iconBg)}>
        <Trophy className={cn("h-5 w-5 animate-pulse", theme.iconColor)} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium" title={award.activityTitle}>
          {award.activityTitle}
        </div>
        <div className="mt-0.5 text-xs text-muted-foreground">
          {award.reviewLevel ? REVIEW_LEVELS[award.reviewLevel] : ""}
        </div>
      </div>
      <div className="shrink-0">
        <AwardLevelBadge level={award.awardLevel} />
      </div>
    </div>
  )
}
