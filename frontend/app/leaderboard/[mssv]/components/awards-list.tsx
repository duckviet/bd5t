import { Trophy } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AwardLevelBadge, getAwardTheme } from "@/entities/award"
import { REVIEW_LEVELS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { LeaderboardDetailAwardsItem } from "@/services/generated/api"

interface AwardsListProps {
  readonly awards?: readonly LeaderboardDetailAwardsItem[]
}

export function AwardsList({ awards }: AwardsListProps) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-bold">
          <Trophy className="h-5 w-5 text-primary animate-pulse" />
          Danh sách giải thưởng đạt được ({awards?.length ?? 0})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {awards && awards.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {awards.map((award, idx) => {
              const theme = getAwardTheme(award.awardLevel)
              return (
                <div
                  key={idx}
                  className="flex items-center p-4 rounded-xl border border-border bg-white hover:shadow-sm transition-all duration-100 gap-4"
                >
                  <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", theme.iconBg)}>
                    <Trophy className={cn("h-5 w-5", theme.iconColor)} />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="font-bold text-sm text-slate-800 leading-snug break-words" title={award.activityTitle}>
                      {award.activityTitle}
                    </div>
                    {award.reviewLevel && (
                      <Badge variant="secondary" className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 hover:bg-slate-100">
                        {REVIEW_LEVELS[award.reviewLevel as keyof typeof REVIEW_LEVELS] ?? award.reviewLevel}
                      </Badge>
                    )}
                  </div>
                  <div className="shrink-0">
                    <AwardLevelBadge level={award.awardLevel} />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground text-center py-12 flex flex-col items-center justify-center gap-2">
            <Trophy className="h-8 w-8 text-slate-300" />
            <p>Sinh viên chưa có giải thưởng nào được ghi nhận.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
