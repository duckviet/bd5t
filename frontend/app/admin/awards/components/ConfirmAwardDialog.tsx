"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RefreshCw, Trophy } from "lucide-react"

interface ConfirmAwardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isPending: boolean
  studentName?: string
  awardLevel: string
}

const AWARD_LABELS: Record<string, string> = {
  NHAT: "Giải Nhất",
  NHI: "Giải Nhì",
  BA: "Giải Ba",
  KHUYEN_KHICH: "Khuyến khích",
  NONE: "Không có giải (Xóa giải)",
}

export function ConfirmAwardDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
  studentName,
  awardLevel,
}: ConfirmAwardDialogProps) {
  const awardLabel = AWARD_LABELS[awardLevel] || awardLevel

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="flex flex-col items-center text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <Trophy className="h-6 w-6" />
          </div>
          <DialogTitle className="text-lg font-bold">Xác nhận trao giải</DialogTitle>
          <DialogDescription className="mt-2 text-sm text-muted-foreground">
            {studentName ? (
              <>
                Bạn có chắc chắn muốn trao cấp giải <strong>{awardLabel}</strong> cho sinh viên <strong>{studentName}</strong>?
              </>
            ) : (
              <>
                Bạn có chắc chắn muốn cập nhật cấp giải cho minh chứng này thành <strong>{awardLabel}</strong>?
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4 gap-2 sm:justify-center">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Hủy
          </Button>
          <Button onClick={onConfirm} disabled={isPending} className="gap-2">
            {isPending && <RefreshCw className="h-4 w-4 animate-spin" />}
            Xác nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
