"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, User, Eye, Trophy, Medal, Award } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AwardStatsBadge } from "./AwardStatsBadge"
import { AwardBadge } from "./AwardBadge"
import { cn } from "@/lib/utils"
import { CRITERIA, REVIEW_LEVELS } from "@/lib/constants"
import { type AwardActivityOverview } from "@/services/generated/api"

interface ActivityAwardsTableProps {
  activities: AwardActivityOverview[]
  onViewDetail: (activity: AwardActivityOverview) => void
}

const reviewLevelStyles: Record<string, { border: string; bg: string; text: string }> = {
  TRUONG: { border: "border-l-blue-500", bg: "bg-blue-50/50", text: "text-blue-700 border-blue-200 bg-blue-50/50" },
  DHQGHN: { border: "border-l-purple-500", bg: "bg-purple-50/50", text: "text-purple-700 border-purple-200 bg-purple-50/50" },
  THANH_PHO: { border: "border-l-indigo-500", bg: "bg-indigo-50/50", text: "text-indigo-700 border-indigo-200 bg-indigo-50/50" },
  TRUNG_UONG: { border: "border-l-amber-500", bg: "bg-amber-50/50", text: "text-amber-700 border-amber-200 bg-amber-50/50" },
}

export function ActivityAwardsTable({
  activities,
  onViewDetail,
}: ActivityAwardsTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (activities.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-10 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
          <Award className="h-8 w-8 text-muted-foreground/50 stroke-[1.5]" />
          <p className="text-sm font-medium">Không có hoạt động nào phù hợp với bộ lọc</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        const isExpanded = expandedId === activity.activityId
        const stats = activity.awardStats
        const levelStyle = activity.reviewLevel ? reviewLevelStyles[activity.reviewLevel] : null

        return (
          <Card
            key={activity.activityId}
            className={cn(
              "overflow-hidden transition-all duration-300",
              isExpanded && "ring-1 ring-primary/10",
            )}
          >
            {/* Header / Clickable area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-full hover:bg-muted"
                  onClick={() => setExpandedId(isExpanded ? null : (activity.activityId ?? null))}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform" />
                  )}
                </Button>

                <div
                  className="min-w-0 flex-1 cursor-pointer space-y-1.5"
                  onClick={() => setExpandedId(isExpanded ? null : (activity.activityId ?? null))}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-foreground hover:text-primary transition-colors leading-snug">
                      {activity.activityTitle}
                    </h3>
                    {activity.reviewLevel && (
                      <Badge
                        variant="outline"
                        className={cn("text-xs font-semibold px-2 py-0.5", levelStyle?.text)}
                      >
                        {REVIEW_LEVELS[activity.reviewLevel as keyof typeof REVIEW_LEVELS] ?? activity.reviewLevel}
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 bg-muted/65 px-2 py-0.5 rounded-md font-medium text-slate-600">
                      <User className="h-3.5 w-3.5" />
                      {activity.totalStudents} sinh viên
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {(activity.criteria ?? []).map((c) => (
                        <Badge key={c} variant="outline" className="text-[10px] bg-slate-50/50 font-normal px-2 py-0 border-slate-200">
                          {CRITERIA[c as keyof typeof CRITERIA] ?? c}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pl-11 md:pl-0">
                <AwardStatsBadge stats={stats} />
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 font-medium hover:bg-primary hover:text-primary-foreground border-slate-200"
                  onClick={() => onViewDetail(activity)}
                >
                  <Eye className="h-4 w-4" />
                  Chi tiết
                </Button>
              </div>
            </div>

            {/* Expanded section */}
            {isExpanded && (
              <div className="border-t bg-slate-50/40 p-5 space-y-5">
                {/* Stats cards grid */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Tổng quan giải thưởng
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {[
                      { label: "Nhất", count: stats?.NHAT, icon: Trophy, bg: "bg-amber-50 border-amber-200", text: "text-amber-800" },
                      { label: "Nhì", count: stats?.NHI, icon: Medal, bg: "bg-slate-50 border-slate-200", text: "text-slate-800" },
                      { label: "Ba", count: stats?.BA, icon: Medal, bg: "bg-orange-50 border-orange-200", text: "text-orange-800" },
                      { label: "Khuyến khích", count: stats?.KHUYEN_KHICH, icon: Award, bg: "bg-green-50 border-green-200", text: "text-green-800" },
                      { label: "Không giải", count: stats?.NONE, icon: User, bg: "bg-gray-50 border-gray-200", text: "text-gray-600" },
                    ].map((item) => {
                      const Icon = item.icon
                      const count = item.count ?? 0
                      return (
                        <div
                          key={item.label}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl border bg-white transition-all duration-200",
                            count === 0 && "opacity-45 hover:shadow-sm"
                          )}
                        >
                          <div className={cn("p-2 rounded-lg", count > 0 ? item.bg : "bg-slate-100")}>
                            <Icon className={cn("h-4 w-4", count > 0 ? item.text : "text-slate-400")} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{item.label}</div>
                            <div className="text-lg font-extrabold text-foreground mt-0.5">{count}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Students list */}
                {activity.students && activity.students.length > 0 ? (
                  <div className="space-y-2.5">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Danh sách sinh viên nộp minh chứng ({activity.students.length})
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {activity.students.map((student) => {
                        const topLevel = student.evidences?.find(
                          (ev) => ev.awardLevel && ev.awardLevel !== "NONE"
                        )
                        const awardLevel = topLevel?.awardLevel ?? "NONE"

                        return (
                          <div
                            key={student.userId}
                            className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/80 hover:border-primary/30 transition-all duration-200"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="h-8 w-8 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center text-primary text-xs shrink-0 font-bold">
                                {student.userFullName ? student.userFullName.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                              </div>
                              <div className="min-w-0 space-y-0.5">
                                <div className="text-xs font-bold text-foreground truncate">
                                  {student.userFullName || "Sinh viên"}
                                </div>
                                <div className="text-[10px] font-medium text-slate-500 truncate flex items-center gap-1.5">
                                  <span>{student.userStudentId || "—"}</span>
                                  {student.className && (
                                    <>
                                      <span className="text-slate-300">•</span>
                                      <span>{student.className}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="shrink-0 pl-2">
                              <AwardBadge level={awardLevel} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground text-center py-4 bg-white rounded-xl border border-slate-200/60 border-dashed">
                    Chưa có sinh viên nào trong danh sách
                  </div>
                )}
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}
