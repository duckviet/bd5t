"use client"

import { Card, CardContent } from "@/components/ui/card"
import { LoadingSkeleton } from "@/components/common/loading"
import { cn } from "@/lib/utils"

interface EvidenceStatsCardsProps {
  stats?: { pending?: number; approvedToday?: number; rejectedToday?: number; total?: number }
  isLoading: boolean
}

export function EvidenceStatsCards({
  stats,
  isLoading,
}: EvidenceStatsCardsProps) {
  const items = [
    { label: "Chờ duyệt", value: stats?.pending ?? 0, tone: "text-orange-700" },
    { label: "Đã duyệt hôm nay", value: stats?.approvedToday ?? 0, tone: "text-green-700" },
    { label: "Từ chối hôm nay", value: stats?.rejectedToday ?? 0, tone: "text-red-700" },
    { label: "Tổng minh chứng", value: stats?.total ?? 0, tone: "text-foreground" },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">{item.label}</div>
            {isLoading ? (
              <LoadingSkeleton className="mt-2 h-8 w-16" />
            ) : (
              <div className={cn("mt-1 text-2xl font-bold", item.tone)}>{item.value}</div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
