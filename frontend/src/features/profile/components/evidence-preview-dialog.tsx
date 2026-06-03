"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  ExternalLink,
  FileText,
  ImageIcon,
  Shield,
  Award,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react"
import {
  REVIEW_LEVELS,
  EVIDENCE_STATUS,
} from "@/lib/constants"
import type {
  ActivityItem,
  EvidenceItem,
  EvidenceItemStatus,
} from "@/services/generated/api"
import type { ActivityCriteriaMap } from "../types"
import { getEvidenceCriteriaLabel } from "../evidence-criteria"

interface EvidencePreviewDialogProps {
  evidence: EvidenceItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  activityCriteriaMap: ActivityCriteriaMap
  activities: ActivityItem[]
  statusBadgeVariant: Record<
    string,
    "success" | "secondary" | "destructive"
  >
}

function getFileKind(fileUrl?: string) {
  const cleanUrl = fileUrl?.split("?")[0].toLowerCase() ?? ""
  if (/\.(png|jpe?g|webp|gif)$/i.test(cleanUrl)) return "image"
  if (/\.pdf$/i.test(cleanUrl)) return "pdf"
  return "other"
}

function formatDate(value?: string) {
  if (!value) return "Chưa xác định"
  return new Date(value).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function EvidencePreviewDialog({
  evidence,
  open,
  onOpenChange,
  activityCriteriaMap,
  activities,
}: EvidencePreviewDialogProps) {
  if (!evidence) return null

  const status = (evidence.status ?? "pending") as EvidenceItemStatus
  const kind = getFileKind(evidence.fileUrl)

  const statusColors = {
    pending: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    approved: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    rejected: "text-rose-500 bg-rose-500/10 border-rose-500/20",
  }

  const StatusIcon = {
    pending: Clock,
    approved: CheckCircle,
    rejected: XCircle,
  }[status] || Clock

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-6 rounded-2xl border bg-background/95 backdrop-blur-md shadow-2xl overflow-hidden">
        <DialogHeader className="border-b pb-4 shrink-0">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColors[status]}`}>
                <StatusIcon className="h-3.5 w-3.5" />
                {EVIDENCE_STATUS[status.toUpperCase() as keyof typeof EVIDENCE_STATUS] ?? status}
              </span>
              <Badge variant="outline" className="text-xs font-medium">
                {REVIEW_LEVELS[evidence.reviewLevel || "TRUONG"]}
              </Badge>
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight mt-1">
              {evidence.activityTitle || evidence.description || "Chi tiết minh chứng"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <Calendar className="h-3.5 w-3.5" />
              Nộp lúc: {formatDate(evidence.createdAt)}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1">
          {/* Info Section */}
          <div className="grid gap-4 sm:grid-cols-2 bg-muted/40 p-4 rounded-xl border">
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Shield className="h-3.5 w-3.5 text-primary" />
                Tiêu chí áp dụng
              </div>
              <div className="mt-1.5 text-sm font-semibold text-foreground">
                {getEvidenceCriteriaLabel(evidence, activityCriteriaMap, activities)}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Award className="h-3.5 w-3.5 text-primary" />
                Điểm quy đổi
              </div>
              <div className="mt-1.5 text-sm font-semibold text-foreground">
                {evidence.score !== undefined && evidence.score !== null ? `${evidence.score} điểm` : "Chờ phê duyệt điểm"}
              </div>
            </div>

            {evidence.description && (
              <div className="sm:col-span-2 border-t pt-3">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Mô tả / Ghi chú của bạn
                </div>
                <div className="mt-1.5 text-sm text-foreground/90 whitespace-pre-wrap">
                  {evidence.description}
                </div>
              </div>
            )}

            {/* Review feedback */}
            {evidence.reviewNote && (
              <div className="sm:col-span-2 border-t pt-3 bg-amber-500/5 p-3 rounded-lg border border-amber-500/10">
                <div className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                  Phản hồi từ người duyệt
                </div>
                <div className="mt-1.5 text-sm text-amber-800 font-medium whitespace-pre-wrap">
                  {evidence.reviewNote}
                </div>
                {evidence.reviewedAt && (
                  <div className="mt-2 text-[10px] text-amber-600/70">
                    Người duyệt đã phản hồi vào lúc: {formatDate(evidence.reviewedAt)}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* File Preview Section */}
          <div className="space-y-3">
            <div className="text-sm font-semibold text-foreground flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-primary" />
                Tệp minh chứng đính kèm
              </span>
              {evidence.fileUrl && (
                <Button variant="ghost" size="sm" asChild className="h-8 gap-1.5 text-xs text-primary hover:text-primary ">
                  <a href={evidence.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5">
                    Mở trong tab mới
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              )}
            </div>

            <div className="relative border rounded-xl overflow-hidden bg-muted flex items-center justify-center min-h-[300px] max-h-[480px]">
              {evidence.fileUrl ? (
                <>
                  {kind === "image" && (
                    <img
                      src={evidence.fileUrl}
                      alt="Minh chứng"
                      className="max-h-[480px] w-full object-contain animate-in fade-in zoom-in-95 duration-200"
                    />
                  )}
                  {kind === "pdf" && (
                    <iframe
                      src={evidence.fileUrl}
                      title="Preview minh chứng PDF"
                      className="absolute inset-0 h-full w-full bg-white border-0"
                    />
                  )}
                  {kind === "other" && (
                    <div className="flex flex-col items-center gap-3 p-6 text-center text-muted-foreground">
                      <div className="h-12 w-12 rounded-full bg-muted-foreground/10 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-foreground">
                          Không hỗ trợ preview trực tiếp
                        </p>
                        <p className="text-xs mt-1 max-w-[280px]">
                          Vui lòng bấm nút mở tab mới để tải về hoặc xem định dạng file này.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-sm text-muted-foreground p-6">
                  Không có file đính kèm
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
