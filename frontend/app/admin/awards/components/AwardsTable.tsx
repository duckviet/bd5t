"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AwardBadge } from "./AwardBadge"
import { cn } from "@/lib/utils"
import type { AwardEvidenceItem } from "@/services/generated/api"

interface AwardsTableProps {
  items: AwardEvidenceItem[]
  selectedIds: string[]
  onToggle: (id: string) => void
  onToggleAll: () => void
}

export function AwardsTable({
  items,
  selectedIds,
  onToggle,
  onToggleAll,
}: AwardsTableProps) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Không có minh chứng phù hợp
        </CardContent>
      </Card>
    )
  }

  const allSelected = items.every((item) => selectedIds.includes(item.id ?? ""))

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-muted/50">
          <tr>
            <th className="w-10 px-4 py-3">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleAll}
                className="h-4 w-4 rounded border-border"
                aria-label="Chọn tất cả"
              />
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Sinh viên
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Mã SV
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Hoạt động
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Tiêu chí
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Cấp giải
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Điểm
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-white">
          {items.map((item) => {
            const isChecked = Boolean(item.id && selectedIds.includes(item.id))

            return (
              <tr
                key={item.id}
                className={cn(
                  "transition-colors hover:bg-muted/30",
                  isChecked && "bg-primary/5",
                )}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => item.id && onToggle(item.id)}
                    className="h-4 w-4 rounded border-border"
                    aria-label="Chọn"
                  />
                </td>
                <td className="px-4 py-3 text-sm font-medium">{item.userFullName || "—"}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {item.userStudentId || "—"}
                </td>
                <td className="px-4 py-3 text-sm max-w-[200px] truncate" title={item.activityTitle}>
                  {item.activityTitle || "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {item.criteria?.map((c) => (
                      <Badge key={c} variant="outline" className="text-xs">
                        {c}
                      </Badge>
                    )) ?? "—"}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <AwardBadge level={item.awardLevel} />
                </td>
                <td className="px-4 py-3 text-sm">{item.score ?? "—"}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
