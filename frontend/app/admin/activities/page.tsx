"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

import {
  useListActivities,
  useCreateActivity,
  useUpdateActivity,
  useDeleteActivity,
  type ActivityItem,
  type ActivityItemCriteriaItem,
  type CreateActivityRequest,
} from "@/services/generated/api"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "react-toastify"

import { ActivityTable, ActivityFilters, ActivityPagination, ActivityDialog } from "./components"

export default function AdminActivitiesPage() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [criteriaFilter, setCriteriaFilter] = useState<string[]>([])
  const [reviewLevelFilter, setReviewLevelFilter] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<ActivityItem | null>(null)

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const { data: _apiResponse, isLoading } = useListActivities({
    pageSize: 100,
  })

  const createMutation = useCreateActivity()
  const updateMutation = useUpdateActivity()
  const deleteMutation = useDeleteActivity()

  const [formData, setFormData] = useState<CreateActivityRequest>({
    title: "",
    slug: "",
    shortDescription: "",
    description: "",
    organizer: "",
    startDate: "",
    endDate: "",
    registrationUrl: "",
    isActive: true,
    criteria: [],
  })

  const activities: ActivityItem[] = useMemo(
    () => (_apiResponse as { data: ActivityItem[] })?.data || [],
    [_apiResponse],
  )

  const filteredActivities = useMemo(() => {
    return activities.filter((a) => {
      const matchSearch = a.title?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && a.isActive) ||
        (statusFilter === "inactive" && !a.isActive)
      const matchCriteria =
        criteriaFilter.length === 0 ||
        criteriaFilter.some((c) => a.criteria?.includes(c as ActivityItemCriteriaItem))
      const matchReviewLevel =
        reviewLevelFilter === "all" || a.reviewLevel === reviewLevelFilter
      return matchSearch && matchStatus && matchCriteria && matchReviewLevel
    })
  }, [activities, searchQuery, statusFilter, criteriaFilter, reviewLevelFilter])

  const totalPages = Math.max(1, Math.ceil(filteredActivities.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const paginatedActivities = filteredActivities.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  )

  const handleOpenCreate = () => {
    setEditingActivity(null)
    setFormData({
      title: "",
      slug: "",
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
      shortDescription: activity.shortDescription || "",
      description: "",
      organizer: activity.organizer || "",
      startDate: activity.startDate || "",
      endDate: activity.endDate || "",
      registrationUrl: "",
      isActive: activity.isActive ?? true,
      criteria: activity.criteria || [],
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa hoạt động này?")) return

    try {
      await deleteMutation.mutateAsync({ id })
      toast.success("Xóa hoạt động thành công")
      queryClient.invalidateQueries({ queryKey: ["/activities"] })
    } catch {
      toast.error("Không thể xóa hoạt động")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingActivity?.id) {
        await updateMutation.mutateAsync({
          id: editingActivity.id,
          data: formData,
        })
        toast.success("Cập nhật hoạt động thành công")
      } else {
        const slug =
          formData.slug ||
          formData.title
            .toLowerCase()
            .replace(/ /g, "-")
            .replace(/[^\w-]+/g, "")
        await createMutation.mutateAsync({
          data: { ...formData, slug },
        })
        toast.success("Tạo hoạt động thành công")
      }
      setIsDialogOpen(false)
      queryClient.invalidateQueries({ queryKey: ["/activities"] })
    } catch {
      toast.error("Có lỗi xảy ra")
    }
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setPage(1)
  }

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Quản lý hoạt động</h1>
            <p className="text-muted-foreground">
              Thêm, sửa, xóa hoạt động
            </p>
          </div>
          <Button onClick={handleOpenCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Thêm hoạt động
          </Button>
        </div>

        <div className="mb-4">
          <ActivityFilters
            searchQuery={searchQuery}
            onSearchChange={(v) => { setSearchQuery(v); setPage(1) }}
            statusFilter={statusFilter}
            onStatusFilterChange={(v) => { setStatusFilter(v); setPage(1) }}
            criteriaFilter={criteriaFilter}
            onCriteriaFilterChange={(v) => { setCriteriaFilter(v); setPage(1) }}
            reviewLevelFilter={reviewLevelFilter}
            onReviewLevelFilterChange={(v) => { setReviewLevelFilter(v); setPage(1) }}
          />
        </div>

        <ActivityTable
          activities={paginatedActivities}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          isLoading={isLoading}
        />

        <ActivityPagination
          currentPage={safePage}
          totalPages={totalPages}
          totalItems={filteredActivities.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
        />

        <ActivityDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          editingActivity={editingActivity}
          formData={formData}
          onFormDataChange={setFormData}
          onSubmit={handleSubmit}
          isPending={createMutation.isPending || updateMutation.isPending}
        />
      </div>
    </div>
  )
}
