"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, ExternalLink, LayoutGrid } from "lucide-react"
import { CRITERIA, REVIEW_LEVELS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { ActivityItem } from "@/services/generated/api"

interface ActivityCardProps {
  activity: ActivityItem
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const handleParticipate = () => {
    if (activity.registrationUrl) {
      window.open(activity.registrationUrl, "_blank")
    }
  }

  return (
    <Card className="overflow-hidden border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl group">
      <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden">
        {activity.thumbnailUrl ? (
          <img
            src={activity.thumbnailUrl}
            alt={activity.slug || ""}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
            <Calendar className="h-12 w-12 text-slate-300" />
          </div>
        )}
        {activity.unitName && (
          <div className="absolute top-3 right-3">
            <Badge
              variant="secondary"
              className="bg-white/90 backdrop-blur-sm text-primary border-none shadow-sm"
            >
              {activity.unitName}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-5">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {activity.criteria?.map((c: string) => (
            <Badge
              key={c}
              variant="outline"
              className="text-[10px] uppercase tracking-wider py-0 px-2 font-bold border-primary/20 text-primary/80 bg-primary/5"
            >
              {CRITERIA[c as keyof typeof CRITERIA] || c}
            </Badge>
          ))}
          {activity.reviewLevel && (
            <Badge
              variant="secondary"
              className="text-[10px] uppercase tracking-wider py-0 px-2 font-bold bg-slate-100 text-slate-600 border-none"
            >
              {REVIEW_LEVELS[activity.reviewLevel as keyof typeof REVIEW_LEVELS] || activity.reviewLevel}
            </Badge>
          )}
        </div>

        <h3 className="font-bold text-lg mb-3 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
          {activity.title}
        </h3>

        <div className="text-sm text-slate-500 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center">
              <MapPin className="h-3 w-3" />
            </div>
            {activity?.location || "Toàn quốc"}
          </div>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center">
              <Calendar className="h-3 w-3" />
            </div>
            {activity.startDate && activity.endDate
              ? `${new Date(activity.startDate).toLocaleDateString("vi-VN")} - ${new Date(activity.endDate).toLocaleDateString("vi-VN")}`
              : "Chưa có ngày"}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0 flex gap-3">
        <Link href={`/activities/${activity.slug}`} className="flex-1">
          <Button
            variant="outline"
            size="sm"
            className="w-full rounded-xl border-slate-200 hover:bg-slate-50"
          >
            Chi tiết
          </Button>
        </Link>
        <Button
          size="sm"
          className="w-full gap-2 rounded-xl bg-primary hover:bg-primary/90 shadow-sm shadow-primary/20"
          onClick={handleParticipate}
        >
          Tham gia
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  )
}

interface ActivityGridProps {
  activities: ActivityItem[]
}

export function ActivityGrid({ activities }: ActivityGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {activities.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
    </div>
  )
}

interface EmptyStateProps {
  onClearFilters: () => void
}

export function EmptyState({ onClearFilters }: EmptyStateProps) {
  return (
    <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-300 flex w-full items-center justify-center flex-col gap-4">
      <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mb-2">
        <LayoutGrid className="h-8 w-8 text-slate-300" />
      </div>
      <p className="text-slate-500 font-medium">Không tìm thấy hoạt động nào phù hợp</p>
      <Button variant="link" onClick={onClearFilters}>
        Xóa tất cả bộ lọc
      </Button>
    </div>
  )
}

interface LoadingStateProps {
  isLoading: boolean
}

export function LoadingState({ isLoading }: LoadingStateProps) {
  if (!isLoading) return null

  return (
    <div className="flex items-center justify-center py-24">
      <div className="h-10 w-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
    </div>
  )
}

interface ErrorStateProps {
  hasError: boolean
}

export function ErrorState({ hasError }: ErrorStateProps) {
  if (!hasError) return null

  return (
    <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-300 flex w-full items-center justify-center flex-col gap-4">
      <p className="text-red-500 font-medium">Không thể tải hoạt động</p>
      <Button variant="link" onClick={() => window.location.reload()}>
        Thử lại
      </Button>
    </div>
  )
}