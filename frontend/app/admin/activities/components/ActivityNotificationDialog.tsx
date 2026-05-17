"use client"

import { Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CRITERIA, REVIEW_LEVELS } from "@/lib/constants"
import type { ActivityItem } from "@/services/generated/api"

export type ActivityNotificationType = "ACTIVITY_NEW" | "SUGGESTION"

export type ActivityNotificationDialogState = {
  mode: "single" | "bulk"
  activities: ActivityItem[]
} | null

export const notificationOptions: Array<{
  value: ActivityNotificationType
  label: string
  description: string
}> = [
  {
    value: "ACTIVITY_NEW",
    label: "Hoạt động mới",
    description: "Phù hợp khi hoạt động vừa được đăng hoặc cần thông báo lại cho sinh viên còn thiếu tiêu chí.",
  },
  {
    value: "SUGGESTION",
    label: "Gợi ý hoàn thiện tiêu chí",
    description: "Phù hợp khi muốn đề xuất hoạt động như một lựa chọn bổ sung cho sinh viên.",
  },
]

interface ActivityNotificationDialogProps {
  open: boolean
  state: ActivityNotificationDialogState
  notificationType: ActivityNotificationType
  isPending: boolean
  onNotificationTypeChange: (type: ActivityNotificationType) => void
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function ActivityNotificationDialog({
  open,
  state,
  notificationType,
  isPending,
  onNotificationTypeChange,
  onOpenChange,
  onConfirm,
}: ActivityNotificationDialogProps) {
  const activities = state?.activities ?? []
  const selectedOption = notificationOptions.find((option) => option.value === notificationType)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Gửi thông báo hoạt động</DialogTitle>
          <DialogDescription>
            Kiểm tra hoạt động, loại thông báo và nhóm sinh viên sẽ được hệ thống tự động lọc trước khi gửi.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {notificationOptions.map((option) => {
              const isSelected = notificationType === option.value

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onNotificationTypeChange(option.value)}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40 hover:bg-muted/40"
                  }`}
                  aria-pressed={isSelected}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold">{option.label}</div>
                    <Badge variant={isSelected ? "default" : "outline"}>
                      {isSelected ? "Đang chọn" : "Chọn"}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{option.description}</p>
                </button>
              )
            })}
          </div>

          <div className="rounded-lg border bg-muted/20 p-3">
            <div className="text-sm font-semibold">Quy tắc người nhận</div>
            <p className="mt-1 text-sm text-muted-foreground">
              Chỉ gửi cho sinh viên phù hợp đơn vị của hoạt động và còn thiếu ít nhất một cặp tiêu chí/cấp xét mà hoạt động cung cấp.
              Thông báo trùng cùng batch sẽ được bỏ qua.
            </p>
          </div>

          <div className="rounded-lg border">
            <div className="flex items-center justify-between gap-3 border-b px-3 py-2">
              <div>
                <div className="text-sm font-semibold">
                  {state?.mode === "bulk" ? "Hoạt động đã chọn" : "Hoạt động"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {activities.length} hoạt động, loại thông báo: {selectedOption?.label ?? notificationType}
                </div>
              </div>
            </div>
            <div className="max-h-72 divide-y overflow-y-auto">
              {activities.map((activity) => (
                <div key={activity.id} className="space-y-2 px-3 py-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{activity.title || "Chưa có tên hoạt động"}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {activity.organizer || activity.unitName || "Không giới hạn đơn vị"} ·{" "}
                        {activity.startDate || "Chưa có ngày bắt đầu"}
                        {activity.endDate ? ` - ${activity.endDate}` : ""}
                      </div>
                    </div>
                    <Badge variant={activity.isActive ? "success" : "secondary"}>
                      {activity.isActive ? "Đang hoạt động" : "Nháp"}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {activity.reviewLevel && (
                      <Badge variant="outline">
                        {REVIEW_LEVELS[activity.reviewLevel as keyof typeof REVIEW_LEVELS] ?? activity.reviewLevel}
                      </Badge>
                    )}
                    {activity.criteria?.length ? (
                      activity.criteria.map((criterion) => (
                        <Badge key={criterion} variant="outline">
                          {CRITERIA[criterion as keyof typeof CRITERIA] ?? criterion}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="secondary">Chưa phân loại tiêu chí</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Hủy
          </Button>
          <Button onClick={onConfirm} disabled={isPending || activities.length === 0} className="gap-2">
            <Bell className="h-4 w-4" />
            Gửi thông báo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
