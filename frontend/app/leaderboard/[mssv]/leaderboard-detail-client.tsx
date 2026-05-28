"use client"

import Link from "next/link"
import {
  ArrowLeft,
  Award,
  BookOpen,
  Building2,
  Dumbbell,
  Globe2,
  GraduationCap,
  Hash,
  HeartHandshake,
  Loader2,
  Medal,
  ShieldCheck,
  Trophy,
  User,
  type LucideIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LeaderboardCriteriaStatCriteria,
  useGetLeaderboardDetail,
  type LeaderboardCriteriaStat,
  type LeaderboardDetail,
} from "@/services/generated/api"

const criteriaMeta: Record<
  LeaderboardCriteriaStatCriteria,
  { label: string; icon: LucideIcon; className: string }
> = {
  DAO_DUC: {
    label: "Đạo đức tốt",
    icon: ShieldCheck,
    className: "bg-emerald-100 text-emerald-700",
  },
  HOC_TAP: {
    label: "Học tập tốt",
    icon: BookOpen,
    className: "bg-blue-100 text-blue-700",
  },
  THE_LUC: {
    label: "Thể lực tốt",
    icon: Dumbbell,
    className: "bg-rose-100 text-rose-700",
  },
  TINH_NGUYEN: {
    label: "Tình nguyện tốt",
    icon: HeartHandshake,
    className: "bg-amber-100 text-amber-700",
  },
  HOI_NHAP: {
    label: "Hội nhập tốt",
    icon: Globe2,
    className: "bg-violet-100 text-violet-700",
  },
}

const criteriaOrder = Object.keys(criteriaMeta) as LeaderboardCriteriaStatCriteria[]

function getStatMap(stats: LeaderboardCriteriaStat[] = []) {
  return new Map(stats.map((stat) => [stat.criteria, stat]))
}

function getDisplayStat(
  statMap: Map<LeaderboardCriteriaStatCriteria, LeaderboardCriteriaStat>,
  criteria: LeaderboardCriteriaStatCriteria,
) {
  return (
    statMap.get(criteria) ?? {
      criteria,
      label: criteriaMeta[criteria].label,
      approvedActivities: 0,
    }
  )
}

function getPoint(index: number, value: number, max: number, radius: number, center: number) {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / criteriaOrder.length
  const distance = (value / max) * radius

  return {
    x: center + Math.cos(angle) * distance,
    y: center + Math.sin(angle) * distance,
  }
}

function LeaderboardRadarChart({ detail }: { detail: LeaderboardDetail }) {
  const statMap = getStatMap(detail.criteriaStats)
  const values = criteriaOrder.map(
    (criteria) => getDisplayStat(statMap, criteria).approvedActivities,
  )
  const maxValue = Math.max(1, ...values)
  const center = 140
  const radius = 92
  const polygonPoints = values
    .map((value, index) => {
      const point = getPoint(index, value, maxValue, radius, center)
      return `${point.x},${point.y}`
    })
    .join(" ")

  return (
    <div className="aspect-square w-full max-w-md">
      <svg viewBox="0 0 280 280" role="img" aria-label="Biểu đồ radar 5 tiêu chí" className="h-full w-full">
        {[1, 0.66, 0.33].map((scale) => {
          const ring = criteriaOrder
            .map((_, index) => {
              const point = getPoint(index, maxValue * scale, maxValue, radius, center)
              return `${point.x},${point.y}`
            })
            .join(" ")

          return (
            <polygon
              key={scale}
              points={ring}
              fill="none"
              stroke="currentColor"
              strokeDasharray={scale === 1 ? "4 4" : undefined}
              className="text-slate-200"
            />
          )
        })}

        {criteriaOrder.map((criteria, index) => {
          const axis = getPoint(index, maxValue, maxValue, radius, center)
          const label = getPoint(index, maxValue, maxValue, radius + 26, center)

          return (
            <g key={criteria}>
              <line x1={center} y1={center} x2={axis.x} y2={axis.y} className="stroke-slate-200" />
              <text
                x={label.x}
                y={label.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-slate-500 text-[10px] font-medium"
              >
                {criteriaMeta[criteria].label}
              </text>
            </g>
          )
        })}

        <polygon
          points={polygonPoints}
          className="fill-primary/25 stroke-primary"
          strokeWidth={3}
          strokeLinejoin="round"
        />

        {values.map((value, index) => {
          const point = getPoint(index, value, maxValue, radius, center)

          return (
            <circle
              key={criteriaOrder[index]}
              cx={point.x}
              cy={point.y}
              r={5}
              className="fill-background stroke-primary"
              strokeWidth={3}
            />
          )
        })}

        <text x={center} y={center + 4} textAnchor="middle" className="fill-slate-400 text-xs">
          0
        </text>
      </svg>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string | number
  icon: LucideIcon
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="truncate text-xl font-bold">{value}</div>
        </div>
      </CardContent>
    </Card>
  )
}

export function LeaderboardDetailClient({ studentId }: { studentId: string }) {
  const detailQuery = useGetLeaderboardDetail(studentId, {
    query: { retry: false, refetchOnWindowFocus: false },
  })
  const detail = detailQuery.data?.data

  if (detailQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (detailQuery.isError || !detail) {
    return (
      <div className="min-h-screen py-12">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Không tìm thấy sinh viên</h1>
          <p className="mt-3 text-muted-foreground">
            Sinh viên này chưa có trong bảng xếp hạng hoặc MSSV không hợp lệ.
          </p>
          <Link href="/leaderboard" className="mt-6 inline-flex">
            <Button>
              <ArrowLeft className="h-4 w-4" />
              Quay lại bảng xếp hạng
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const statMap = getStatMap(detail.criteriaStats)

  return (
    <div className="min-h-screen bg-slate-50/50 py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/leaderboard" className="inline-flex">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Bảng xếp hạng
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <User className="h-10 w-10" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-3xl font-bold">{detail.userName}</h1>
                    <Badge className="gap-1">
                      <Trophy className="h-3.5 w-3.5" />
                      #{detail.rank}
                    </Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Hash className="h-4 w-4" />
                      {detail.studentId}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Building2 className="h-4 w-4" />
                      {detail.unitName || "Chưa có đơn vị"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <GraduationCap className="h-4 w-4" />
                      {detail.className || "Chưa có lớp"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <StatCard label="Thứ hạng" value={`#${detail.rank}`} icon={Medal} />
                <StatCard label="Hoạt động đã duyệt" value={detail.totalApproved} icon={Award} />
                <StatCard label="Tổng điểm" value={detail.totalScore} icon={Trophy} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Radar 5 tiêu chí</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <LeaderboardRadarChart detail={detail} />
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {criteriaOrder.map((criteria) => {
            const stat = getDisplayStat(statMap, criteria)
            const meta = criteriaMeta[criteria]
            const Icon = meta.icon

            return (
              <Card key={criteria}>
                <CardContent className="p-4">
                  <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${meta.className}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-sm font-semibold">{meta.label}</div>
                  <div className="mt-2 text-2xl font-bold">{stat.approvedActivities}</div>
                  <div className="text-xs text-muted-foreground">hoạt động đã duyệt</div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
