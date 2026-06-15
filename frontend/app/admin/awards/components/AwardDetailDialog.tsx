"use client"

import { useCallback, useMemo, useState } from "react"
import { toast } from "react-toastify"
import { RefreshCw, Search, X, User } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { AwardStatsBadge } from "./AwardStatsBadge"
import { AwardStudentDetailPanel } from "./AwardStudentDetailPanel"
import { BulkAwardDialog } from "./BulkAwardDialog"
import { cn } from "@/lib/utils"
import { CRITERIA } from "@/lib/constants"
import {
  AwardEvidenceInfoAwardLevel,
  BulkUpdateAwardLevelRequestAwardLevel,
  useBulkUpdateAwardLevel,
  type AwardActivityOverview,
  type AwardStudentOverview,
} from "@/services/generated/api"
import { useDebounce } from "@/hooks/use-debounce"

interface AwardDetailDialogProps {
  activity: AwardActivityOverview | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated: () => void
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

export function AwardDetailDialog({
  activity,
  open,
  onOpenChange,
  onUpdated,
}: AwardDetailDialogProps) {
  const bulkUpdateMutation = useBulkUpdateAwardLevel()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEvidenceIds, setSelectedEvidenceIds] = useState<string[]>([])
  const [selectedStudent, setSelectedStudent] = useState<AwardStudentOverview | null>(null)
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false)

  const debouncedSearch = useDebounce(searchQuery, 300)

  const filteredStudents = useMemo(() => {
    if (!activity?.students) return []
    if (!debouncedSearch.trim()) return activity.students
    const q = debouncedSearch.trim().toLowerCase()
    return activity.students.filter(
      (st) =>
        (st.userFullName?.toLowerCase() ?? "").includes(q) ||
        (st.userStudentId?.toLowerCase() ?? "").includes(q),
    )
  }, [activity?.students, debouncedSearch])

  const evidenceCount = useMemo(
    () => filteredStudents.reduce((sum, st) => sum + (st.evidences?.length ?? 0), 0),
    [filteredStudents],
  )

  const toggleEvidence = useCallback((evidenceId: string) => {
    setSelectedEvidenceIds((current) =>
      current.includes(evidenceId)
        ? current.filter((id) => id !== evidenceId)
        : [...current, evidenceId],
    )
  }, [])

  const toggleAll = useCallback(() => {
    const allIds = filteredStudents.flatMap(
      (st) => st.evidences?.map((ev) => ev.evidenceId).filter(Boolean) as string[],
    )
    const allSelected = allIds.every((id) => selectedEvidenceIds.includes(id))
    if (allSelected) {
      setSelectedEvidenceIds((current) => current.filter((id) => !allIds.includes(id)))
    } else {
      setSelectedEvidenceIds((current) => {
        const next = [...current]
        allIds.forEach((id) => {
          if (!next.includes(id)) next.push(id)
        })
        return next
      })
    }
  }, [filteredStudents, selectedEvidenceIds])

  const handleSingleUpdate = useCallback(
    async (evidenceId: string, awardLevel: string) => {
      try {
        await bulkUpdateMutation.mutateAsync({
          data: {
            ids: [evidenceId],
            awardLevel: awardLevel as BulkUpdateAwardLevelRequestAwardLevel,
          },
        })
        toast.success("Đã cập nhật cấp giải")
        onUpdated()
      } catch (error) {
        toast.error(getErrorMessage(error, "Không thể cập nhật cấp giải"))
      }
    },
    [bulkUpdateMutation, onUpdated],
  )

  const handleBulkUpdate = useCallback(
    async (awardLevel: string) => {
      if (selectedEvidenceIds.length === 0) return
      try {
        await bulkUpdateMutation.mutateAsync({
          data: {
            ids: selectedEvidenceIds,
            awardLevel: awardLevel as BulkUpdateAwardLevelRequestAwardLevel,
          },
        })
        toast.success(`Đã cập nhật cấp giải cho ${selectedEvidenceIds.length} minh chứng`)
        setSelectedEvidenceIds([])
        setBulkDialogOpen(false)
        onUpdated()
      } catch (error) {
        toast.error(getErrorMessage(error, "Không thể cập nhật cấp giải"))
      }
    },
    [selectedEvidenceIds, bulkUpdateMutation, onUpdated],
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-full max-h-[90vh] flex flex-col p-0 gap-0 rounded-2xl overflow-hidden">
        <DialogHeader className="shrink-0 border-b px-6 py-4">
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="text-lg font-bold truncate">
              {activity?.activityTitle ?? "Chi tiết"}
            </DialogTitle>
          </div>
          {activity && (
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <AwardStatsBadge stats={activity.awardStats} />
              <span className="text-xs text-muted-foreground">
                {activity.totalStudents} sinh viên
              </span>
              <span className="text-xs text-muted-foreground">
                {(activity.criteria ?? [])
                  .map((c) => CRITERIA[c as keyof typeof CRITERIA] ?? c)
                  .join(", ")}
              </span>
            </div>
          )}
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Left pane: student evidence table */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {/* Search */}
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm sinh viên..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setSelectedEvidenceIds([])
                }}
              />
            </div>

            {/* Student table */}
            {filteredStudents.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-sm text-muted-foreground">
                  {debouncedSearch.trim()
                    ? "Không tìm thấy sinh viên phù hợp"
                    : "Chưa có sinh viên nào được duyệt minh chứng"}
                </CardContent>
              </Card>
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <table className="min-w-full divide-y divide-border text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="w-10 px-4 py-2.5">
                        <input
                          type="checkbox"
                          checked={
                            evidenceCount > 0 &&
                            filteredStudents
                              .flatMap((st) => st.evidences ?? [])
                              .every((ev) => selectedEvidenceIds.includes(ev.evidenceId ?? ""))
                          }
                          onChange={toggleAll}
                          className="h-4 w-4 rounded border-border"
                          aria-label="Chọn tất cả"
                        />
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                        Sinh viên
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                        Mã SV
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                        Lớp
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                        Tiêu chí
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                        Cấp giải
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                        Điểm
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50 bg-white">
                    {filteredStudents.map((student) => {
                      const isThisStudent = selectedStudent?.userId === student.userId
                      return (student.evidences ?? []).map((evidence, evIdx) => {
                        const isChecked = Boolean(
                          evidence.evidenceId &&
                            selectedEvidenceIds.includes(evidence.evidenceId),
                        )

                        return (
                          <tr
                            key={evidence.evidenceId ?? `${student.userId}-${evIdx}`}
                            className={cn(
                              "transition-colors",
                              isChecked && "bg-primary/5",
                              isThisStudent && "bg-primary/10",
                            )}
                          >
                            <td className="px-4 py-2.5">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() =>
                                  evidence.evidenceId && toggleEvidence(evidence.evidenceId)
                                }
                                className="h-4 w-4 rounded border-border"
                                aria-label="Chọn"
                              />
                            </td>
                            <td className="px-4 py-2.5">
                              <button
                                type="button"
                                onClick={() => setSelectedStudent(
                                  selectedStudent?.userId === student.userId ? null : student,
                                )}
                                className="flex items-center gap-1.5 font-medium whitespace-nowrap text-left hover:text-primary transition-colors"
                              >
                                <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                {student.userFullName || "—"}
                              </button>
                            </td>
                            <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">
                              {student.userStudentId || "—"}
                            </td>
                            <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">
                              {student.className || "—"}
                            </td>
                            <td className="px-4 py-2.5">
                              <Badge variant="outline" className="text-xs">
                                {CRITERIA[evidence.criteria as keyof typeof CRITERIA] ??
                                  evidence.criteria}
                              </Badge>
                            </td>
                            <td className="px-4 py-2.5">
                              <AwardLevelSelect
                                value={evidence.awardLevel ?? AwardEvidenceInfoAwardLevel.NONE}
                                evidenceId={evidence.evidenceId ?? ""}
                                onChange={handleSingleUpdate}
                                disabled={bulkUpdateMutation.isPending}
                              />
                            </td>
                            <td className="px-4 py-2.5">{evidence.score ?? "—"}</td>
                          </tr>
                        )
                      })
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right pane: student detail panel */}
          <div className="w-[420px] shrink-0 border-l overflow-y-auto bg-white flex flex-col">
            {selectedStudent && activity ? (
              <AwardStudentDetailPanel
                activity={activity}
                student={selectedStudent}
                onClose={() => setSelectedStudent(null)}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-muted/5 select-none">
                <div className="p-4 rounded-full bg-muted/10 text-muted-foreground mb-4">
                  <User className="h-8 w-8 stroke-[1.5]" />
                </div>
                <h3 className="font-semibold text-sm text-foreground mb-1">
                  Chi tiết sinh viên
                </h3>
                <p className="text-xs text-muted-foreground max-w-[260px] leading-relaxed">
                  Chọn một sinh viên từ danh sách bên trái để xem chi tiết minh chứng và thông tin giải thưởng.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bulk action bar — sticky at bottom */}
        <div className="shrink-0 border-t bg-white px-6 py-3">
          {selectedEvidenceIds.length > 0 ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm font-medium">
                Đã chọn {selectedEvidenceIds.length} minh chứng
              </span>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedEvidenceIds([])}
                  disabled={bulkUpdateMutation.isPending}
                >
                  <X className="mr-1 h-4 w-4" />
                  Bỏ chọn
                </Button>
                <Button
                  size="sm"
                  onClick={() => setBulkDialogOpen(true)}
                  disabled={bulkUpdateMutation.isPending}
                  className="gap-1"
                >
                  {bulkUpdateMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : null}
                  Cập nhật giải hàng loạt
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground">
              Chọn minh chứng để cập nhật giải hàng loạt
            </div>
          )}
        </div>
      </DialogContent>

      <BulkAwardDialog
        open={bulkDialogOpen}
        count={selectedEvidenceIds.length}
        isPending={bulkUpdateMutation.isPending}
        onOpenChange={setBulkDialogOpen}
        onConfirm={handleBulkUpdate}
      />
    </Dialog>
  )
}

function AwardLevelSelect({
  value,
  evidenceId,
  onChange,
  disabled,
}: {
  value: string
  evidenceId: string
  onChange: (evidenceId: string, awardLevel: string) => void
  disabled: boolean
}) {
  const options = [
    { value: AwardEvidenceInfoAwardLevel.NONE, label: "Không có giải" },
    { value: AwardEvidenceInfoAwardLevel.KHUYEN_KHICH, label: "Khuyến khích" },
    { value: AwardEvidenceInfoAwardLevel.BA, label: "Ba" },
    { value: AwardEvidenceInfoAwardLevel.NHI, label: "Nhì" },
    { value: AwardEvidenceInfoAwardLevel.NHAT, label: "Nhất" },
  ]

  return (
    <select
      value={value ?? AwardEvidenceInfoAwardLevel.NONE}
      onChange={(e) => onChange(evidenceId, e.target.value)}
      disabled={disabled}
      className="max-w-[140px] rounded-md border border-input bg-white px-2 py-1 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
