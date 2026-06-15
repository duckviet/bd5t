"use client"

import { useState } from "react"
import {
  BookOpen,
  Dumbbell,
  Globe2,
  HeartHandshake,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface RadarChartStat {
  criteria?: string
  label?: string
  score?: number
  maxScore?: number
  participationScore?: number
  awardScore?: number
  approvedActivities?: number
  approvedActivityCount?: number
}

interface RadarChartProps {
  stats: RadarChartStat[]
  title?: string
}

const criteriaMeta: Record<
  string,
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

const criteriaOrder = Object.keys(criteriaMeta)

function getStatMap(stats: RadarChartStat[] = []) {
  return new Map(
    stats
      .filter((s): s is RadarChartStat & { criteria: string } => !!s.criteria)
      .map((stat) => [stat.criteria, stat]),
  )
}

function getDisplayStat(
  statMap: Map<string, RadarChartStat>,
  criteria: string,
) {
  return (
    statMap.get(criteria) ?? {
      criteria,
      label: criteriaMeta[criteria]?.label ?? criteria,
      approvedActivities: 0,
      score: 0,
      maxScore: 200,
      participationScore: 0,
      awardScore: 0,
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

interface GeneralBadge {
  name: string
  rank: string
  range: string
  gradient: string
}

const getGeneralBadge = (score: number): GeneralBadge => {
  if (score >= 850) {
    return { name: "Huyền thoại 5 Tốt", rank: "S", range: "850 - 1000", gradient: "from-purple-500 via-fuchsia-500 to-pink-500 text-white" }
  }
  if (score >= 800) {
    return { name: "Ngôi sao 5 Tốt", rank: "A+", range: "800 - 845", gradient: "from-amber-400 to-yellow-500 text-white" }
  }
  if (score >= 750) {
    return { name: "Chiến binh 5 Tốt", rank: "A", range: "750 - 795", gradient: "from-orange-400 to-red-500 text-white" }
  }
  if (score >= 650) {
    return { name: "Người chinh phục 5 Tốt", rank: "B", range: "650 - 745", gradient: "from-sky-400 to-blue-500 text-white" }
  }
  return { name: "Tân binh 5 Tốt", rank: "C", range: "0 - 645", gradient: "from-emerald-400 to-teal-500 text-white" }
}

export function RadarChart({ stats, title = "Radar 5 tiêu chí" }: RadarChartProps) {
  const [hoveredCriteria, setHoveredCriteria] = useState<string | null>(null)
  const statMap = getStatMap(stats)
  
  const values = criteriaOrder.map(
    (criteria) => getDisplayStat(statMap, criteria).score ?? 0,
  )
  const totalScore = values.reduce((sum, score) => sum + score, 0)
  const badge = getGeneralBadge(totalScore)

  const maxValue = 200
  const center = 140
  const radius = 92
  const polygonPoints = values
    .map((value, index) => {
      const point = getPoint(index, value, maxValue, radius, center)
      return `${point.x},${point.y}`
    })
    .join(" ")

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="relative aspect-square w-full max-w-[320px]">
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
              const stat = getDisplayStat(statMap, criteria)
              const score = stat.score ?? 0
              const axis = getPoint(index, maxValue, maxValue, radius, center)
              const label = getPoint(index, maxValue, maxValue, radius + 26, center)

              return (
                <g
                  key={criteria}
                  className="cursor-pointer group"
                  onMouseEnter={() => setHoveredCriteria(criteria)}
                  onMouseLeave={() => setHoveredCriteria(null)}
                >
                  <line x1={center} y1={center} x2={axis.x} y2={axis.y} className="stroke-slate-200 group-hover:stroke-primary group-hover:stroke-2 transition-all" />
                  <text
                    x={label.x}
                    y={label.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-slate-500 text-[10px] font-semibold transition-colors"
                  >
                    <tspan x={label.x} dy="-5">{criteriaMeta[criteria]?.label ?? criteria}</tspan>
                    <tspan x={label.x} dy="13" className="fill-slate-700 font-extrabold text-[11px] group-hover:fill-primary">{score}đ</tspan>
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
              const criteria = criteriaOrder[index]
              const point = getPoint(index, value, maxValue, radius, center)

              return (
                <circle
                  key={criteria}
                  cx={point.x}
                  cy={point.y}
                  r={hoveredCriteria === criteria ? 7 : 5}
                  className="fill-background stroke-primary cursor-pointer transition-all duration-200"
                  strokeWidth={hoveredCriteria === criteria ? 4 : 3}
                  onMouseEnter={() => setHoveredCriteria(criteria)}
                  onMouseLeave={() => setHoveredCriteria(null)}
                />
              )
            })}

            <text x={center} y={center + 4} textAnchor="middle" className="fill-slate-400 text-xs">
              0
            </text>
          </svg>

          {/* Hover Popup Card */}
          {hoveredCriteria && (() => {
            const stat = getDisplayStat(statMap, hoveredCriteria)
            const meta = criteriaMeta[hoveredCriteria]
            if (!meta) return null
            const Icon = meta.icon
            const approvedCount = stat.approvedActivities ?? stat.approvedActivityCount ?? 0

            return (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-48 bg-white border border-slate-100 rounded-xl shadow-xl p-3 space-y-2 pointer-events-none transition-all duration-200 animate-in fade-in zoom-in-95">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${meta.className}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-slate-800 leading-tight truncate">{meta.label}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{approvedCount} hoạt động</div>
                  </div>
                </div>
                <div className="h-px bg-slate-100" />
                <div className="space-y-1 text-[10px]">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tham gia:</span>
                    <span className="font-semibold text-slate-700">{stat.participationScore ?? 0}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Giải thưởng:</span>
                    <span className="font-semibold text-slate-700">+{stat.awardScore ?? 0}</span>
                  </div>
                  <div className="h-px bg-slate-50" />
                  <div className="flex justify-between font-bold text-slate-800 text-xs">
                    <span>Tổng:</span>
                    <span className="text-primary">{stat.score ?? 0}đ</span>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>

        {/* General Badge Ranking display under Radar Chart */}
        <div className="w-full border-t border-slate-100 pt-4 mt-4 space-y-3">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-500 px-1">
            <span>Danh hiệu & Xếp hạng</span>
            <span className="font-bold text-primary bg-primary/5 px-2.5 py-0.5 rounded-full">{totalScore} điểm</span>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-50/50 border border-slate-100/50 rounded-2xl p-3 hover:bg-slate-50 transition-colors">
            <div className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-black text-base shadow-sm bg-gradient-to-br",
              badge.gradient
            )}>
              {badge.rank}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-sm text-slate-800 leading-tight">
                {badge.name}
              </div>
              <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1.5 font-medium">
                <span>Yêu cầu: {badge.range}đ</span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span>Hạng {badge.rank}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
