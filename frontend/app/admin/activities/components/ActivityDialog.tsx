"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CRITERIA, type CriterionType, REVIEW_LEVELS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { ActivityItem, CreateActivityRequest, ActivityItemReviewLevel } from "@/services/generated/api"

interface ActivityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingActivity: ActivityItem | null
  formData: CreateActivityRequest
  onFormDataChange: (data: CreateActivityRequest) => void
  onSubmit: (e: React.FormEvent) => void
  isPending: boolean
}

export function ActivityDialog({
  open,
  onOpenChange,
  editingActivity,
  formData,
  onFormDataChange,
  onSubmit,
  isPending,
}: ActivityDialogProps) {
  const set = (field: keyof CreateActivityRequest, value: unknown) => {
    onFormDataChange({ ...formData, [field]: value })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editingActivity ? "Sửa hoạt động" : "Thêm hoạt động mới"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit}>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Tên hoạt động</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="Nhập tên hoạt động"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => set("slug", e.target.value)}
                  placeholder="ten-hoat-dong"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 py-2 px-3 border rounded-md bg-slate-50/50">
              <Label htmlFor="isActive" className="flex-1 cursor-pointer">Trạng thái hoạt động</Label>
              <Badge
                variant={formData.isActive ? "success" : "secondary"}
                className="cursor-pointer"
                onClick={() => set("isActive", !formData.isActive)}
              >
                {formData.isActive ? "Đang hoạt động" : "Nháp"}
              </Badge>
            </div>

<div className="space-y-2">
                <Label htmlFor="shortDescription">Mô tả ngắn</Label>
                <Input
                  id="shortDescription"
                  value={formData.shortDescription || ""}
                  onChange={(e) => set("shortDescription", e.target.value)}
                  placeholder="Nhập mô tả ngắn"
                />
              </div>

            <div className="space-y-2">
              <Label htmlFor="reviewLevel">Cấp xét duyệt</Label>
              <Select
                value={formData.reviewLevel || "all"}
                onValueChange={(v) => set("reviewLevel", v === "all" ? undefined : v as ActivityItemReviewLevel)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn cấp xét duyệt" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả cấp</SelectItem>
                  {Object.entries(REVIEW_LEVELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tiêu chí (Chọn nhiều)</Label>
              <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-slate-50/50">
                {Object.entries(CRITERIA).map(([key, label]) => {
                  const isSelected = formData.criteria?.includes(key as CriterionType)
                  return (
                    <Badge
                      key={key}
                      variant={isSelected ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer transition-all",
                        isSelected ? "bg-primary text-white" : "hover:bg-slate-100"
                      )}
                      onClick={() => {
                        const current = formData.criteria || []
                        const next = current.includes(key as CriterionType)
                          ? current.filter((k) => k !== key)
                          : [...current, key as CriterionType]
                        set("criteria", next)
                      }}
                    >
                      {label}
                    </Badge>
                  )
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizer">Đơn vị tổ chức</Label>
              <Input
                id="organizer"
                value={formData.organizer || ""}
                onChange={(e) => set("organizer", e.target.value)}
                placeholder="Nhập đơn vị tổ chức"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Ngày bắt đầu</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate || ""}
                  onChange={(e) => set("startDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Ngày kết thúc</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate || ""}
                  onChange={(e) => set("endDate", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="registrationUrl">Link đăng ký</Label>
              <Input
                id="registrationUrl"
                value={formData.registrationUrl || ""}
                onChange={(e) => set("registrationUrl", e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả chi tiết</Label>
              <textarea
                id="description"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.description || ""}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Nhập mô tả chi tiết"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingActivity ? "Lưu thay đổi" : "Thêm hoạt động"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
