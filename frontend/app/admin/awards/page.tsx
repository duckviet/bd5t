"use client"

import { useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"

import { Card, CardContent } from "@/components/ui/card"
import { ErrorState } from "@/components/common/empty-state"
import { LoadingSkeleton } from "@/components/common/loading"
import {
  useListAwardActivities,
  type AwardActivityOverview,
  type ListAwardActivitiesParams,
} from "@/services/generated/api"
import { useDebounce } from "@/hooks/use-debounce"
import { EvidencePagination } from "../evidences/components/EvidencePagination"

import {
  AwardsStatsCards,
  ActivityAwardsTable,
  AwardDetailDialog,
  AwardFilters,
  type AwardSortValue,
  type AwardStatusFilter,
  type AwardReviewLevelFilter,
  type AwardCriteriaFilter,
} from "./components"

export default function AdminAwardsPage() {
  const queryClient = useQueryClient()

  // State for filters
  const [searchQuery, setSearchQuery] = useState("")
  const [reviewLevelFilter, setReviewLevelFilter] = useState<AwardReviewLevelFilter>("all")
  const [criteriaFilter, setCriteriaFilter] = useState<AwardCriteriaFilter>("all")
  const [awardStatusFilter, setAwardStatusFilter] = useState<AwardStatusFilter>("all")
  const [sort, setSort] = useState<AwardSortValue>("title_asc")

  const [detailActivity, setDetailActivity] = useState<AwardActivityOverview | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const debouncedSearch = useDebounce(searchQuery, 400)

  // Fetch up to 1000 items matching the search query to do client-side filtering/sorting/pagination
  const queryParams = useMemo<ListAwardActivitiesParams>(
    () => ({
      page: 1,
      pageSize: 1000,
      search: debouncedSearch.trim() || undefined,
    }),
    [debouncedSearch],
  )

  const listQuery = useListAwardActivities(queryParams, {
    query: { retry: false, refetchOnWindowFocus: false },
  })

  const rawActivities = useMemo<AwardActivityOverview[]>(
    () => (listQuery.data?.data ?? []) as AwardActivityOverview[],
    [listQuery.data],
  )

  // Client-side filtering and sorting
  const filteredAndSortedActivities = useMemo(() => {
    let result = [...rawActivities]

    // 1. Filter by review level
    if (reviewLevelFilter !== "all") {
      result = result.filter((act) => act.reviewLevel === reviewLevelFilter)
    }

    // 2. Filter by criteria
    if (criteriaFilter !== "all") {
      result = result.filter((act) => act.criteria?.includes(criteriaFilter))
    }

    // 3. Filter by award status
    if (awardStatusFilter !== "all") {
      result = result.filter((act) => {
        const stats = act.awardStats
        const hasAward =
          stats &&
          ((stats.NHAT ?? 0) > 0 ||
            (stats.NHI ?? 0) > 0 ||
            (stats.BA ?? 0) > 0 ||
            (stats.KHUYEN_KHICH ?? 0) > 0)
        return awardStatusFilter === "awarded" ? hasAward : !hasAward
      })
    }

    // 4. Sort
    result.sort((a, b) => {
      if (sort === "title_asc") {
        return (a.activityTitle ?? "").localeCompare(b.activityTitle ?? "")
      }
      if (sort === "title_desc") {
        return (b.activityTitle ?? "").localeCompare(a.activityTitle ?? "")
      }
      if (sort === "students_desc") {
        return (b.totalStudents ?? 0) - (a.totalStudents ?? 0)
      }
      if (sort === "students_asc") {
        return (a.totalStudents ?? 0) - (b.totalStudents ?? 0)
      }
      if (sort === "awards_desc") {
        const getAwardsCount = (act: typeof a) => {
          const s = act.awardStats
          return (
            (s?.NHAT ?? 0) + (s?.NHI ?? 0) + (s?.BA ?? 0) + (s?.KHUYEN_KHICH ?? 0)
          )
        }
        return getAwardsCount(b) - getAwardsCount(a)
      }
      return 0
    })

    return result
  }, [rawActivities, reviewLevelFilter, criteriaFilter, awardStatusFilter, sort])

  // Client-side pagination
  const total = filteredAndSortedActivities.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const paginatedActivities = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredAndSortedActivities.slice(start, start + pageSize)
  }, [filteredAndSortedActivities, page, pageSize])

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setPage(1)
  }

  const handleReviewLevelChange = (value: AwardReviewLevelFilter) => {
    setReviewLevelFilter(value)
    setPage(1)
  }

  const handleCriteriaChange = (value: AwardCriteriaFilter) => {
    setCriteriaFilter(value)
    setPage(1)
  }

  const handleAwardStatusChange = (value: AwardStatusFilter) => {
    setAwardStatusFilter(value)
    setPage(1)
  }

  const handleSortChange = (value: AwardSortValue) => {
    setSort(value)
    setPage(1)
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    setReviewLevelFilter("all")
    setCriteriaFilter("all")
    setAwardStatusFilter("all")
    setSort("title_asc")
    setPage(1)
  }

  const invalidateData = () => {
    queryClient.invalidateQueries({ queryKey: ["/admin/awards/activities"] })
    queryClient.invalidateQueries({ queryKey: ["/admin/evidences"] })
    queryClient.invalidateQueries({
      predicate: (query) =>
        query.queryKey[0] === "/leaderboard" ||
        (typeof query.queryKey[0] === "string" && query.queryKey[0].startsWith("/leaderboard")),
    })
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setPage(1)
  }

  const currentDetailActivity = useMemo(() => {
    if (!detailActivity?.activityId) return null
    return rawActivities.find((act) => act.activityId === detailActivity.activityId) || detailActivity
  }, [detailActivity, rawActivities])

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Quản lý giải thưởng</h1>
            <p className="text-muted-foreground">
              Xem tổng quan giải thưởng theo hoạt động, trao giải cho sinh viên
            </p>
          </div>
        </div>

        <AwardsStatsCards activities={filteredAndSortedActivities} isLoading={listQuery.isLoading} />

        <AwardFilters
          searchQuery={searchQuery}
          reviewLevelFilter={reviewLevelFilter}
          criteriaFilter={criteriaFilter}
          awardStatusFilter={awardStatusFilter}
          sort={sort}
          onSearchChange={handleSearchChange}
          onReviewLevelChange={handleReviewLevelChange}
          onCriteriaChange={handleCriteriaChange}
          onAwardStatusChange={handleAwardStatusChange}
          onSortChange={handleSortChange}
          onClear={handleClearFilters}
        />

        {/* Main table */}
        {listQuery.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <LoadingSkeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : listQuery.isError ? (
          <Card>
            <CardContent>
              <ErrorState
                title="Không thể tải danh sách"
                message="Vui lòng thử lại sau"
                onRetry={() => listQuery.refetch()}
              />
            </CardContent>
          </Card>
        ) : (
          <>
            <ActivityAwardsTable
              activities={paginatedActivities}
              onViewDetail={setDetailActivity}
            />
            <EvidencePagination
              page={page}
              pageSize={pageSize}
              total={total}
              totalPages={totalPages}
              onPageChange={setPage}
              onPageSizeChange={handlePageSizeChange}
            />
          </>
        )}

        <AwardDetailDialog
          activity={currentDetailActivity}
          open={detailActivity !== null}
          onOpenChange={(open) => {
            if (!open) setDetailActivity(null)
          }}
          onUpdated={invalidateData}
        />
      </div>
    </div>
  )
}

