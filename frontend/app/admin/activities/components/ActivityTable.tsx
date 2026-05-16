"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Eye, Pencil, Trash2, LayoutGrid, Users, ArrowUpDown } from "lucide-react"
import { CRITERIA, REVIEW_LEVELS } from "@/lib/constants"
import type { ActivityItem, ListAdminActivitiesSort } from "@/services/generated/api"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import "dayjs/locale/vi"
import { cn } from "@/lib/utils"

dayjs.extend(relativeTime)
dayjs.locale("vi")

interface ActivityTableProps {
  activities: ActivityItem[]
  selectedIds: string[]
  startIndex: number
  sort: ListAdminActivitiesSort
  onSortChange: (sort: ListAdminActivitiesSort) => void
  onToggleSelected: (id: string) => void
  onView: (activity: ActivityItem) => void
  onEdit: (activity: ActivityItem) => void
  onDelete: (activity: ActivityItem) => void
  isLoading: boolean
}

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex animate-pulse items-center gap-4 border-b border-border px-4 py-3.5 last:border-0">
          <div className="h-4 w-8 rounded bg-muted" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 w-48 rounded bg-muted" />
            <div className="h-3 w-32 rounded bg-muted" />
          </div>
          <div className="hidden h-4 w-32 rounded bg-muted md:block" />
          <div className="hidden h-4 w-24 rounded bg-muted lg:block" />
          <div className="h-5 w-20 rounded-full bg-muted" />
          <div className="h-8 w-24 rounded bg-muted" />
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <Card className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <LayoutGrid className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mb-1 text-base font-semibold">Chưa có hoạt động nào</h3>
      <p className="max-w-xs text-sm text-muted-foreground">
        Không tìm thấy hoạt động phù hợp với bộ lọc. Thử thay đổi điều kiện tìm kiếm.
      </p>
    </Card>
  )
}

function SortButton({
  children,
  sort,
  value,
  onSortChange,
}: {
  children: React.ReactNode
  sort: ListAdminActivitiesSort
  value: ListAdminActivitiesSort
  onSortChange: (sort: ListAdminActivitiesSort) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSortChange(value)}
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider",
        sort === value ? "text-primary" : "text-muted-foreground",
      )}
    >
      {children}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  )
}

export function ActivityTable({
  activities,
  selectedIds,
  startIndex,
  sort,
  onSortChange,
  onToggleSelected,
  onView,
  onEdit,
  onDelete,
  isLoading,
}: ActivityTableProps) {
  if (isLoading) return <TableSkeleton />
  if (activities.length === 0) return <EmptyState />

  return (
    <div className="overflow-x-auto rounded-xl border border-border shadow-sm">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/40 text-nowrap">
            <th className="w-10 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground" />
            <th className="w-12 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">#</th>
            <th className="px-4 py-3 text-left">
              <SortButton sort={sort} value="title_asc" onSortChange={onSortChange}>
                Hoạt động
              </SortButton>
            </th>
            <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground lg:table-cell">Đơn vị</th>
            <th className="hidden px-4 py-3 text-left xl:table-cell">
              <SortButton sort={sort} value="createdAt_desc" onSortChange={onSortChange}>
                Thời gian
              </SortButton>
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Cấp</th>
            <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground 2xl:table-cell">Tiêu chí</th>
            <th className="px-4 py-3 text-center">
              <SortButton sort={sort} value="participant_desc" onSortChange={onSortChange}>
                Số liệu
              </SortButton>
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">TT</th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Hành động</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {activities.map((activity, idx) => {
            const isChecked = Boolean(activity.id && selectedIds.includes(activity.id))
            return (
              <tr
                key={activity.id}
                className={cn(
                  "transition-colors hover:bg-primary/5",
                  idx % 2 === 0 ? "bg-white" : "bg-muted/20",
                )}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => activity.id && onToggleSelected(activity.id)}
                    className="h-4 w-4 rounded border-border"
                    aria-label="Chọn hoạt động"
                  />
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {startIndex + idx + 1}
                </td>
                <td className="px-4 py-3">
                  <div className="flex max-w-[260px] flex-col">
                    <span className="text-wrap text-sm font-medium leading-tight" title={activity.title}>
                      {activity.title}
                    </span>
                    {activity.shortDescription && (
                      <span
                        className="mt-0.5 truncate text-xs text-muted-foreground"
                        title={activity.shortDescription}
                      >
                        {activity.shortDescription}
                      </span>
                    )}
                  </div>
                </td>
                <td className="hidden w-full min-w-[260px] px-4 py-3 text-sm text-muted-foreground lg:table-cell">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                    <span className="text-wrap" title={activity.organizer || activity.unitName || undefined}>
                      {activity.organizer || activity.unitName || "Chưa có đơn vị"}
                    </span>
                  </div>
                </td>
                <td className="hidden px-4 py-3 text-xs text-muted-foreground xl:table-cell">
                  <div className="flex flex-col">
                    {activity.startDate ? (
                      <span>
                        {dayjs(activity.startDate).format("DD/MM/YY")}
                        {activity.endDate && ` -> ${dayjs(activity.endDate).format("DD/MM/YY")}`}
                      </span>
                    ) : (
                      <span>Chưa có lịch</span>
                    )}
                    {activity.endDate && dayjs(activity.endDate).isAfter(dayjs()) && (
                      <span className="mt-0.5 text-[10px] font-medium text-primary">
                        Còn {dayjs(activity.endDate).fromNow()}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {activity.reviewLevel ? (
                    <Badge variant="outline" className="text-nowrap text-xs font-normal">
                      {REVIEW_LEVELS[activity.reviewLevel as keyof typeof REVIEW_LEVELS] || activity.reviewLevel}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">Chưa chọn cấp</Badge>
                  )}
                </td>
                <td className="hidden px-4 py-3 2xl:table-cell">
                  <div className="flex max-w-[220px] flex-wrap gap-1">
                    {activity.criteria?.length ? (
                      activity.criteria.map((c) => (
                        <Badge key={c} variant="outline" className="px-1.5 py-0 text-[10px]">
                          {CRITERIA[c as keyof typeof CRITERIA]?.replace(" tốt", "") || c}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">
                        Chưa phân loại
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-center text-xs text-muted-foreground">
                  <div className="flex flex-col">
                    <span>{activity.participantCount ?? 0} SV</span>
                    <span>{activity.evidenceCount ?? 0} MC</span>
                    {(activity.pendingEvidenceCount ?? 0) > 0 && (
                      <span className="font-medium text-orange-700">
                        {activity.pendingEvidenceCount} chờ
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge
                    variant={activity.isActive ? "success" : "secondary"}
                    className="px-2 py-0.5 text-[10px] font-medium"
                  >
                    {activity.isActive ? "Hoạt động" : "Nháp"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-0.5">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onView(activity)} title="Xem chi tiết">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onEdit(activity)} title="Chỉnh sửa">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive/70 hover:text-destructive"
                      onClick={() => onDelete(activity)}
                      title="Xóa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
