"use client"

import { useState } from "react"
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BulkUpdateAwardLevelRequestAwardLevel } from "@/services/generated/api"
import { RefreshCw } from "lucide-react"

interface BulkAwardDialogProps {
  open: boolean
  count: number
  isPending: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (awardLevel: string) => void
}

const AWARD_OPTIONS = [
  { value: BulkUpdateAwardLevelRequestAwardLevel.NHAT, label: "Giải Nhất" },
  { value: BulkUpdateAwardLevelRequestAwardLevel.NHI, label: "Giải Nhì" },
  { value: BulkUpdateAwardLevelRequestAwardLevel.BA, label: "Giải Ba" },
  { value: BulkUpdateAwardLevelRequestAwardLevel.KHUYEN_KHICH, label: "Khuyến khích" },
  { value: BulkUpdateAwardLevelRequestAwardLevel.NONE, label: "Xóa giải" },
]

export function BulkAwardDialog({
  open,
  count,
  isPending,
  onOpenChange,
  onConfirm,
}: BulkAwardDialogProps) {
  const [awardLevel, setAwardLevel] = useState<string>(AWARD_OPTIONS[0].value)

  const handleConfirm = () => {
    onConfirm(awardLevel)
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Cập nhật giải thưởng hàng loạt</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Bạn sắp cập nhật cấp giải cho <strong>{count}</strong> minh chứng đã được duyệt.
            Hành động này sẽ ghi đè cấp giải hiện tại.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Chọn cấp giải</label>
            <Select value={awardLevel} onValueChange={(value) => setAwardLevel(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AWARD_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <ResponsiveDialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Hủy
          </Button>
          <Button onClick={handleConfirm} disabled={isPending} className="gap-2">
            {isPending && <RefreshCw className="h-4 w-4 animate-spin" />}
            Cập nhật {count} minh chứng
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  )
}
