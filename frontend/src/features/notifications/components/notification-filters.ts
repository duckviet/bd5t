import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Clock,
  Lightbulb,
  UserPlus,
  XCircle,
  type LucideIcon,
} from "lucide-react"

import type { NotificationItem } from "@/services/generated/api"

export type NotificationFilter = "all" | "unread" | "approved" | "rejected" | "activity"

export interface NotificationFilterOption {
  value: NotificationFilter
  label: string
  emptyDescription: string
}

interface NotificationTypeConfig {
  icon: LucideIcon
  colorClassName: string
}

export const NOTIFICATION_FILTERS: NotificationFilterOption[] = [
  {
    value: "all",
    label: "Tất cả",
    emptyDescription: "Thông báo mới sẽ xuất hiện tại đây",
  },
  {
    value: "unread",
    label: "Chưa đọc",
    emptyDescription: "Tất cả thông báo đã được đọc",
  },
  {
    value: "approved",
    label: "Duyệt thành công",
    emptyDescription: "Chưa có thông báo duyệt thành công",
  },
  {
    value: "rejected",
    label: "Từ chối",
    emptyDescription: "Chưa có thông báo từ chối minh chứng",
  },
  {
    value: "activity",
    label: "Đề xuất hoạt động",
    emptyDescription: "Chưa có đề xuất hoặc hoạt động mới",
  },
]

const notificationTypeConfig: Record<string, NotificationTypeConfig> = {
  ACTIVITY_NEW: {
    icon: Bell,
    colorClassName: "bg-primary/10 text-primary",
  },
  ACTIVITY_DEADLINE_SOON: {
    icon: Clock,
    colorClassName: "bg-orange-100 text-orange-600",
  },
  EVIDENCE_APPROVED: {
    icon: CheckCircle2,
    colorClassName: "bg-green-100 text-green-700",
  },
  EVIDENCE_REJECTED: {
    icon: XCircle,
    colorClassName: "bg-red-100 text-red-700",
  },
  SUGGESTION: {
    icon: Lightbulb,
    colorClassName: "bg-green-100 text-green-600",
  },
  ACTIVITY_INVITE: {
    icon: UserPlus,
    colorClassName: "bg-sky-100 text-sky-700",
  },
}

const fallbackNotificationConfig: NotificationTypeConfig = {
  icon: AlertCircle,
  colorClassName: "bg-muted text-muted-foreground",
}

export function getNotificationTypeConfig(type: string): NotificationTypeConfig {
  return notificationTypeConfig[type] ?? fallbackNotificationConfig
}

export function matchesNotificationFilter(
  notification: NotificationItem,
  filter: NotificationFilter,
): boolean {
  switch (filter) {
    case "all":
      return true
    case "unread":
      return !notification.isRead
    case "approved":
      return notification.type === "EVIDENCE_APPROVED"
    case "rejected":
      return notification.type === "EVIDENCE_REJECTED"
    case "activity":
      return (
        notification.type === "SUGGESTION" ||
        notification.type === "ACTIVITY_NEW" ||
        notification.type === "ACTIVITY_DEADLINE_SOON" ||
        notification.type === "ACTIVITY_INVITE"
      )
  }
}

export function getNotificationFilterDescription(filter: NotificationFilter): string {
  return (
    NOTIFICATION_FILTERS.find((item) => item.value === filter)?.emptyDescription ??
    "Không có thông báo phù hợp"
  )
}
