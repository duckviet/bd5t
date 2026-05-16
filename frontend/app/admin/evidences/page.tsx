"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "react-toastify"
import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  ImageIcon,
  RefreshCw,
  Search,
  X,
  XCircle,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ErrorState } from "@/components/common/empty-state"
import { LoadingSkeleton } from "@/components/common/loading"
import { CRITERIA, EVIDENCE_STATUS, REVIEW_LEVELS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { getEvidenceCriteriaLabel } from "@/features/profile/evidence-criteria"
import type {
  EvidenceItem,
  EvidenceItemStatus,
  ListAdminEvidencesParams,
  ListAdminEvidencesSort,
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

type StatusFilter = EvidenceItemStatus | "all"
type CriteriaFilter = keyof typeof CRITERIA | "all"
type SortValue = ListAdminEvidencesSort
type ReviewDecision = "approved" | "rejected"

const statusBadgeVariant: Record<
  EvidenceItemStatus,
  "success" | "secondary" | "destructive"
> = {
  pending: "secondary",
  approved: "success",
  rejected: "destructive",
}

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "pending", label: "Chờ duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "rejected", label: "Từ chối" },
]

const SORT_OPTIONS: Array<{ value: SortValue; label: string }> = [
  { value: "priority", label: "Ưu tiên chờ duyệt" },
  { value: "createdAt_desc", label: "Mới nhất" },
  { value: "createdAt_asc", label: "Cũ nhất" },
]

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

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

function getInitials(name?: string | null) {
  const value = name?.trim()
  if (!value) return "SV"
  return value
    .split(/\s+/)
    .slice(-2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
}

function getFileKind(fileUrl?: string) {
  const cleanUrl = fileUrl?.split("?")[0].toLowerCase() ?? ""
  if (/\.(png|jpe?g|webp|gif)$/i.test(cleanUrl)) return "image"
  if (/\.pdf$/i.test(cleanUrl)) return "pdf"
  return "other"
}

function StudentAvatar({ evidence }: { evidence: EvidenceItem }) {
  if (evidence.userAvatarUrl) {
    return (
      <img
        src={evidence.userAvatarUrl}
        alt={evidence.userFullName || "Sinh viên"}
        className="h-10 w-10 rounded-full object-cover"
      />
    )
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
      {getInitials(evidence.userFullName)}
    </div>
  )
}

function EvidenceStatsCards({
  stats,
  isLoading,
}: {
  stats?: { pending?: number; approvedToday?: number; rejectedToday?: number; total?: number }
  isLoading: boolean
}) {
  const items = [
    { label: "Chờ duyệt", value: stats?.pending ?? 0, tone: "text-orange-700" },
    { label: "Đã duyệt hôm nay", value: stats?.approvedToday ?? 0, tone: "text-green-700" },
    { label: "Từ chối hôm nay", value: stats?.rejectedToday ?? 0, tone: "text-red-700" },
    { label: "Tổng minh chứng", value: stats?.total ?? 0, tone: "text-foreground" },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">{item.label}</div>
            {isLoading ? (
              <LoadingSkeleton className="mt-2 h-8 w-16" />
            ) : (
              <div className={cn("mt-1 text-2xl font-bold", item.tone)}>{item.value}</div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function EvidenceFilters({
  searchQuery,
  statusFilter,
  criteriaFilter,
  submittedFrom,
  submittedTo,
  unitId,
  className,
  sort,
  units,
  onSearchChange,
  onStatusChange,
  onCriteriaChange,
  onSubmittedFromChange,
  onSubmittedToChange,
  onUnitChange,
  onClassNameChange,
  onSortChange,
  onClear,
}: {
  searchQuery: string
  statusFilter: StatusFilter
  criteriaFilter: CriteriaFilter
  submittedFrom: string
  submittedTo: string
  unitId: string
  className: string
  sort: SortValue
  units: UnitItem[]
  onSearchChange: (value: string) => void
  onStatusChange: (value: StatusFilter) => void
  onCriteriaChange: (value: CriteriaFilter) => void
  onSubmittedFromChange: (value: string) => void
  onSubmittedToChange: (value: string) => void
  onUnitChange: (value: string) => void
  onClassNameChange: (value: string) => void
  onSortChange: (value: SortValue) => void
  onClear: () => void
}) {
  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(260px,1.4fr)_repeat(3,minmax(150px,1fr))]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm hoạt động, sinh viên, mã SV..."
              className="pl-10"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>

          <Select value={statusFilter} onValueChange={(value) => onStatusChange(value as StatusFilter)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={criteriaFilter} onValueChange={(value) => onCriteriaChange(value as CriteriaFilter)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả tiêu chí</SelectItem>
              {Object.entries(CRITERIA).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={(value) => onSortChange(value as SortValue)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Input
            type="date"
            value={submittedFrom}
            onChange={(event) => onSubmittedFromChange(event.target.value)}
            aria-label="Từ ngày"
          />
          <Input
            type="date"
            value={submittedTo}
            onChange={(event) => onSubmittedToChange(event.target.value)}
            aria-label="Đến ngày"
          />
          <Select value={unitId} onValueChange={onUnitChange}>
            <SelectTrigger>
              <SelectValue placeholder="Khoa/đơn vị" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả khoa</SelectItem>
              {units.map((unit) => (
                <SelectItem key={unit.id} value={unit.id || "all"}>
                  {unit.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Lớp"
            value={className}
            onChange={(event) => onClassNameChange(event.target.value)}
          />
          <Button variant="outline" onClick={onClear} className="gap-2">
            <X className="h-4 w-4" />
            Xóa lọc
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function EvidenceList({
  evidences,
  selectedEvidenceId,
  selectedIds,
  onSelectEvidence,
  onToggle,
}: {
  evidences: EvidenceItem[]
  selectedEvidenceId?: string
  selectedIds: string[]
  onSelectEvidence: (evidence: EvidenceItem) => void
  onToggle: (id: string) => void
}) {
  if (evidences.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Không có minh chứng phù hợp
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {evidences.map((evidence) => {
        const status = (evidence.status ?? "pending") as EvidenceItemStatus
        const isSelected = selectedEvidenceId === evidence.id
        const isChecked = Boolean(evidence.id && selectedIds.includes(evidence.id))

        return (
          <Card
            key={evidence.id}
            className={cn(
              "cursor-pointer transition-all",
              isSelected && "border-primary bg-primary/5 ring-2 ring-primary/50",
            )}
            onClick={() => onSelectEvidence(evidence)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onClick={(event) => event.stopPropagation()}
                  onChange={() => evidence.id && onToggle(evidence.id)}
                  className="mt-3 h-4 w-4 rounded border-border"
                  aria-label="Chọn minh chứng"
                />
                <StudentAvatar evidence={evidence} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">
                    {evidence.activityTitle || evidence.description || "Minh chứng"}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {evidence.userFullName || "Sinh viên"} -{" "}
                    {evidence.userStudentId || "Chưa có mã SV"}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {[evidence.userClassName, evidence.userUnitName].filter(Boolean).join(" - ") ||
                      "Chưa có lớp/khoa"}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {getEvidenceCriteriaLabel(evidence, {}, [])}
                    </Badge>
                    <Badge variant={statusBadgeVariant[status]} className="text-xs">
                      {getStatusLabel(status)}
                    </Badge>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(evidence.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function EvidenceFilePreview({ fileUrl }: { fileUrl?: string }) {
  if (!fileUrl) {
    return <div className="text-sm text-muted-foreground">Không có file</div>
  }

  const kind = getFileKind(fileUrl)

  return (
    <div className="space-y-3">
      {kind === "image" && (
        <div className="overflow-hidden rounded-md border bg-muted">
          <img src={fileUrl} alt="Minh chứng" className="max-h-[420px] w-full object-contain" />
        </div>
      )}
      {kind === "pdf" && (
        <iframe
          src={fileUrl}
          title="Preview minh chứng PDF"
          className="h-[420px] w-full rounded-md border bg-white"
        />
      )}
      {kind === "other" && (
        <div className="flex items-center gap-2 rounded-md border bg-muted p-3 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          Không hỗ trợ preview trực tiếp cho định dạng này
        </div>
      )}
      <a
        href={fileUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
      >
        Mở file trong tab mới
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  )
}

function EvidenceDetailPanel({
  evidence,
  reviewNote,
  isReviewing,
  onReviewNoteChange,
  onReview,
}: {
  evidence: EvidenceItem | null
  reviewNote: string
  isReviewing: boolean
  onReviewNoteChange: (value: string) => void
  onReview: (status: ReviewDecision) => void
}) {
  if (!evidence) {
    return (
      <Card className="sticky top-24">
        <CardContent className="p-8 text-center text-muted-foreground">
          Chọn một minh chứng để xem chi tiết
        </CardContent>
      </Card>
    )
  }

  const status = (evidence.status ?? "pending") as EvidenceItemStatus

  return (
    <Card className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
      <CardHeader className="border-b p-4">
        <CardTitle className="text-lg">Chi tiết minh chứng</CardTitle>
      </CardHeader>
      <CardContent className="relative p-0">
        <div className="space-y-5  p-4">

        <div>
          <div className="mb-1 text-sm font-medium">Hoạt động</div>
          <div className="text-sm text-muted-foreground">
            {evidence.activityTitle || "Không có tiêu đề"}
          </div>
        </div>

        <div>
          <div className="mb-1 text-sm font-medium">Sinh viên</div>
          <div className="flex items-center gap-3 text-sm">
            <StudentAvatar evidence={evidence} />
            <div>
              <div className="font-medium">{evidence.userFullName || "Sinh viên"}</div>
              <div className="text-xs text-muted-foreground">
                {evidence.userStudentId || "Chưa có mã SV"}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <div className="mb-1 text-sm font-medium">Tiêu chí</div>
            <Badge variant="outline">{getEvidenceCriteriaLabel(evidence, {}, [])}</Badge>
          </div>
          <div>
            <div className="mb-1 text-sm font-medium">Cấp xét</div>
            <div className="text-sm text-muted-foreground">
              {REVIEW_LEVELS[evidence.reviewLevel || "TRUONG"]}
            </div>
          </div>
          <div>
            <div className="mb-1 text-sm font-medium">Ngày nộp</div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {formatDate(evidence.createdAt)}
            </div>
          </div>
          <div>
            <div className="mb-1 text-sm font-medium">Trạng thái</div>
            <Badge variant={statusBadgeVariant[status]}>{getStatusLabel(status)}</Badge>
          </div>
          <div>
            <div className="mb-1 text-sm font-medium">Lớp</div>
            <div className="text-sm text-muted-foreground">{evidence.userClassName || "Chưa có"}</div>
          </div>
          <div>
            <div className="mb-1 text-sm font-medium">Khoa</div>
            <div className="text-sm text-muted-foreground">{evidence.userUnitName || "Chưa có"}</div>
          </div>
        </div>

        {evidence.description && (
          <div>
            <div className="mb-1 text-sm font-medium">Mô tả</div>
            <div className="text-sm text-muted-foreground">{evidence.description}</div>
          </div>
        )}

        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <ImageIcon className="h-4 w-4" />
            File minh chứng
          </div>
          <EvidenceFilePreview fileUrl={evidence.fileUrl} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="review-note">
            Ghi chú duyệt
          </label>
          <textarea
            id="review-note"
            className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Nhập ghi chú gửi cho sinh viên..."
            value={reviewNote}
            onChange={(event) => onReviewNoteChange(event.target.value)}
          />
        </div>
        </div>

        {status === "pending" && (
          <div className="grid gap-2 sm:grid-cols-2 sticky bottom-0 p-4 bg-white">
            <Button
              className="gap-1"
              variant="success"
              disabled={isReviewing}
              onClick={() => onReview("approved")}
            >
              {isReviewing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Duyệt
            </Button>
            <Button
              className="gap-1"
              variant="destructive"
              disabled={isReviewing}
              onClick={() => onReview("rejected")}
            >
              <XCircle className="h-4 w-4" />
              Từ chối
            </Button>
          </div>
        )}

        {status !== "pending" && evidence.reviewNote && (
          <div className="rounded-md bg-muted p-3">
            <div className="text-sm font-medium">Ghi chú đã gửi</div>
            <div className="mt-1 text-sm text-muted-foreground">{evidence.reviewNote}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function BulkReviewBar({
  count,
  note,
  isSubmitting,
  onNoteChange,
  onSubmit,
  onClear,
  onExport,
}: {
  count: number
  note: string
  isSubmitting: boolean
  onNoteChange: (value: string) => void
  onSubmit: (status: ReviewDecision) => void
  onClear: () => void
  onExport: () => void
}) {
  if (count === 0) return null

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-medium">Đã chọn {count} minh chứng</div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={onExport} className="gap-1">
              <Download className="h-4 w-4" />
              Export chọn
            </Button>
            <Button variant="ghost" size="sm" onClick={onClear} className="gap-1">
              <X className="h-4 w-4" />
              Bỏ chọn
            </Button>
          </div>
        </div>
        <textarea
          className="min-h-20 w-full rounded-md border border-input bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Ghi chú áp dụng cho tất cả minh chứng đã chọn..."
          value={note}
          onChange={(event) => onNoteChange(event.target.value)}
        />
        <div className="grid gap-2 sm:grid-cols-2">
          <Button
            variant="success"
            disabled={isSubmitting}
            className="gap-1"
            onClick={() => onSubmit("approved")}
          >
            {isSubmitting ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Duyệt hàng loạt
          </Button>
          <Button
            variant="destructive"
            disabled={isSubmitting}
            className="gap-1"
            onClick={() => onSubmit("rejected")}
          >
            <XCircle className="h-4 w-4" />
            Từ chối hàng loạt
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function EvidencePagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: {
  page: number
  pageSize: number
  total: number
  totalPages: number
  onPageChange: (value: number) => void
  onPageSizeChange: (value: number) => void
}) {
  return (
    <div className="flex flex-col gap-3 rounded-md border bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-muted-foreground">
        Tổng {total} minh chứng - Trang {page}/{Math.max(totalPages, 1)}
      </div>
      <div className="flex items-center gap-2">
        <Select value={String(pageSize)} onValueChange={(value) => onPageSizeChange(Number(value))}>
          <SelectTrigger className="h-9 w-[90px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}/trang
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
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
