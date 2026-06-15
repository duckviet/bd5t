"use client"

import { Card, CardContent } from "@/components/ui/card"
import { LoadingSkeleton } from "@/components/common/loading"
import type { AwardActivityOverview } from "@/services/generated/api"

interface OverallStats {
  totalActivities: number
  totalStudents: number
  totalEvidences: number
}

function computeOverall(activities: AwardActivityOverview[]): OverallStats {
  let totalStudents = 0
  let totalEvidences = 0
  for (const a of activities) {
    totalStudents += a.totalStudents ?? 0
    for (const s of a.students ?? []) {
      totalEvidences += s.evidences?.length ?? 0
    }
  }
  return { totalActivities: activities.length, totalStudents, totalEvidences }
}

interface AwardsStatsCardsProps {
  activities: AwardActivityOverview[]
  isLoading: boolean
}

export function AwardsStatsCards({ activities, isLoading }: AwardsStatsCardsProps) {
  const stats = computeOverall(activities)

  const items = [
    { label: "Hoạt động có giải", value: stats.totalActivities },
    { label: "Tổng sinh viên", value: stats.totalStudents },
    { label: "Tổng minh chứng", value: stats.totalEvidences },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">{item.label}</div>
            {isLoading ? (
              <LoadingSkeleton className="mt-2 h-8 w-16" />
            ) : (
              <div className="mt-1 text-2xl font-bold">{item.value}</div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
