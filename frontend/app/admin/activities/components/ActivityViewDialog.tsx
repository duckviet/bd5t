"use client"

import { Badge } from "@/components/ui/badge"
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog"
import { CRITERIA, REVIEW_LEVELS } from "@/lib/constants"
import type { ActivityItem } from "@/services/generated/api"

interface ActivityViewDialogProps {
  activity: ActivityItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ActivityViewDialog({
  activity,
  open,
  onOpenChange,
}: ActivityViewDialogProps) {
  if (!activity) return null

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="max-w-2xl">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>{activity.title || "Chi tiết hoạt động"}</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Thông tin quản trị, số liệu minh chứng và cấu hình điểm của hoạt động
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <div className="grid gap-4 py-2 sm:grid-cols-2">
          <div>
            <div className="text-xs font-medium text-muted-foreground">Trạng thái</div>
            <Badge variant={activity.isActive ? "success" : "secondary"} className="mt-1">
              {activity.isActive ? "Đang hoạt động" : "Nháp"}
            </Badge>
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">Cấp xét</div>
            <div className="mt-1 text-sm">
              {activity.reviewLevel ? REVIEW_LEVELS[activity.reviewLevel as keyof typeof REVIEW_LEVELS] ?? activity.reviewLevel : "Chưa chọn"}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">Đơn vị tổ chức</div>
            <div className="mt-1 text-sm">{activity.organizer || activity.unitName || "Chưa có"}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">Người tạo</div>
            <div className="mt-1 text-sm">{activity.createdByName || "Chưa ghi nhận"}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">Sinh viên tham gia</div>
            <div className="mt-1 text-sm">{activity.participantCount ?? 0}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">Minh chứng</div>
            <div className="mt-1 text-sm">
              {activity.evidenceCount ?? 0} tổng, {activity.pendingEvidenceCount ?? 0} chờ duyệt
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">Điểm quy đổi</div>
            <div className="mt-1 text-sm">{activity.totalScore ?? 0}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">Thời gian</div>
            <div className="mt-1 text-sm">
              {activity.startDate || "Chưa có"} {activity.endDate ? `-> ${activity.endDate}` : ""}
            </div>
          </div>
          <div className="sm:col-span-2">
            <div className="text-xs font-medium text-muted-foreground">Tiêu chí</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {activity.criteria?.length ? (
                activity.criteria.map((criterion) => (
                  <Badge key={criterion} variant="outline">
                    {CRITERIA[criterion as keyof typeof CRITERIA] ?? criterion}
                  </Badge>
                ))
              ) : (
                <Badge variant="secondary">Chưa phân loại</Badge>
              )}
            </div>
          </div>
          <div className="sm:col-span-2">
            <div className="text-xs font-medium text-muted-foreground">Mô tả</div>
            <div className="mt-1 text-sm text-muted-foreground">
              {activity.shortDescription || "Chưa có mô tả ngắn"}
            </div>
          </div>
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  )
}
