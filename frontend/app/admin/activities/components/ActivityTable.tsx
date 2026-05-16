"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Calendar, Eye, Pencil, Trash2, LayoutGrid, Users } from "lucide-react"
import { CRITERIA, REVIEW_LEVELS } from "@/lib/constants"
import type { ActivityItem } from "@/services/generated/api"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import "dayjs/locale/vi"

dayjs.extend(relativeTime)
dayjs.locale("vi")

interface ActivityTableProps {
  activities: ActivityItem[]
  onEdit: (activity: ActivityItem) => void
  onDelete: (id: string) => void
  isLoading: boolean
}

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3.5 border-b border-border last:border-0 animate-pulse">
          <div className="w-8 h-4 bg-muted rounded" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 w-48 bg-muted rounded" />
            <div className="h-3 w-32 bg-muted rounded" />
          </div>
          <div className="hidden md:block w-32 h-4 bg-muted rounded" />
          <div className="hidden lg:block w-24 h-4 bg-muted rounded" />
          <div className="w-20 h-5 bg-muted rounded-full" />
          <div className="w-24 h-8 bg-muted rounded" />
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <Card className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <LayoutGrid className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold mb-1">Chưa có hoạt động nào</h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        Không tìm thấy hoạt động phù hợp với bộ lọc. Thử thay đổi điều kiện tìm kiếm.
      </p>
    </Card>
  )
}

export function ActivityTable({
  activities,
  onEdit,
  onDelete,
  isLoading,
}: ActivityTableProps) {
  if (isLoading) return <TableSkeleton />
  if (activities.length === 0) return <EmptyState />

  return (
    <div className="space-y-1">
      <div className="overflow-x-auto rounded-xl border border-border shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 w-10">#</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Hoạt động</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Đơn vị</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden xl:table-cell">Thời gian</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Cấp</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden 2xl:table-cell">Tiêu chí</th>
              <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">TT</th>
              <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {activities.map((activity, idx) => (
              <tr
                key={activity.id}
                className="bg-card transition-colors hover:bg-muted/20 group"
              >
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {idx + 1}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-medium text-sm leading-tight">{activity.title}</span>
                    {activity.shortDescription && (
                      <span className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {activity.shortDescription}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell max-w-[200px] wrap-normal">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                    <span className="truncate">{activity.organizer || "—"}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground hidden xl:table-cell">
                  <div className="flex flex-col">
                    {activity.startDate && (
                      <span>
                        {dayjs(activity.startDate).format("DD/MM/YY")}
                        {activity.endDate && ` → ${dayjs(activity.endDate).format("DD/MM/YY")}`}
                      </span>
                    )}
                    {activity.endDate && dayjs(activity.endDate).isAfter(dayjs()) && (
                      <span className="text-primary text-[10px] font-medium mt-0.5">
                        Còn {dayjs(activity.endDate).fromNow()}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {activity.reviewLevel ? (
                    <Badge variant="outline" className="text-xs font-normal text-nowrap">
                      {REVIEW_LEVELS[activity.reviewLevel as keyof typeof REVIEW_LEVELS] || activity.reviewLevel}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3 hidden 2xl:table-cell">
                  <div className="flex flex-wrap gap-1 max-w-[180px]">
                    {activity.criteria?.length ? (
                      activity.criteria.slice(0, 3).map((c) => (
                        <Badge key={c} variant="outline" className="text-[10px] px-1.5 py-0">
                          {CRITERIA[c as keyof typeof CRITERIA]?.replace(" tốt", "") || c}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                    {activity.criteria && activity.criteria.length > 3 && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        +{activity.criteria.length - 3}
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge
                    variant={activity.isActive ? "success" : "secondary"}
                    className="text-[10px] px-2 py-0.5 font-medium"
                  >
                    {activity.isActive ? "Hoạt động" : "Nháp"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => onEdit(activity)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive/70 hover:text-destructive"
                      onClick={() => activity.id && onDelete(activity.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}