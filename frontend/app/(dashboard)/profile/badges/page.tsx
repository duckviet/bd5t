"use client"

import Link from "next/link"
import { ArrowLeft, RefreshCw, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BadgeCollection } from "@/entities/badge"
import { useGetProgress } from "@/services/generated/api"
import { ProfileSkeleton } from "@/components/common/loading"

export default function BadgesPage() {
  const { data: progressData, isLoading, error, refetch } = useGetProgress({
    query: { retry: false, refetchOnWindowFocus: false },
  })

  const criteriaScores = progressData?.data?.criteriaScores ?? []

  return (
    <div className="min-h-screen py-10 bg-slate-50/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/profile">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-slate-800 -ml-3">
              <ArrowLeft className="h-4 w-4" />
              Quay lại trang cá nhân
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <ProfileSkeleton />
        ) : error ? (
          <div className="flex items-center justify-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4 animate-bounce" />
              <p className="text-destructive font-semibold mb-4">
                Không thể tải thông tin huy hiệu
              </p>
              <Button onClick={() => refetch()} variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Thử lại
              </Button>
            </div>
          </div>
        ) : (
          <BadgeCollection criteriaScores={criteriaScores} />
        )}
      </div>
    </div>
  )
}
