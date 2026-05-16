"use client"

import { useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "react-toastify"
import { Download, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CRITERIA, REVIEW_LEVELS } from "@/lib/constants"
import {
  ListAdminActivitiesCriteria,
  ListAdminActivitiesReviewLevel,
  ListAdminActivitiesStatus,
  useCreateActivity,
  useDeleteActivity,
  useListAdminActivities,
  useListUnits,
  useUpdateActivity,
  type ActivityItem,
  type CreateActivityRequest,
  type ListAdminActivitiesParams,
  type ListAdminActivitiesSort as ListAdminActivitiesSortType,
  type UnitItem,
} from "@/services/generated/api"

import { ActivityTable, ActivityFilters, ActivityPagination, ActivityDialog } from "./components"

type StatusFilter = "all" | keyof typeof ListAdminActivitiesStatus
type CriteriaFilter = "all" | keyof typeof ListAdminActivitiesCriteria
type ReviewLevelFilter = "all" | keyof typeof ListAdminActivitiesReviewLevel

function toSlug(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "")
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

function exportActivitiesCsv(activities: ActivityItem[]) {
  const headers = [
    "Tên hoạt động",
    "Trạng thái",
    "Cấp",
    "Tiêu chí",
    "Đơn vị",
    "Ngày bắt đầu",
    "Ngày kết thúc",
    "Sinh viên",
    "Minh chứng",
    "Chờ duyệt",
    "Điểm",
  ]
  const rows = activities.map((activity) => [
    activity.title ?? "",
    activity.isActive ? "Hoạt động" : "Nháp",
    activity.reviewLevel ? REVIEW_LEVELS[activity.reviewLevel] ?? activity.reviewLevel : "",
    activity.criteria?.map((c) => CRITERIA[c] ?? c).join("; ") ?? "",
    activity.organizer ?? activity.unitName ?? "",
    activity.startDate ?? "",
    activity.endDate ?? "",
    activity.participantCount ?? 0,
    activity.evidenceCount ?? 0,
    activity.pendingEvidenceCount ?? 0,
    activity.totalScore ?? 0,
  ])
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n")
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "hoat-dong.csv"
  link.click()
  URL.revokeObjectURL(url)
}

function ActivityViewDialog({
  activity,
  open,
  onOpenChange,
}: {
  activity: ActivityItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!activity) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{activity.title || "Chi tiết hoạt động"}</DialogTitle>
          <DialogDescription>
            Thông tin quản trị, số liệu minh chứng và cấu hình điểm của hoạt động
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2 sm:grid-cols-2">
          <div>
            <div className="text-xs font-medium text-muted-foreground">Trạng thái</div>
            <Badge variant={activity.isActive ? "success" : "secondary"} className="mt-1">
              {activity.isActive ? "Đang hoạt động" : "Nháp"}
            </Badge>
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">Cấp xét</div>
            <div className="mt-1 text-sm">
              {activity.reviewLevel ? REVIEW_LEVELS[activity.reviewLevel] ?? activity.reviewLevel : "Chưa chọn"}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">Đơn vị tổ chức</div>
            <div className="mt-1 text-sm">{activity.organizer || activity.unitName || "Chưa có"}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">Người tạo</div>
            <div className="mt-1 text-sm">{activity.createdByName || "Chưa ghi nhận"}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">Sinh viên tham gia</div>
            <div className="mt-1 text-sm">{activity.participantCount ?? 0}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">Minh chứng</div>
            <div className="mt-1 text-sm">
              {activity.evidenceCount ?? 0} tổng, {activity.pendingEvidenceCount ?? 0} chờ duyệt
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">Điểm quy đổi</div>
            <div className="mt-1 text-sm">{activity.totalScore ?? 0}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">Thời gian</div>
            <div className="mt-1 text-sm">
              {activity.startDate || "Chưa có"} {activity.endDate ? `-> ${activity.endDate}` : ""}
            </div>
          </div>
          <div className="sm:col-span-2">
            <div className="text-xs font-medium text-muted-foreground">Tiêu chí</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {activity.criteria?.length ? (
                activity.criteria.map((criterion) => (
                  <Badge key={criterion} variant="outline">
                    {CRITERIA[criterion] ?? criterion}
                  </Badge>
                ))
              ) : (
                <Badge variant="secondary">Chưa phân loại</Badge>
              )}
            </div>
          </div>
          <div className="sm:col-span-2">
            <div className="text-xs font-medium text-muted-foreground">Mô tả</div>
            <div className="mt-1 text-sm text-muted-foreground">
              {activity.shortDescription || "Chưa có mô tả ngắn"}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ConfirmDeleteDialog({
  open,
  title,
  description,
  isPending,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  title: string
  description: string
  isPending: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Hủy
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isPending}>
            Xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function AdminActivitiesPage() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [criteriaFilter, setCriteriaFilter] = useState<CriteriaFilter>("all")
  const [reviewLevelFilter, setReviewLevelFilter] = useState<ReviewLevelFilter>("all")
  const [unitFilter, setUnitFilter] = useState("all")
  const [startDateFrom, setStartDateFrom] = useState("")
  const [startDateTo, setStartDateTo] = useState("")
  const [sort, setSort] = useState<ListAdminActivitiesSortType>("createdAt_desc")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewingActivity, setViewingActivity] = useState<ActivityItem | null>(null)
  const [deletingActivity, setDeletingActivity] = useState<ActivityItem | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<ActivityItem | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const queryParams = useMemo<ListAdminActivitiesParams>(
    () => ({
      page,
      pageSize,
      search: searchQuery.trim() || undefined,
      status: statusFilter === "all" ? undefined : ListAdminActivitiesStatus[statusFilter],
      criteria: criteriaFilter === "all" ? undefined : ListAdminActivitiesCriteria[criteriaFilter],
      reviewLevel:
        reviewLevelFilter === "all"
          ? undefined
          : ListAdminActivitiesReviewLevel[reviewLevelFilter],
      unitId: unitFilter === "all" ? undefined : unitFilter,
      startDateFrom: startDateFrom || undefined,
      startDateTo: startDateTo || undefined,
      sort,
    }),
    [
      page,
      pageSize,
      searchQuery,
      statusFilter,
      criteriaFilter,
      reviewLevelFilter,
      unitFilter,
      startDateFrom,
      startDateTo,
      sort,
    ],
  )

  const activitiesQuery = useListAdminActivities(queryParams, {
    query: { retry: false, refetchOnWindowFocus: false },
  })
  const unitsQuery = useListUnits({ query: { retry: false, refetchOnWindowFocus: false } })
  const createMutation = useCreateActivity()
  const updateMutation = useUpdateActivity()
  const deleteMutation = useDeleteActivity()

  const [formData, setFormData] = useState<CreateActivityRequest>({
    title: "",
    slug: "",
    thumbnailUrl: "",
    shortDescription: "",
    description: "",
    organizer: "",
    startDate: "",
    endDate: "",
    registrationUrl: "",
    isActive: true,
    criteria: [],
  })

  const activities = useMemo<ActivityItem[]>(
    () => (activitiesQuery.data?.data ?? []) as ActivityItem[],
    [activitiesQuery.data],
  )
  const units = useMemo<UnitItem[]>(
    () => (unitsQuery.data?.data ?? []) as UnitItem[],
    [unitsQuery.data],
  )
  const meta = activitiesQuery.data?.meta
  const totalItems = meta?.total ?? activities.length
  const totalPages = meta?.totalPages ?? 1

  const resetPage = () => setPage(1)
  const invalidateActivities = () => {
    queryClient.invalidateQueries({ queryKey: ["/admin/activities"] })
    queryClient.invalidateQueries({ queryKey: ["/activities"] })
  }

  const handleOpenCreate = () => {
    setEditingActivity(null)
    setFormData({
      title: "",
      slug: "",
      thumbnailUrl: "",
      shortDescription: "",
      description: "",
      organizer: "",
      startDate: "",
      endDate: "",
      registrationUrl: "",
      isActive: true,
      criteria: [],
    })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (activity: ActivityItem) => {
    setEditingActivity(activity)
    setFormData({
      title: activity.title || "",
      slug: activity.slug || "",
      thumbnailUrl: activity.thumbnailUrl || "",
      shortDescription: activity.shortDescription || "",
      description: "",
      organizer: activity.organizer || "",
      startDate: activity.startDate || "",
      endDate: activity.endDate || "",
      registrationUrl: activity.registrationUrl || "",
      isActive: activity.isActive ?? true,
      criteria: activity.criteria || [],
    })
    setIsDialogOpen(true)
  }

  const handleDeleteConfirmed = async () => {
    if (!deletingActivity?.id) return

    try {
      await deleteMutation.mutateAsync({ id: deletingActivity.id })
      toast.success("Xóa hoạt động thành công")
      setDeletingActivity(null)
      setSelectedIds((current) => current.filter((id) => id !== deletingActivity.id))
      invalidateActivities()
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể xóa hoạt động"))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return

    try {
      await Promise.all(selectedIds.map((id) => deleteMutation.mutateAsync({ id })))
      toast.success("Đã xóa các hoạt động đã chọn")
      setSelectedIds([])
      setBulkDeleteOpen(false)
      invalidateActivities()
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể xóa hàng loạt"))
    }
  }

  const handleBulkStatus = async (isActive: boolean) => {
    if (selectedIds.length === 0) return

    try {
      await Promise.all(
        selectedIds.map((id) =>
          updateMutation.mutateAsync({
            id,
            data: { isActive },
          }),
        ),
      )
      toast.success(isActive ? "Đã bật các hoạt động đã chọn" : "Đã chuyển các hoạt động sang nháp")
      setSelectedIds([])
      invalidateActivities()
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể đổi trạng thái hàng loạt"))
    }
  }

  const handleSubmit = async (e: React.FormEvent, data?: CreateActivityRequest) => {
    e.preventDefault()
    const payload = data ?? formData

    try {
      if (editingActivity?.id) {
        await updateMutation.mutateAsync({
          id: editingActivity.id,
          data: payload,
        })
        toast.success("Cập nhật hoạt động thành công")
      } else {
        await createMutation.mutateAsync({
          data: { ...payload, slug: payload.slug || toSlug(payload.title) },
        })
        toast.success("Tạo hoạt động thành công")
      }
      setIsDialogOpen(false)
      invalidateActivities()
    } catch (error) {
      toast.error(getErrorMessage(error, "Có lỗi xảy ra"))
    }
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setPage(1)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setCriteriaFilter("all")
    setReviewLevelFilter("all")
    setUnitFilter("all")
    setStartDateFrom("")
    setStartDateTo("")
    setSort("createdAt_desc")
    setPage(1)
  }

  const toggleSelected = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  const isBulkPending = updateMutation.isPending || deleteMutation.isPending

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Quản lý hoạt động</h1>
            <p className="text-muted-foreground">Thêm, sửa, xóa và theo dõi hoạt động</p>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={() => exportActivitiesCsv(activities)} className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button onClick={handleOpenCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Thêm hoạt động
            </Button>
          </div>
        </div>

        <div className="mb-4">
          <ActivityFilters
            searchQuery={searchQuery}
            onSearchChange={(v) => {
              setSearchQuery(v)
              resetPage()
            }}
            statusFilter={statusFilter}
            onStatusFilterChange={(v) => {
              setStatusFilter(v as StatusFilter)
              resetPage()
            }}
            criteriaFilter={criteriaFilter}
            onCriteriaFilterChange={(v) => {
              setCriteriaFilter(v as CriteriaFilter)
              resetPage()
            }}
            reviewLevelFilter={reviewLevelFilter}
            onReviewLevelFilterChange={(v) => {
              setReviewLevelFilter(v as ReviewLevelFilter)
              resetPage()
            }}
            unitFilter={unitFilter}
            onUnitFilterChange={(v) => {
              setUnitFilter(v)
              resetPage()
            }}
            startDateFrom={startDateFrom}
            onStartDateFromChange={(v) => {
              setStartDateFrom(v)
              resetPage()
            }}
            startDateTo={startDateTo}
            onStartDateToChange={(v) => {
              setStartDateTo(v)
              resetPage()
            }}
            units={units}
            onClear={clearFilters}
          />
        </div>

        {selectedIds.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
            <div className="text-sm font-medium">Đã chọn {selectedIds.length} hoạt động</div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={isBulkPending}
                onClick={() => handleBulkStatus(true)}
                className="gap-1"
              >
                <ToggleRight className="h-4 w-4" />
                Bật hoạt động
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={isBulkPending}
                onClick={() => handleBulkStatus(false)}
                className="gap-1"
              >
                <ToggleLeft className="h-4 w-4" />
                Chuyển nháp
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportActivitiesCsv(activities.filter((a) => a.id && selectedIds.includes(a.id)))}
                className="gap-1"
              >
                <Download className="h-4 w-4" />
                Export chọn
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={isBulkPending}
                onClick={() => setBulkDeleteOpen(true)}
                className="gap-1"
              >
                <Trash2 className="h-4 w-4" />
                Xóa chọn
              </Button>
            </div>
          </div>
        )}

        <ActivityTable
          activities={activities}
          selectedIds={selectedIds}
          startIndex={(page - 1) * pageSize}
          sort={sort}
          onSortChange={(value) => {
            setSort(value)
            resetPage()
          }}
          onToggleSelected={toggleSelected}
          onView={setViewingActivity}
          onEdit={handleOpenEdit}
          onDelete={setDeletingActivity}
          isLoading={activitiesQuery.isLoading}
        />

        <ActivityPagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
        />

        <ActivityDialog
          key={`${editingActivity?.id ?? "create"}-${isDialogOpen ? "open" : "closed"}`}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          editingActivity={editingActivity}
          formData={formData}
          onFormDataChange={setFormData}
          onSubmit={handleSubmit}
          isPending={createMutation.isPending || updateMutation.isPending}
        />

        <ActivityViewDialog
          open={Boolean(viewingActivity)}
          activity={viewingActivity}
          onOpenChange={(open) => !open && setViewingActivity(null)}
        />

        <ConfirmDeleteDialog
          open={Boolean(deletingActivity)}
          title="Xóa hoạt động?"
          description={`Bạn có chắc muốn xóa hoạt động "${deletingActivity?.title ?? ""}"? Hành động này không thể hoàn tác.`}
          isPending={deleteMutation.isPending}
          onOpenChange={(open) => !open && setDeletingActivity(null)}
          onConfirm={handleDeleteConfirmed}
        />

        <ConfirmDeleteDialog
          open={bulkDeleteOpen}
          title="Xóa các hoạt động đã chọn?"
          description={`Bạn có chắc muốn xóa ${selectedIds.length} hoạt động đã chọn?`}
          isPending={deleteMutation.isPending}
          onOpenChange={setBulkDeleteOpen}
          onConfirm={handleBulkDelete}
        />
      </div>
    </div>
  )
}
