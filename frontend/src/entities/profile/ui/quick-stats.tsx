import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, AlertCircle } from "lucide-react"
import { profileCriteriaKeys } from "@/entities/badge"
import { CRITERIA } from "@/lib/constants"
import type { ProgressMatrixCriteriaScoresItem } from "@/services/generated/api"

interface QuickStatsProps {
  readonly scores: readonly ProgressMatrixCriteriaScoresItem[]
}

export function QuickStats({ scores }: QuickStatsProps) {
  const scoreMap = new Map(scores.map((score) => [score.criteria ?? "", score]))
  const stats = profileCriteriaKeys.map((criteria) => {
    const score = scoreMap.get(criteria)?.score ?? 0

    return {
      key: criteria,
      label: CRITERIA[criteria],
      completed: score > 0,
      score,
    }
  })
  const total = stats.length
  const completed = stats.filter((stat) => stat.completed).length
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100)

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold text-slate-800">Tiến độ tổng quan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-extrabold text-primary">{percent}%</div>
          <div className="text-xs text-muted-foreground mt-1">
            Đã đạt {completed} / {total} tiêu chí
          </div>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="space-y-2 border-t pt-4">
          {stats.map((criterion) => (
            <div
              key={criterion.key}
              className="flex items-center justify-between rounded-lg bg-slate-50/50 p-2 transition-colors hover:bg-slate-50"
            >
              <span className="text-xs font-semibold text-slate-700">{criterion.label}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500">{criterion.score}đ</span>
                {criterion.completed ? (
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-100 text-emerald-700">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                ) : (
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-slate-100 text-slate-400">
                    <AlertCircle className="h-3 w-3" />
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
