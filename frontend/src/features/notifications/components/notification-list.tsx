"use client"

import Link from "next/link"
import {
  AlertCircle,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Lightbulb,
  RefreshCw,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState, ErrorState } from "@/components/common/empty-state"
import { LoadingSkeleton } from "@/components/common/loading"
import { CRITERIA, type CriterionType } from "@/lib/constants"
import type { NotificationItem } from "@/services/generated/api"

type NotificationFilter = "all" | "unread"

interface NotificationListProps {
  notifications: NotificationItem[]
  filter: NotificationFilter
  onFilterChange: (filter: NotificationFilter) => void
  onMarkRead: (id: string) => void
  onMarkAllRead: () => void
  onRetry: () => void
  isLoading?: boolean
  isError?: boolean
  isMarkingRead?: boolean
  isMarkingAllRead?: boolean
}

function getDataString(notification: NotificationItem, key: string): string | undefined {
  const value = notification.data?.[key]
  return typeof value === "string" ? value : undefined
}

function getDaysRemaining(endDate: string): number {
  const end = new Date(endDate)
  const now = new Date()
  const diff = end.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "ACTIVITY_NEW":
      return Bell
    case "DEADLINE":
      return Clock
    case "SUGGESTION":
      return Lightbulb
    default:
      return AlertCircle
  }
}

function getNotificationColor(type: string) {
  switch (type) {
    case "ACTIVITY_NEW":
      return "bg-primary/10 text-primary"
    case "DEADLINE":
      return "bg-orange-100 text-orange-600"
    case "SUGGESTION":
      return "bg-green-100 text-green-600"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function isCriterionType(value: string | undefined): value is CriterionType {
  return Boolean(value && value in CRITERIA)
}

export function NotificationList({
  notifications,
  filter,
  onFilterChange,
  onMarkRead,
  onMarkAllRead,
  onRetry,
  isLoading = false,
  isError = false,
  isMarkingRead = false,
  isMarkingAllRead = false,
}: NotificationListProps) {
  const unreadCount = notifications.filter((notification) => !notification.isRead).length
  const filteredNotifications = notifications.filter(
    (notification) => filter === "all" || !notification.isRead,
  )

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <LoadingSkeleton className="h-10 w-10 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  <LoadingSkeleton className="h-5 w-2/3" />
                  <LoadingSkeleton className="h-4 w-full" />
                  <LoadingSkeleton className="h-4 w-1/2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <Card>
        <CardContent>
          <ErrorState
            title="Không thể tải thông báo"
            message="Vui lòng thử lại sau"
            onRetry={onRetry}
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Thông báo</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : "Không có thông báo mới"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onMarkAllRead}
            disabled={isMarkingAllRead}
          >
            {isMarkingAllRead && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
            Đánh dấu đã đọc
          </Button>
        )}
      </div>

      <div className="mb-6 flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange("all")}
        >
          Tất cả
        </Button>
        <Button
          variant={filter === "unread" ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange("unread")}
        >
          Chưa đọc
        </Button>
      </div>

      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent>
              <EmptyState
                title="Không có thông báo nào"
                description={
                  filter === "unread"
                    ? "Tất cả thông báo đã được đọc"
                    : "Thông báo mới sẽ xuất hiện tại đây"
                }
              />
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type)
            const criterion = getDataString(notification, "criteria")
            const endAt = getDataString(notification, "endAt")
            const activitySlug = getDataString(notification, "activitySlug")
            const daysRemaining = endAt ? getDaysRemaining(endAt) : null
            const isUrgent =
              typeof daysRemaining === "number" && daysRemaining > 0 && daysRemaining <= 7

            return (
              <Card
                key={notification.id}
                className={`transition-all ${!notification.isRead ? "border-primary/50" : ""}`}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${getNotificationColor(notification.type)}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3
                            className={`font-semibold ${
                              !notification.isRead ? "text-foreground" : "text-muted-foreground"
                            }`}
                          >
                            {notification.title}
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                        )}
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {isCriterionType(criterion) && (
                          <Badge variant="outline" className="text-xs">
                            {CRITERIA[criterion]}
                          </Badge>
                        )}
                        {isUrgent && (
                          <Badge
                            variant="secondary"
                            className="bg-orange-100 text-xs text-orange-700"
                          >
                            <Clock className="mr-1 h-3 w-3" />
                            Còn {daysRemaining} ngày
                          </Badge>
                        )}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(notification.createdAt).toLocaleDateString("vi-VN")}
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {activitySlug && (
                          <Link href={`/activities/${activitySlug}`}>
                            <Button variant="outline" size="sm" className="gap-1">
                              Xem hoạt động
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </Link>
                        )}
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onMarkRead(notification.id)}
                            disabled={isMarkingRead}
                          >
                            <CheckCircle2 className="mr-1 h-4 w-4" />
                            Đánh dấu đã đọc
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </>
  )
}
