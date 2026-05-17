"use client"

import Link from "next/link"
import { Calendar, CheckCircle2, Clock, ExternalLink } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CRITERIA, type CriterionType } from "@/lib/constants"
import type { NotificationItem } from "@/services/generated/api"

import { getNotificationTypeConfig } from "./notification-filters"

interface NotificationCardProps {
  notification: NotificationItem
  onMarkRead: (id: string) => void
  isMarkingRead?: boolean
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

function isCriterionType(value: string | undefined): value is CriterionType {
  return Boolean(value && value in CRITERIA)
}

export function NotificationCard({
  notification,
  onMarkRead,
  isMarkingRead = false,
}: NotificationCardProps) {
  const { icon: Icon, colorClassName } = getNotificationTypeConfig(notification.type)
  const criterion = getDataString(notification, "criteria")
  const endAt = getDataString(notification, "endAt")
  const activitySlug = getDataString(notification, "activitySlug")
  const daysRemaining = endAt ? getDaysRemaining(endAt) : null
  const isUrgent = typeof daysRemaining === "number" && daysRemaining > 0 && daysRemaining <= 7

  return (
    <Card className={`transition-all ${!notification.isRead ? "border-primary/50" : ""}`}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${colorClassName}`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3
                  className={`font-semibold ${
                    !notification.isRead ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {notification.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
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
                <Badge variant="secondary" className="bg-orange-100 text-xs text-orange-700">
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
}
