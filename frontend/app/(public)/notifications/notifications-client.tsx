"use client"

import { useState, useMemo } from "react"
import { useQueryClient, useInfiniteQuery } from "@tanstack/react-query"

import {
  NotificationList,
  type NotificationFilter,
} from "@/features/notifications/components/notification-list"
import {
  getListNotificationsQueryKey,
  listNotifications,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from "@/services/generated/api"
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll"

export function NotificationsClient() {
  const [filter, setFilter] = useState<NotificationFilter>("all")
  const queryClient = useQueryClient()

  const notificationsQuery = useInfiniteQuery({
    queryKey: [...getListNotificationsQueryKey(), "infinite"],
    queryFn: ({ pageParam }) =>
      listNotifications({
        page: pageParam as number,
        pageSize: 15,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const page = lastPage.meta?.page ?? 1
      const totalPages = lastPage.meta?.totalPages ?? 1
      return page < totalPages ? page + 1 : undefined
    },
    retry: false,
    refetchOnWindowFocus: false,
  })

  const notifications = useMemo(() => {
    return notificationsQuery.data?.pages.flatMap((page) => page.data ?? []) ?? []
  }, [notificationsQuery.data])

  const hasNextPage = notificationsQuery.hasNextPage
  const isFetchingNextPage = notificationsQuery.isFetchingNextPage

  const sentinelRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage: notificationsQuery.fetchNextPage,
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
          notifications={notifications}
          filter={filter}
          onFilterChange={setFilter}
          onMarkRead={(id) => markReadMutation.mutate({ id })}
          onMarkAllRead={() => markAllReadMutation.mutate()}
          onRetry={() => notificationsQuery.refetch()}
          isLoading={notificationsQuery.isLoading}
          isError={notificationsQuery.isError}
          isMarkingRead={markReadMutation.isPending}
          isMarkingAllRead={markAllReadMutation.isPending}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          sentinelRef={sentinelRef}
        />
      </div>
    </div>
  )
}
