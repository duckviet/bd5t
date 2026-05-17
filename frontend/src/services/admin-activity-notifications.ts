import { useMutation } from "@tanstack/react-query"

import { customInstance } from "@/services/axios/custom-instance"

export interface ActivityNotificationResult {
  created: number
  skipped: number
  matchedUsers: number
}

interface ApiResponse<T> {
  success?: boolean
  data?: T
}

export function notifyActivity(id: string) {
  return customInstance<ApiResponse<ActivityNotificationResult>>({
    url: `/admin/activities/${id}/notifications`,
    method: "POST",
  })
}

export function notifyActivitiesBulk(activityIds: string[], type = "ACTIVITY_NEW") {
  return customInstance<ApiResponse<ActivityNotificationResult>>({
    url: "/admin/activities/notifications/bulk",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: { activityIds, type },
  })
}

export function notifyDeadlineSoon(days: 3 | 7) {
  return customInstance<ApiResponse<ActivityNotificationResult>>({
    url: "/admin/activities/notifications/deadline-soon",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: { days },
  })
}

export function useNotifyActivity() {
  return useMutation({
    mutationKey: ["notifyActivity"],
    mutationFn: ({ id }: { id: string }) => notifyActivity(id),
  })
}

export function useNotifyActivitiesBulk() {
  return useMutation({
    mutationKey: ["notifyActivitiesBulk"],
    mutationFn: ({ activityIds, type }: { activityIds: string[]; type?: string }) =>
      notifyActivitiesBulk(activityIds, type),
  })
}

export function useNotifyDeadlineSoon() {
  return useMutation({
    mutationKey: ["notifyDeadlineSoon"],
    mutationFn: ({ days }: { days: 3 | 7 }) => notifyDeadlineSoon(days),
  })
}
