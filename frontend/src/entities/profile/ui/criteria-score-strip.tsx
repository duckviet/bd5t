"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { profileCriteriaKeys } from "@/entities/badge"
import { CRITERIA, type CriterionType } from "@/lib/constants"
import type { ProgressMatrixCriteriaScoresItem } from "@/services/generated/api"

interface CriteriaScoreStripProps {
  scores: ProgressMatrixCriteriaScoresItem[]
}

const criteriaTone: Record<CriterionType, string> = {
  DAO_DUC: "bg-emerald-50 text-emerald-700 border-emerald-200",
  HOC_TAP: "bg-blue-50 text-blue-700 border-blue-200",
  THE_LUC: "bg-rose-50 text-rose-700 border-rose-200",
  TINH_NGUYEN: "bg-amber-50 text-amber-700 border-amber-200",
  HOI_NHAP: "bg-violet-50 text-violet-700 border-violet-200",
}

function scoreByCriteria(scores: ProgressMatrixCriteriaScoresItem[]) {
  return new Map(scores.map((score) => [score.criteria ?? "", score]))
}

export function CriteriaScoreStrip({ scores }: CriteriaScoreStripProps) {
  const scoreMap = scoreByCriteria(scores)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Điểm 5 tiêu chí</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {profileCriteriaKeys.map((criteria) => {
            const score = scoreMap.get(criteria)
            const value = score?.score ?? 0
            const participation = score?.participationScore ?? 0
            const awardScore = score?.awardScore ?? 0

            return (
              <div
                key={criteria}
                className={`rounded-lg border p-3 ${criteriaTone[criteria]}`}
              >
                <div className="text-sm font-medium">{CRITERIA[criteria]}</div>
                <div className="mt-2 text-2xl font-bold">{value}</div>
                <div className="text-xs opacity-80">/ {score?.maxScore ?? 200} điểm</div>
                <div className="mt-2 text-xs">
                  <div>Tham gia: {participation}</div>
                  <div>Giải: {awardScore}</div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
