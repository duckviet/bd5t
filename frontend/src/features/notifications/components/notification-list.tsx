"use client"

import { RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState, ErrorState } from "@/components/common/empty-state"
import { LoadingSkeleton } from "@/components/common/loading"
import type { NotificationItem } from "@/services/generated/api"

import { NotificationCard } from "./notification-card"
import {
  getNotificationFilterDescription,
  matchesNotificationFilter,
  type NotificationFilter,
} from "./notification-filters"
import { NotificationTabs } from "./notification-tabs"

export type { NotificationFilter } from "./notification-filters"

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
  const filteredNotifications = notifications.filter((notification) =>
    matchesNotificationFilter(notification, filter),
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

      <NotificationTabs
        notifications={notifications}
        activeFilter={filter}
        onFilterChange={onFilterChange}
      />

      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent>
              <EmptyState
                title="Không có thông báo nào"
                description={getNotificationFilterDescription(filter)}
              />
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkRead={onMarkRead}
              isMarkingRead={isMarkingRead}
            />
          ))
        )}
      </div>
    </>
  )
}
