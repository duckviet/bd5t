"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useListLeaderboard, type LeaderboardItem } from "@/services/generated/api";

function rankBadgeClass(rank: number) {
  if (rank === 1) return "bg-yellow-500";
  if (rank === 2) return "bg-gray-400";
  return "bg-amber-700";
}

export function HomeLeaderboardPreview() {
  const { data, isLoading, error } = useListLeaderboard({ pageSize: 3 });
  const topUsers: LeaderboardItem[] = (data?.data || []).slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Top 3 Sinh viên xuất sắc</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <div className="text-sm text-muted-foreground">Đang tải bảng xếp hạng...</div>}
        {!isLoading && error && (
          <div className="text-sm text-destructive">Không thể tải bảng xếp hạng.</div>
        )}
        {!isLoading && !error && topUsers.length === 0 && (
          <div className="text-sm text-muted-foreground">Chưa có dữ liệu bảng xếp hạng.</div>
        )}
        {!isLoading && !error && topUsers.length > 0 && (
          <div className="space-y-4">
            {topUsers.map((user, idx) => (
              <div
                key={user.userId || `${user.rank}-${idx}`}
                className="flex items-center gap-4 p-4 rounded-xl bg-muted/50"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-white ${rankBadgeClass(user.rank || idx + 1)}`}
                >
                  {user.rank || idx + 1}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{user.userName || "N/A"}</div>
                  <div className="text-sm text-muted-foreground">{user.unitName || "Chưa có đơn vị"}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary">{user.totalApproved || 0}</div>
                  <div className="text-xs text-muted-foreground">hoạt động</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
