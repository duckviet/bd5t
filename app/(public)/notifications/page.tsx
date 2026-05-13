"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Bell, 
  Calendar, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ExternalLink
} from "lucide-react"
import { CRITERIA, type CriterionType } from "@/lib/constants"
import Link from "next/link"

const mockNotifications = [
  {
    id: "noti_1",
    title: "Cuộc thi Lý tưởng Sinh viên 2026",
    message: "Có hoạt động mới thuộc tiêu chí Đạo đức tốt",
    type: "ACTIVITY_NEW",
    isRead: false,
    activityId: "act_1",
    activitySlug: "cuoc-thi-ly-tuong-sinh-vien-2026",
    criteria: "DAO_DUC" as CriterionType,
    endAt: "2026-06-20",
    createdAt: "2026-05-10",
  },
  {
    id: "noti_2",
    title: "Sắp hết hạn đăng ký",
    message: "Còn 5 ngày để đăng ký Cuộc thi Thắp lửa Khởi nghiệp",
    type: "DEADLINE",
    isRead: false,
    activityId: "act_2",
    activitySlug: "cuoc-thi-thap-lua-khoi-nghiep",
    endAt: "2026-05-15",
    createdAt: "2026-05-10",
  },
  {
    id: "noti_3",
    title: "Gợi ý hoạt động",
    message: "Bạn chưa hoàn thành tiêu chí Thể lực tốt cấp Trường. Tham gia Giải chạy Bước chân Sinh viên để bù đắp!",
    type: "SUGGESTION",
    isRead: true,
    activityId: "act_3",
    activitySlug: "giai-chay-buoc-chan-sinh-vien",
    criteria: "THE_LUC",
    endAt: "2026-04-25",
    createdAt: "2026-05-08",
  },
  {
    id: "noti_4",
    title: "Hoạt động mới",
    message: "Chương trình Tàu Thanh niên Đông Nam Á - Nhật Bản lần thứ 50 vừa được thêm",
    type: "ACTIVITY_NEW",
    isRead: true,
    activityId: "act_5",
    activitySlug: "tau-thanh-nien-asean-nhat-ban-50",
    criteria: "HOI_NHAP",
    endAt: "2026-08-10",
    createdAt: "2026-05-05",
  },
]

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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications)
  const [filter, setFilter] = useState<"all" | "unread">("all")

  const filteredNotifications = notifications.filter(
    (n) => filter === "all" || (filter === "unread" && !n.isRead)
  )

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Thông báo</h1>
            <p className="text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : "Không có thông báo mới"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Đánh dấu đã đọc
            </Button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            Tất cả
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("unread")}
          >
            Chưa đọc
          </Button>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Không có thông báo nào
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type)
              const daysRemaining = getDaysRemaining(notification.endAt)
              const isUrgent = daysRemaining > 0 && daysRemaining <= 7

              return (
                <Card 
                  key={notification.id}
                  className={`transition-all ${!notification.isRead ? "border-primary/50" : ""}`}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className={`font-semibold ${!notification.isRead ? "text-foreground" : "text-muted-foreground"}`}>
                              {notification.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                          </div>
                          {!notification.isRead && (
                            <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          {notification.criteria && (
                            <Badge variant="outline" className="text-xs">
                              {CRITERIA[notification.criteria as CriterionType]}
                            </Badge>
                          )}
                          {isUrgent && (
                            <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                              <Clock className="h-3 w-3 mr-1" />
                              Còn {daysRemaining} ngày
                            </Badge>
                          )}
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(notification.createdAt).toLocaleDateString("vi-VN")}
                          </div>
                        </div>

                        <div className="flex gap-2 mt-3">
                          <Link href={`/activities/${notification.activitySlug}`}>
                            <Button variant="outline" size="sm" className="gap-1">
                              Xem hoạt động
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </Link>
                          {!notification.isRead && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
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
      </div>
    </div>
  )
}