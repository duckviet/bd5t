"use client"

import Link from "next/link"
import { useState, useMemo } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Search,
  Trophy,
  Medal,
  User,
  Hash,
  Building2,
  TrendingUp,
  Loader2
} from "lucide-react"
import { listLeaderboard, getListLeaderboardQueryKey, type LeaderboardItem } from "@/services/generated/api"
import { cn } from "@/lib/utils"
import { useDebounce } from "@/hooks/use-debounce"
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll"

export function LeaderboardClient() {
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 500)

  const leaderboardQuery = useInfiniteQuery({
    queryKey: getListLeaderboardQueryKey({
      search: debouncedSearch.trim() || undefined,
    }),
    queryFn: ({ pageParam }) =>
      listLeaderboard({
        page: pageParam as number,
        pageSize: 15,
        search: debouncedSearch.trim() || undefined,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const page = lastPage.meta?.page ?? 1
      const totalPages = lastPage.meta?.totalPages ?? 1
      return page < totalPages ? page + 1 : undefined
    },
  })

  const leaderboard = useMemo(() => {
    return leaderboardQuery.data?.pages.flatMap((page) => page.data ?? []) ?? []
  }, [leaderboardQuery.data])

  const isLoading = leaderboardQuery.isLoading
  const error = leaderboardQuery.error
  const hasNextPage = leaderboardQuery.hasNextPage
  const isFetchingNextPage = leaderboardQuery.isFetchingNextPage

  const sentinelRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage: leaderboardQuery.fetchNextPage,
  })

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

  const getStudentHref = (studentId?: string) =>
    studentId ? `/leaderboard/${encodeURIComponent(studentId)}` : undefined

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Bảng xếp hạng</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Top sinh viên tích cực nhất trong hành trình chinh phục danh hiệu Sinh viên 5 Tốt
          </p>
        </div>

        {/* Top 3 absolute rankings - only show when not searching and we have at least 3 users */}
        {!debouncedSearch.trim() && leaderboard.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[1, 0, 2].map((idx) => {
              const user = leaderboard[idx]
              if (!user) return null
              const href = getStudentHref(user.studentId)
              const card = (
                <Card
                  className={cn("h-full text-center transition-all hover:-translate-y-1 hover:shadow-xl",
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
                    <p className="text-sm text-muted-foreground mb-1">{user.unitName || "Chưa có đơn vị"}</p>
                    <p className="mb-3 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <Hash className="h-3 w-3" />
                      {user.studentId || "Chưa có MSSV"}
                    </p>
                    <Badge variant="default" className="gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {user.totalApproved || 0} hoạt động
                    </Badge>
                  </CardContent>
                </Card>
              )

              return (
                href ? (
                  <Link key={user.userId || user.rank} href={href} className="block h-full">
                    {card}
                  </Link>
                ) : (
                  <div key={user.userId || user.rank}>{card}</div>
                )
              )
            })}
          </div>
        )}

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
            {isLoading && (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
            {!isLoading && error && (
              <div className="text-sm text-destructive text-center py-6">Không thể tải bảng xếp hạng.</div>
            )}
            {!isLoading && !error && leaderboard.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-6">Không có dữ liệu phù hợp.</div>
            )}
            <div className="space-y-2">
              {!isLoading && !error && leaderboard.map((user, idx) => {
                const href = getStudentHref(user.studentId)
                const row = (
                  <div
                    className={`flex items-center gap-4 rounded-xl p-4 ${
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
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {user.unitName || "Chưa có đơn vị"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          {user.studentId || "Chưa có MSSV"}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">{user.totalApproved || 0}</div>
                      <div className="text-xs text-muted-foreground">hoạt động</div>
                    </div>
                  </div>
                )

                return href ? (
                  <Link
                    key={user.userId || `${user.rank}-${idx}`}
                    href={href}
                    className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {row}
                  </Link>
                ) : (
                  <div key={user.userId || `${user.rank}-${idx}`}>{row}</div>
                )
              })}
            </div>

            {/* Infinite Scroll Sentinel */}
            {hasNextPage && (
              <div ref={sentinelRef} className="h-12 mt-4 flex items-center justify-center">
                {isFetchingNextPage && (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
