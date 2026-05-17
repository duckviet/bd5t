"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "react-toastify"
import { Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ErrorState } from "@/components/common/empty-state"
import { LoadingSkeleton } from "@/components/common/loading"
import { EVIDENCE_STATUS, REVIEW_LEVELS } from "@/lib/constants"
import { getEvidenceCriteriaLabel } from "@/features/profile/evidence-criteria"
import type {
  EvidenceItem,
  EvidenceItemStatus,
  ListAdminEvidencesParams,
  ListAdminEvidencesSort,
  ListAdminEvidencesCriteria,
  UnitItem,
} from "@/services/generated/api"
import {
  BulkReviewEvidenceRequestStatus,
  getGetAdminEvidenceStatsQueryKey,
  getListNotificationsQueryKey,
  useBulkReviewEvidence,
  useGetAdminEvidenceStats,
  useListAdminEvidences,
  useListUnits,
  useReviewEvidence,
} from "@/services/generated/api"

import {
  EvidenceStatsCards,
  EvidenceFilters,
  EvidenceList,
  EvidenceDetailPanel,
  BulkReviewBar,
  EvidencePagination,
} from "./components"

type StatusFilter = EvidenceItemStatus | "all"
type CriteriaFilter = ListAdminEvidencesCriteria | "all"
type SortValue = ListAdminEvidencesSort
type ReviewDecision = "approved" | "rejected"

function getStatusLabel(status?: string) {
  const key = (status ?? "pending").toUpperCase() as keyof typeof EVIDENCE_STATUS
  return EVIDENCE_STATUS[key] ?? status ?? "pending"
}

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null) {
    const apiError = error as {
      response?: { data?: { error?: { message?: string } } }
      message?: string
    }
    return apiError.response?.data?.error?.message || apiError.message || fallback
  }

  return fallback
}

function formatDate(value?: string) {
  return value ? new Date(value).toLocaleDateString("vi-VN") : "Chưa xác định"
}

function escapeCsvCell(value: unknown) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`
}

function exportEvidencesCsv(evidences: EvidenceItem[]) {
  const headers = [
    "Hoạt động",
    "Sinh viên",
    "Mã SV",
    "Lớp",
    "Khoa",
    "Tiêu chí",
    "Cấp xét",
    "Trạng thái",
    "Ngày nộp",
    "Điểm",
    "Ghi chú duyệt",
    "File",
  ]
  const rows = evidences.map((evidence) => {
    const reviewLevel = evidence.reviewLevel
      ? REVIEW_LEVELS[evidence.reviewLevel as keyof typeof REVIEW_LEVELS] ?? evidence.reviewLevel
      : ""

    return [
      evidence.activityTitle ?? "",
      evidence.userFullName ?? "",
      evidence.userStudentId ?? "",
      evidence.userClassName ?? "",
      evidence.userUnitName ?? "",
      getEvidenceCriteriaLabel(evidence, {}, []),
      reviewLevel,
      getStatusLabel(evidence.status),
      formatDate(evidence.createdAt),
      evidence.score ?? "",
      evidence.reviewNote ?? "",
      evidence.fileUrl ?? "",
    ]
  })

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCsvCell).join(","))
    .join("\n")
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `minh-chung-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export default function AdminEvidencesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [criteriaFilter, setCriteriaFilter] = useState<CriteriaFilter>("all")
  const [submittedFrom, setSubmittedFrom] = useState("")
  const [submittedTo, setSubmittedTo] = useState("")
  const [unitId, setUnitId] = useState("all")
  const [className, setClassName] = useState("")
  const [sort, setSort] = useState<SortValue>("priority")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [reviewNote, setReviewNote] = useState("")
  const [bulkNote, setBulkNote] = useState("")
  const previousPendingRef = useRef<number | null>(null)
  const queryClient = useQueryClient()

  const resetToFirstPage = () => setPage(1)

  const queryParams = useMemo<ListAdminEvidencesParams>(
    () => ({
      page,
      pageSize,
      sort,
      status: statusFilter === "all" ? undefined : statusFilter,
      criteria: criteriaFilter === "all" ? undefined : criteriaFilter,
      search: searchQuery.trim() || undefined,
      submittedFrom: submittedFrom || undefined,
      submittedTo: submittedTo || undefined,
      unitId: unitId === "all" ? undefined : unitId,
      className: className.trim() || undefined,
    }),
    [
      page,
      pageSize,
      sort,
      statusFilter,
      criteriaFilter,
      searchQuery,
      submittedFrom,
      submittedTo,
      unitId,
      className,
    ],
  )

  const evidencesQuery = useListAdminEvidences(queryParams, {
    query: { retry: false, refetchOnWindowFocus: false, refetchInterval: 30_000 },
  })
  const statsQuery = useGetAdminEvidenceStats({
    query: { retry: false, refetchOnWindowFocus: false, refetchInterval: 30_000 },
  })
  const unitsQuery = useListUnits({ query: { retry: false, refetchOnWindowFocus: false } })

  const evidences = useMemo<EvidenceItem[]>(
    () => (evidencesQuery.data?.data ?? []) as EvidenceItem[],
    [evidencesQuery.data],
  )
  const units = useMemo<UnitItem[]>(
    () => (unitsQuery.data?.data ?? []) as UnitItem[],
    [unitsQuery.data],
  )
  const meta = evidencesQuery.data?.meta
  const total = meta?.total ?? evidences.length
  const totalPages = meta?.totalPages ?? 1

  useEffect(() => {
    const pending = statsQuery.data?.data?.pending
    if (typeof pending !== "number") return
    if (previousPendingRef.current !== null && pending > previousPendingRef.current) {
      toast.info("Có minh chứng mới cần duyệt")
    }
    previousPendingRef.current = pending
  }, [statsQuery.data?.data?.pending])

  const invalidateAdminEvidenceData = () => {
    queryClient.invalidateQueries({ queryKey: ["/admin/evidences"] })
    queryClient.invalidateQueries({ queryKey: getGetAdminEvidenceStatsQueryKey() })
    queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() })
  }

  const reviewMutation = useReviewEvidence({
    mutation: {
      onSuccess: (response) => {
        const reviewed = response.data ?? null
        if (reviewed) {
          setSelectedEvidence(reviewed)
        }
        setReviewNote("")
        invalidateAdminEvidenceData()
        toast.success("Đã cập nhật trạng thái minh chứng và gửi thông báo")
      },
      onError: (error) => {
        toast.error(getErrorMessage(error, "Không thể duyệt minh chứng"))
      },
    },
  })

  const bulkReviewMutation = useBulkReviewEvidence({
    mutation: {
      onSuccess: () => {
        setSelectedIds([])
        setBulkNote("")
        invalidateAdminEvidenceData()
        toast.success("Đã cập nhật các minh chứng đã chọn")
      },
      onError: (error) => {
        toast.error(getErrorMessage(error, "Không thể duyệt hàng loạt"))
      },
    },
  })

  const handleReview = (status: ReviewDecision) => {
    if (!selectedEvidence?.id) return

    reviewMutation.mutate({
      id: selectedEvidence.id,
      data: {
        status,
        reviewNote: reviewNote.trim() || undefined,
      },
    })
  }

  const handleBulkReview = (status: ReviewDecision) => {
    if (selectedIds.length === 0) return

    bulkReviewMutation.mutate({
      data: {
        ids: selectedIds,
        status:
          status === "approved"
            ? BulkReviewEvidenceRequestStatus.approved
            : BulkReviewEvidenceRequestStatus.rejected,
        reviewNote: bulkNote.trim() || undefined,
      },
    })
  }

  const toggleSelectedId = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  const handleSelectEvidence = (evidence: EvidenceItem) => {
    setSelectedEvidence(evidence)
    setReviewNote(evidence.reviewNote ?? "")
  }

  const clearFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setCriteriaFilter("all")
    setSubmittedFrom("")
    setSubmittedTo("")
    setUnitId("all")
    setClassName("")
    setSort("priority")
    setPage(1)
  }

  const handlePageSizeChange = (value: number) => {
    setPageSize(value)
    setPage(1)
  }

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Duyệt minh chứng</h1>
            <p className="text-muted-foreground">
              Quản lý và duyệt minh chứng do sinh viên nộp
            </p>
          </div>
          <Button
            variant="outline"
            className="gap-2"
            disabled={evidences.length === 0}
            onClick={() => exportEvidencesCsv(evidences)}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <EvidenceStatsCards stats={statsQuery.data?.data} isLoading={statsQuery.isLoading} />

        <EvidenceFilters
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          criteriaFilter={criteriaFilter}
          submittedFrom={submittedFrom}
          submittedTo={submittedTo}
          unitId={unitId}
          className={className}
          sort={sort}
          units={units}
          onSearchChange={(value) => {
            setSearchQuery(value)
            resetToFirstPage()
          }}
          onStatusChange={(value) => {
            setStatusFilter(value)
            resetToFirstPage()
          }}
          onCriteriaChange={(value) => {
            setCriteriaFilter(value)
            resetToFirstPage()
          }}
          onSubmittedFromChange={(value) => {
            setSubmittedFrom(value)
            resetToFirstPage()
          }}
          onSubmittedToChange={(value) => {
            setSubmittedTo(value)
            resetToFirstPage()
          }}
          onUnitChange={(value) => {
            setUnitId(value)
            resetToFirstPage()
          }}
          onClassNameChange={(value) => {
            setClassName(value)
            resetToFirstPage()
          }}
          onSortChange={(value) => {
            setSort(value)
            resetToFirstPage()
          }}
          onClear={clearFilters}
        />

        {evidencesQuery.isLoading ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_460px]">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <LoadingSkeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-3">
                        <LoadingSkeleton className="h-4 w-2/3" />
                        <LoadingSkeleton className="h-3 w-1/2" />
                        <LoadingSkeleton className="h-5 w-40" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card>
              <CardContent className="p-8">
                <LoadingSkeleton className="mb-4 h-6 w-1/2" />
                <LoadingSkeleton className="h-72 w-full" />
              </CardContent>
            </Card>
          </div>
        ) : evidencesQuery.isError ? (
          <Card>
            <CardContent>
              <ErrorState
                title="Không thể tải minh chứng"
                message="Vui lòng thử lại sau"
                onRetry={() => evidencesQuery.refetch()}
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_460px]">
            <div className="space-y-4">
              <BulkReviewBar
                count={selectedIds.length}
                note={bulkNote}
                isSubmitting={bulkReviewMutation.isPending}
                onNoteChange={setBulkNote}
                onSubmit={handleBulkReview}
                onClear={() => setSelectedIds([])}
                onExport={() =>
                  exportEvidencesCsv(
                    evidences.filter((evidence) => evidence.id && selectedIds.includes(evidence.id)),
                  )
                }
              />
              <EvidenceList
                evidences={evidences}
                selectedEvidenceId={selectedEvidence?.id}
                selectedIds={selectedIds}
                onSelectEvidence={handleSelectEvidence}
                onToggle={toggleSelectedId}
              />
              <EvidencePagination
                page={page}
                pageSize={pageSize}
                total={total}
                totalPages={totalPages}
                onPageChange={setPage}
                onPageSizeChange={handlePageSizeChange}
              />
            </div>

            <EvidenceDetailPanel
              evidence={selectedEvidence}
              reviewNote={reviewNote}
              isReviewing={reviewMutation.isPending}
              onReviewNoteChange={setReviewNote}
              onReview={handleReview}
            />
          </div>
        )}
      </div>
    </div>
  )
}
