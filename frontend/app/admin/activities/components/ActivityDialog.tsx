"use client"

import { useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImageIcon, Loader2, Upload, X } from "lucide-react"
import { toast } from "react-toastify"
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
import {
  uploadMedia,
  type ActivityItem,
  type CreateActivityRequest,
  type ActivityItemReviewLevel,
} from "@/services/generated/api"

interface ActivityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingActivity: ActivityItem | null
  formData: CreateActivityRequest
  onFormDataChange: (data: CreateActivityRequest) => void
  onSubmit: (e: React.FormEvent, data?: CreateActivityRequest) => void | Promise<void>
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
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailLocalPreview, setThumbnailLocalPreview] = useState<string | null>(null)
  const [isDraggingThumbnail, setIsDraggingThumbnail] = useState(false)
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)

  const set = (field: keyof CreateActivityRequest, value: unknown) => {
    onFormDataChange({ ...formData, [field]: value })
  }

  const handleThumbnailChange = (selectedFile: File | null) => {
    if (!selectedFile) return
    if (!selectedFile.type.startsWith("image/")) {
      toast.error("Thumbnail phải là tệp ảnh")
      return
    }

    setThumbnailFile(selectedFile)
    const reader = new FileReader()
    reader.onload = (event) => setThumbnailLocalPreview(event.target?.result as string)
    reader.readAsDataURL(selectedFile)
  }

  const handleThumbnailDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDraggingThumbnail(false)
    handleThumbnailChange(event.dataTransfer.files[0] ?? null)
  }

  const handleRemoveThumbnail = () => {
    setThumbnailFile(null)
    setThumbnailLocalPreview(null)
    set("thumbnailUrl", null)
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = ""
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!thumbnailFile) {
      await onSubmit(event, formData)
      return
    }

    setIsUploadingThumbnail(true)
    let nextFormData: CreateActivityRequest
    try {
      const uploadResponse = await uploadMedia({
        file: thumbnailFile,
        type: "thumbnail",
      })
      const thumbnailUrl = uploadResponse?.data?.url
      if (!thumbnailUrl) throw new Error("Upload thumbnail thất bại")

      nextFormData = { ...formData, thumbnailUrl }
      onFormDataChange(nextFormData)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không thể tải thumbnail lên"
      toast.error(message)
      return
    } finally {
      setIsUploadingThumbnail(false)
    }

    await onSubmit(event, nextFormData)
  }

  const thumbnailFileSize = thumbnailFile
    ? `${(thumbnailFile.size / (1024 * 1024)).toFixed(2)} MB`
    : ""
  const thumbnailPreview = thumbnailLocalPreview || formData.thumbnailUrl || null
  const isSubmitting = isPending || isUploadingThumbnail

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-0 p-0">
        <DialogHeader className="p-4">
          <DialogTitle>
            {editingActivity ? "Sửa hoạt động" : "Thêm hoạt động mới"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="">
          <div className="space-y-4 py-4 px-1 max-h-[60vh] overflow-y-auto px-4 py-2">
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

            <div className="space-y-2">
              <Label>Thumbnail hoạt động</Label>
              <div
                onDragOver={(event) => {
                  event.preventDefault()
                  setIsDraggingThumbnail(true)
                }}
                onDragLeave={() => setIsDraggingThumbnail(false)}
                onDrop={handleThumbnailDrop}
                onClick={() => thumbnailInputRef.current?.click()}
                className={cn(
                  "relative cursor-pointer rounded-lg border-2 border-dashed p-4 text-center transition-colors",
                  isDraggingThumbnail
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-muted/30",
                )}
              >
                {thumbnailPreview ? (
                  <div className="space-y-3">
                    <div className="relative mx-auto aspect-video max-h-48 overflow-hidden rounded-md bg-muted">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="text-sm font-medium">
                      {thumbnailFile?.name || "Thumbnail hiện tại"}
                    </div>
                    {thumbnailFileSize && (
                      <div className="text-xs text-muted-foreground">{thumbnailFileSize}</div>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-destructive hover:text-destructive"
                      onClick={(event) => {
                        event.stopPropagation()
                        handleRemoveThumbnail()
                      }}
                    >
                      <X className="h-4 w-4" />
                      Xóa thumbnail
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 py-4">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-muted">
                      <ImageIcon className="h-7 w-7 text-muted-foreground" />
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-primary">Nhấp để chọn</span> hoặc kéo thả ảnh vào đây
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Hỗ trợ: JPG, PNG, WEBP
                    </div>
                  </div>
                )}
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/*"
                  className="hidden"
                  onChange={(event) => handleThumbnailChange(event.target.files?.[0] ?? null)}
                />
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-md border bg-slate-50/50 px-3 py-2">
              <Label htmlFor="isActive" className="flex-1 cursor-pointer">
                Trạng thái hoạt động
              </Label>
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
                onValueChange={(v) =>
                  set("reviewLevel", v === "all" ? undefined : v as ActivityItemReviewLevel)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn cấp xét duyệt" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả cấp</SelectItem>
                  {Object.entries(REVIEW_LEVELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tiêu chí (Chọn nhiều)</Label>
              <div className="flex flex-wrap gap-2 rounded-md border bg-slate-50/50 p-3">
                {Object.entries(CRITERIA).map(([key, label]) => {
                  const isSelected = formData.criteria?.includes(key as CriterionType)
                  return (
                    <Badge
                      key={key}
                      variant={isSelected ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer transition-all",
                        isSelected ? "bg-primary text-white" : "hover:bg-slate-100",
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

          <DialogFooter className="p-4">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isUploadingThumbnail ? (
                <Upload className="mr-2 h-4 w-4 animate-pulse" />
              ) : (
                isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editingActivity ? "Lưu thay đổi" : "Thêm hoạt động"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
