"use client"

import { useMemo } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Award,
  Building2,
  GraduationCap,
  Hash,
  Loader2,
  Medal,
  Trophy,
  User,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AwardLevelBadge } from "@/entities/award"
import {
  getSpecificBadges,
  summarizeScores,
} from "@/entities/badge"
import { RadarChart } from "@/shared/ui"
import {
  useGetLeaderboardDetail,
} from "@/services/generated/api"

import { StatCard } from "./components/stat-card"
import { BadgeCollection } from "./components/badge-collection"
import { AwardsList } from "./components/awards-list"

export function LeaderboardDetailClient({ studentId }: { studentId: string }) {
  const detailQuery = useGetLeaderboardDetail(studentId, {
    query: { retry: false, refetchOnWindowFocus: false },
  })
  const detail = detailQuery.data?.data

  const awardSummary = useMemo(() => {
    const stats = detail?.criteriaStats ?? []
    const levelOrder = ["NHAT", "NHI", "BA", "KHUYEN_KHICH", "NONE"]
    let highestLevel: string | null = null
    let totalAwardScore = 0
    let totalParticipationScore = 0

    for (const s of stats) {
      if (s.awardLevel && levelOrder.includes(s.awardLevel)) {
        const idx = levelOrder.indexOf(s.awardLevel)
        const currentIdx = highestLevel ? levelOrder.indexOf(highestLevel) : -1
        if (currentIdx === -1 || idx < currentIdx) {
          highestLevel = s.awardLevel
        }
      }
      totalAwardScore += s.awardScore ?? 0
      totalParticipationScore += s.participationScore ?? 0
    }

    return { highestLevel, totalAwardScore, totalParticipationScore }
  }, [detail?.criteriaStats])

  const unlockedBadges = useMemo(() => {
    if (!detail?.criteriaStats) return []
    const summary = summarizeScores(detail.criteriaStats)
    const list = [
      ...getSpecificBadges(summary),
    ].filter((b) => b.unlocked)

    const map = new Map<string, typeof list[number]>()
    for (const badge of list) {
      if (!map.has(badge.id)) {
        map.set(badge.id, badge)
      }
    }
    return Array.from(map.values())
  }, [detail?.criteriaStats])

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
                <Card>
                  <CardContent className="flex items-center gap-3 p-4 bg-white h-full">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Trophy className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground">Cấp giải cao nhất</div>
                      <div className="mt-1">
                        <AwardLevelBadge level={awardSummary.highestLevel} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6 border-t pt-6 space-y-3">
                <div className="text-sm font-semibold text-slate-500">Chi tiết điểm</div>
                <div className="grid gap-4 grid-cols-3">
                  <div className="bg-slate-50/50 rounded-xl p-4 flex flex-col justify-between border border-slate-100">
                    <span className="text-xs text-muted-foreground font-medium">Điểm tham gia</span>
                    <span className="text-2xl font-extrabold text-slate-700 mt-1">{awardSummary.totalParticipationScore}</span>
                  </div>
                  <div className="bg-slate-50/50 rounded-xl p-4 flex flex-col justify-between border border-slate-100">
                    <span className="text-xs text-muted-foreground font-medium">Điểm giải thưởng</span>
                    <span className="text-2xl font-extrabold text-yellow-600 mt-1">+{awardSummary.totalAwardScore}</span>
                  </div>
                  <div className="bg-primary/5 rounded-xl p-4 flex flex-col justify-between border border-primary/10">
                    <span className="text-xs text-primary/80 font-semibold">Tổng điểm</span>
                    <span className="text-2xl font-black text-primary mt-1">{detail.totalScore}</span>
                  </div>
                </div>
              </div>

              <BadgeCollection unlockedBadges={unlockedBadges} />
            </CardContent>
          </Card>

          <RadarChart stats={detail.criteriaStats} />
        </div>

        <AwardsList awards={detail.awards} />
      </div>
    </div>
  )
}
