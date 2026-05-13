"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

const mockLeaderboard = [
  { rank: 1, userId: "user_1", fullName: "Nguyễn Văn A", unitName: "Khoa Ngôn ngữ & Văn hóa Anh", approvedActivityCount: 12 },
  { rank: 2, userId: "user_2", fullName: "Trần Thị B", unitName: "Khoa Ngôn ngữ & Văn hóa Nhật Bản", approvedActivityCount: 10 },
  { rank: 3, userId: "user_3", fullName: "Lê Văn C", unitName: "Khoa Ngôn ngữ & Văn hóa Hàn Quốc", approvedActivityCount: 9 },
  { rank: 4, userId: "user_4", fullName: "Phạm Thị D", unitName: "Khoa Ngôn ngữ & Văn hóa Trung Quốc", approvedActivityCount: 8 },
  { rank: 5, userId: "user_5", fullName: "Hoàng Văn E", unitName: "Khoa Ngôn ngữ & Văn hóa Pháp", approvedActivityCount: 7 },
  { rank: 6, userId: "user_6", fullName: "Nguyễn Thị F", unitName: "Khoa Ngôn ngữ & Văn hóa Đức", approvedActivityCount: 6 },
  { rank: 7, userId: "user_7", fullName: "Trần Văn G", unitName: "Khoa Ngôn ngữ & Văn hóa Nga", approvedActivityCount: 6 },
  { rank: 8, userId: "user_8", fullName: "Lê Thị H", unitName: "Khoa Ngôn ngữ & Văn hóa Ả Rập", approvedActivityCount: 5 },
  { rank: 9, userId: "user_9", fullName: "Phạm Văn I", unitName: "Khoa Việt Nam - Đông Nam Á", approvedActivityCount: 5 },
  { rank: 10, userId: "user_10", fullName: "Nguyễn Văn J", unitName: "Khoa Giáo dục Quốc tế", approvedActivityCount: 4 },
]

export default function LeaderboardPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredLeaderboard = mockLeaderboard.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.unitName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />
    return <span className="text-sm font-medium text-muted-foreground">{rank}</span>
  }

  const getRankBg = (rank: number) => {
    if (rank === 1) return "bg-yellow-50 border-yellow-200"
    if (rank === 2) return "bg-gray-50 border-gray-200"
    if (rank === 3) return "bg-amber-50 border-amber-200"
    return ""
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

        {/* Top 3 Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[1, 0, 2].map((idx) => {
            const user = mockLeaderboard[idx]
            const order = idx === 1 ? 1 : idx === 0 ? 2 : 3
            return (
              <Card 
                key={user.rank}
                className={`text-center ${getRankBg(user.rank)} ${
                  idx === 1 ? "md:-mt-4" : ""
                }`}
              >
                <CardContent className="p-6">
                  <div className="mb-4">
                    {getRankIcon(user.rank)}
                  </div>
                  <div className="h-16 w-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-3">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{user.fullName}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{user.unitName}</p>
                  <Badge variant="default" className="gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {user.approvedActivityCount} hoạt động
                  </Badge>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Search & List */}
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
            <div className="space-y-2">
              {filteredLeaderboard.map((user) => (
                <div 
                  key={user.userId}
                  className={`flex items-center gap-4 p-4 rounded-xl ${
                    getRankBg(user.rank) || "bg-muted/30 hover:bg-muted/50"
                  } transition-colors`}
                >
                  <div className="w-10 flex justify-center">
                    {getRankIcon(user.rank)}
                  </div>
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{user.fullName}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {user.unitName}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary">{user.approvedActivityCount}</div>
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