"use client"

import { Button } from "@/components/ui/button"
import type { NotificationItem } from "@/services/generated/api"

import {
  matchesNotificationFilter,
  NOTIFICATION_FILTERS,
  type NotificationFilter,
} from "./notification-filters"

interface NotificationTabsProps {
  notifications: NotificationItem[]
  activeFilter: NotificationFilter
  onFilterChange: (filter: NotificationFilter) => void
}

export function NotificationTabs({
  notifications,
  activeFilter,
  onFilterChange,
}: NotificationTabsProps) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {NOTIFICATION_FILTERS.map((filter) => {
        const count = notifications.filter((notification) =>
          matchesNotificationFilter(notification, filter.value),
        ).length
        const isActive = activeFilter === filter.value

        return (
          <Button
            key={filter.value}
            type="button"
            variant={isActive ? "default" : "outline"}
            size="sm"
            className="gap-2"
            aria-pressed={isActive}
            onClick={() => onFilterChange(filter.value)}
          >
            <span>{filter.label}</span>
            <span
              className={`inline-flex min-w-5 items-center justify-center rounded-full border px-1.5 py-0 text-[11px] font-semibold ${
                isActive
                  ? "border-transparent bg-secondary text-secondary-foreground"
                  : "border-input text-muted-foreground"
              }`}
            >
              {count}
            </span>
          </Button>
        )
      })}
    </div>
  )
}
