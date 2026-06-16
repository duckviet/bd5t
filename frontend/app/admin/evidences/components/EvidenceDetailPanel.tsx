"use client"

import { Calendar, RefreshCw, CheckCircle2, XCircle, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StudentAvatar } from "./StudentAvatar"
import { EvidenceFilePreview } from "./EvidenceFilePreview"
import { REVIEW_LEVELS, EVIDENCE_STATUS, CRITERIA } from "@/lib/constants"
import { getEvidenceCriteria, getEvidenceCriteriaLabel } from "@/features/profile/evidence-criteria"
import {
  EvidenceItemAwardLevel,
  ReviewEvidenceRequestAwardLevel,
  type EvidenceItem,
  type EvidenceItemStatus,
} from "@/services/generated/api"

type ReviewDecision = "approved" | "rejected"

interface EvidenceDetailPanelProps {
  evidence: EvidenceItem | null
  reviewNote: string
  awardLevel: ReviewEvidenceRequestAwardLevel
  isReviewing: boolean
  onReviewNoteChange: (value: string) => void
  onAwardLevelChange: (value: ReviewEvidenceRequestAwardLevel) => void
  onReview: (status: ReviewDecision) => void
}

const statusBadgeVariant: Record<
  EvidenceItemStatus,
  "success" | "secondary" | "destructive"
> = {
  pending: "secondary",
  approved: "success",
  rejected: "destructive",
}

function getStatusLabel(status?: string) {
  const key = (status ?? "pending").toUpperCase() as keyof typeof EVIDENCE_STATUS
  return EVIDENCE_STATUS[key] ?? status ?? "pending"
}

function formatDate(value?: string) {
  return value ? new Date(value).toLocaleDateString("vi-VN") : "Chưa xác định"
}

function getAwardLevelLabel(level?: string | null) {
  switch (level) {
    case "KHUYEN_KHICH":
      return "Khuyến khích"
    case "BA":
      return "Giải Ba"
    case "NHI":
      return "Giải Nhì"
    case "NHAT":
      return "Giải Nhất"
    case "NONE":
    default:
      return "Không có giải"
  }
}

export function EvidenceDetailPanel({
  evidence,
  reviewNote,
  awardLevel,
  isReviewing,
  onReviewNoteChange,
  onAwardLevelChange,
  onReview,
}: EvidenceDetailPanelProps) {
  if (!evidence) {
    return (
      <Card className="md:sticky md:top-24">
        <CardContent className="p-8 text-center text-muted-foreground">
          Chọn một minh chứng để xem chi tiết
        </CardContent>
      </Card>
    )
  }

  const status = (evidence.status ?? "pending") as EvidenceItemStatus

  return (
    <Card className="md:sticky md:top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
      <CardHeader className="border-b p-4">
        <CardTitle className="text-lg">Chi tiết minh chứng</CardTitle>
      </CardHeader>
      <CardContent className="relative p-0">
        <div className="space-y-5 p-4">
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
              <div className="flex flex-wrap gap-1.5">
                {(() => {
                  const criteriaList = getEvidenceCriteria(evidence, {}, [])
                  if (criteriaList.length === 0) {
                    return <Badge variant="outline">Chưa xác định tiêu chí</Badge>
                  }
                  return criteriaList.map((criterion) => (
                    <Badge key={criterion} variant="outline">
                      {CRITERIA[criterion]}
                    </Badge>
                  ))
                })()}
              </div>
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
              <div className="mb-1 text-sm font-medium">Cấp giải</div>
              <Badge variant="outline">{getAwardLevelLabel(evidence.awardLevel)}</Badge>
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

          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="award-level">
              Cấp giải
            </label>
            <Select
              value={awardLevel ?? ReviewEvidenceRequestAwardLevel.NONE}
              onValueChange={(value) => onAwardLevelChange(value as ReviewEvidenceRequestAwardLevel)}
              disabled={isReviewing || status !== "pending"}
            >
              <SelectTrigger id="award-level" className="bg-white">
                <SelectValue placeholder="Chọn cấp giải" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={EvidenceItemAwardLevel.NONE}>Không có giải</SelectItem>
                <SelectItem value={EvidenceItemAwardLevel.KHUYEN_KHICH}>Khuyến khích</SelectItem>
                <SelectItem value={EvidenceItemAwardLevel.BA}>Giải Ba</SelectItem>
                <SelectItem value={EvidenceItemAwardLevel.NHI}>Giải Nhì</SelectItem>
                <SelectItem value={EvidenceItemAwardLevel.NHAT}>Giải Nhất</SelectItem>
              </SelectContent>
            </Select>
            <div className="mt-1 text-xs text-muted-foreground">
              Chỉ áp dụng khi duyệt minh chứng.
            </div>
          </div>
        </div>

        {status === "pending" && (
          <div className="grid gap-2 sm:grid-cols-2 sticky bottom-0 p-4 bg-white border-t">
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
          <div className="rounded-md bg-muted p-3 mx-4 mb-4">
            <div className="text-sm font-medium">Ghi chú đã gửi</div>
            <div className="mt-1 text-sm text-muted-foreground">{evidence.reviewNote}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
