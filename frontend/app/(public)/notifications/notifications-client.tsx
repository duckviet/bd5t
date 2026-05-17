"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"

import {
  NotificationList,
  type NotificationFilter,
} from "@/features/notifications/components/notification-list"
import {
  getListNotificationsQueryKey,
  useListNotifications,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from "@/services/generated/api"

export function NotificationsClient() {
  const [filter, setFilter] = useState<NotificationFilter>("all")
  const queryClient = useQueryClient()

  const notificationsQuery = useListNotifications({
    query: { retry: false, refetchOnWindowFocus: false },
  })
  const invalidateNotifications = () =>
    queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() })
  const markReadMutation = useMarkNotificationRead({
    mutation: { onSuccess: invalidateNotifications },
  })
  const markAllReadMutation = useMarkAllNotificationsRead({
    mutation: { onSuccess: invalidateNotifications },
  })

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <NotificationList
          notifications={notificationsQuery.data?.data ?? []}
          filter={filter}
          onFilterChange={setFilter}
          onMarkRead={(id) => markReadMutation.mutate({ id })}
          onMarkAllRead={() => markAllReadMutation.mutate()}
          onRetry={() => notificationsQuery.refetch()}
          isLoading={notificationsQuery.isLoading}
          isError={notificationsQuery.isError}
          isMarkingRead={markReadMutation.isPending}
          isMarkingAllRead={markAllReadMutation.isPending}
        />
      </div>
    </div>
  )
}
