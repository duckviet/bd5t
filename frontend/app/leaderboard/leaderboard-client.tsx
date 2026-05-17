"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Search,
  Trophy,
  Medal,
  User,
  Building2,
  TrendingUp
} from "lucide-react"
import { useListLeaderboard, type LeaderboardItem } from "@/services/generated/api"
import { cn } from "@/lib/utils"

export function LeaderboardClient() {
  const [searchQuery, setSearchQuery] = useState("")
  const { data, isLoading, error } = useListLeaderboard({ pageSize: 100 })
  const leaderboard: LeaderboardItem[] = data?.data || []

  const filteredLeaderboard = leaderboard.filter(
    (user) =>
      (user.userName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.unitName || "").toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />
    return <span className="text-sm font-medium text-muted-foreground">{rank}</span>
  }

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-[rgb(255,248,220)] border-[rgb(255,204,0)] text-[rgb(146,100,0)]"
      case 2:
        return "bg-[rgb(242,242,242)] border-[rgb(192,192,192)] text-[rgb(90,90,90)]"
      case 3:
        return "bg-[rgb(250,235,215)] border-[rgb(205,127,50)] text-[rgb(120,70,20)]"
      default:
        return "bg-[rgb(255,255,255)] border-[rgb(220,220,220)] text-[rgb(55,65,81)]"
    }
  }
  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Bảng xếp hạng</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Top sinh viên tích cực nhất trong hành trình chinh phục danh hiệu Sinh viên 5 Tốt
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[1, 0, 2].map((idx) => {
            const user = leaderboard[idx]
            if (!user) return null
            return (
              <Card
                key={user.userId || user.rank}
                className={cn("text-center",
                  getRankBg(user.rank || idx + 1),
                   idx === 0 ? "md:-mt-6" : "",
                  idx === 1 ? "md:-mt-3" : ""
            )}
              >
                <CardContent className="p-6">
                  <div className="mb-4">
                    {getRankIcon(user.rank || idx + 1)}
                  </div>
                  <div className="h-16 w-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-3">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{user.userName || "N/A"}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{user.unitName || "Chưa có đơn vị"}</p>
                  <Badge variant="default" className="gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {user.totalApproved || 0} hoạt động
                  </Badge>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card>
          <CardHeader>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm sinh viên..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && <div className="text-sm text-muted-foreground">Đang tải bảng xếp hạng...</div>}
            {!isLoading && error && (
              <div className="text-sm text-destructive">Không thể tải bảng xếp hạng.</div>
            )}
            {!isLoading && !error && filteredLeaderboard.length === 0 && (
              <div className="text-sm text-muted-foreground">Không có dữ liệu phù hợp.</div>
            )}
            <div className="space-y-2">
              {!isLoading && !error && filteredLeaderboard.map((user, idx) => (
                <div
                  key={user.userId || `${user.rank}-${idx}`}
                  className={`flex items-center gap-4 p-4 rounded-xl ${
                    getRankBg(user.rank || idx + 1) || "bg-muted/30 hover:bg-muted/50"
                  } transition-colors`}
                >
                  <div className="w-10 flex justify-center">
                    {getRankIcon(user.rank || idx + 1)}
                  </div>
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{user.userName || "N/A"}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {user.unitName || "Chưa có đơn vị"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary">{user.totalApproved || 0}</div>
                    <div className="text-xs text-muted-foreground">hoạt động</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
