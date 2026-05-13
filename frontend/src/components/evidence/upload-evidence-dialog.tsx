"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Upload, File, X, FileText } from "lucide-react"

interface UploadEvidenceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const mockActivities = [
  { id: "act_1", title: "Cuộc thi Olympic Tin học cấp Trường" },
  { id: "act_2", title: "Hội thảo Nghiên cứu Khoa học" },
  { id: "act_3", title: "Giải chạy Vì sức khỏe cộng đồng" },
  { id: "act_4", title: "Chiến dịch Mùa hè xanh" },
  { id: "act_5", title: "Cuộc thi Hùng biện tiếng Anh" },
]

export function UploadEvidenceDialog({ open, onOpenChange }: UploadEvidenceDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [description, setDescription] = useState("")
  const [activityId, setActivityId] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return
    setFile(selectedFile)
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target?.result as string)
      reader.readAsDataURL(selectedFile)
    } else {
      setPreview(null)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) handleFileChange(droppedFile)
  }

  const handleRemoveFile = () => {
    setFile(null)
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleUpload = () => {
    // TODO: integrate with actual API
    console.log({ file, description, activityId })
    handleRemoveFile()
    setDescription("")
    setActivityId("")
    onOpenChange(false)
  }

  const fileSizeMB = file ? (file.size / (1024 * 1024)).toFixed(2) : "0"
  const isPDF = file?.type === "application/pdf"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Tải lên minh chứng</DialogTitle>
          <DialogDescription>
            Chọn tệp minh chứng và thông tin liên quan
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="activity">Hoạt động</Label>
            <Select value={activityId} onValueChange={setActivityId}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn hoạt động" />
              </SelectTrigger>
              <SelectContent>
                {mockActivities.map((act) => (
                  <SelectItem key={act.id} value={act.id}>
                    {act.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tệp minh chứng</Label>
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/30"
              }`}
            >
              {file ? (
                <div className="space-y-3">
                  {preview ? (
                    <div className="relative mx-auto h-32 w-48 overflow-hidden rounded-lg">
                      <img
                        src={preview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : isPDF ? (
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-xl bg-destructive/10">
                      <FileText className="h-10 w-10 text-destructive" />
                    </div>
                  ) : (
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-xl bg-primary/10">
                      <File className="h-10 w-10 text-primary" />
                    </div>
                  )}
                  <div className="text-sm font-medium">{file.name}</div>
                  <div className="text-xs text-muted-foreground">{fileSizeMB} MB</div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-1 text-destructive hover:text-destructive"
                    onClick={(e) => { e.stopPropagation(); handleRemoveFile() }}
                  >
                    <X className="h-4 w-4" />
                    Xoá tệp
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-muted">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-primary">Nhấp để chọn</span> hoặc kéo thả tệp vào đây
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Hỗ trợ: JPG, PNG, PDF (tối đa 10MB)
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Input
              id="description"
              placeholder="Mô tả ngắn về minh chứng..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleUpload} disabled={!file || !activityId} className="gap-2">
            <Upload className="h-4 w-4" />
            Tải lên
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
