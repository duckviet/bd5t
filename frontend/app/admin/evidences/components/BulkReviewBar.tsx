"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, X, RefreshCw, CheckCircle2, XCircle } from "lucide-react"

type ReviewDecision = "approved" | "rejected"

interface BulkReviewBarProps {
  count: number
  note: string
  isSubmitting: boolean
  onNoteChange: (value: string) => void
  onSubmit: (status: ReviewDecision) => void
  onClear: () => void
  onExport: () => void
}

export function BulkReviewBar({
  count,
  note,
  isSubmitting,
  onNoteChange,
  onSubmit,
  onClear,
  onExport,
}: BulkReviewBarProps) {
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
