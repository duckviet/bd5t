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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AwardStatsBadge } from "./AwardStatsBadge"
import { AwardStudentDetailPanel } from "./AwardStudentDetailPanel"
import { BulkAwardDialog } from "./BulkAwardDialog"
import { ConfirmAwardDialog } from "./ConfirmAwardDialog"
import { DataTable } from "@/components/ui/data-table"
import { getAwardDetailColumns, type AwardEvidenceRow } from "./award-detail.columns"
import { cn } from "@/lib/utils"
import {
  BulkUpdateAwardLevelRequestAwardLevel,
  useBulkUpdateAwardLevel,
  type AwardActivityOverview,
  type AwardStudentOverview,
} from "@/services/generated/api"
import { useDebounce } from "@/hooks/use-debounce"
import { CRITERIA } from "@/lib/constants"

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
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [pendingUpdate, setPendingUpdate] = useState<{
    evidenceId: string
    awardLevel: string
    studentName?: string
  } | null>(null)
  const [localAwardLevels, setLocalAwardLevels] = useState<Record<string, string>>({})

  const debouncedSearch = useDebounce(searchQuery, 300)

  const filteredStudents = useMemo(() => {
    if (!activity?.students) return []
    if (!debouncedSearch.trim()) return activity.students
    const q = debouncedSearch.trim().toLowerCase()
    return activity?.students.filter(
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

  const handleRowClick = useCallback((student: AwardStudentOverview, evidenceId: string) => {
    setSelectedStudent(student)
    toggleEvidence(evidenceId)
  }, [toggleEvidence])

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

  const currentSelectedStudent = useMemo(() => {
    if (!selectedStudent || !activity?.students) return null
    return activity?.students.find((st) => st.userId === selectedStudent.userId) || null
  }, [selectedStudent, activity?.students])

  const tableData = useMemo<AwardEvidenceRow[]>(() => {
    return filteredStudents.flatMap((student) =>
      (student.evidences ?? []).map((evidence, evIdx) => ({
        student,
        evidence,
        evIdx,
      })),
    )
  }, [filteredStudents])

  const handleSingleUpdate = useCallback(
    (evidenceId: string, awardLevel: string, studentName: string) => {
      setLocalAwardLevels((prev) => ({ ...prev, [evidenceId]: awardLevel }))
      setPendingUpdate({
        evidenceId,
        awardLevel,
        studentName,
      })
      setConfirmDialogOpen(true)
    },
    [],
  )

  const columns = useMemo(() => {
    return getAwardDetailColumns({
      selectedEvidenceIds,
      toggleEvidence,
      toggleAll,
      evidenceCount,
      filteredStudents,
      localAwardLevels,
      handleSingleUpdate,
      isPending: bulkUpdateMutation.isPending,
    })
  }, [
    selectedEvidenceIds,
    toggleEvidence,
    toggleAll,
    evidenceCount,
    filteredStudents,
    localAwardLevels,
    handleSingleUpdate,
    bulkUpdateMutation.isPending,
  ])

  const handleOpenChange = useCallback((val: boolean) => {
    if (!val) {
      setLocalAwardLevels({})
      setSelectedStudent(null)
      setSelectedEvidenceIds([])
    }
    onOpenChange(val)
  }, [onOpenChange])

  const confirmSingleUpdate = useCallback(async () => {
    if (!pendingUpdate) return
    try {
      await bulkUpdateMutation.mutateAsync({
        data: {
          ids: [pendingUpdate.evidenceId],
          awardLevel: pendingUpdate.awardLevel as BulkUpdateAwardLevelRequestAwardLevel,
        },
      })
      toast.success("Đã cập nhật cấp giải")
      setConfirmDialogOpen(false)
      setLocalAwardLevels((prev) => {
        const next = { ...prev }
        delete next[pendingUpdate.evidenceId]
        return next
      })
      setPendingUpdate(null)
      onUpdated()
    } catch (error) {
      setLocalAwardLevels((prev) => {
        const next = { ...prev }
        delete next[pendingUpdate.evidenceId]
        return next
      })
      toast.error(getErrorMessage(error, "Không thể cập nhật cấp giải"))
      setConfirmDialogOpen(false)
      setPendingUpdate(null)
    }
  }, [pendingUpdate, bulkUpdateMutation, onUpdated])

  const cancelSingleUpdate = useCallback(() => {
    if (pendingUpdate) {
      setLocalAwardLevels((prev) => {
        const next = { ...prev }
        delete next[pendingUpdate.evidenceId]
        return next
      })
    }
    setConfirmDialogOpen(false)
    setPendingUpdate(null)
  }, [pendingUpdate])

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
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
            <DataTable
              data={tableData}
              columns={columns}
              onRowClick={(row) => row.evidence.evidenceId && handleRowClick(row.student, row.evidence.evidenceId)}
              rowClassName={(row) => {
                const isChecked = Boolean(
                  row.evidence.evidenceId && selectedEvidenceIds.includes(row.evidence.evidenceId),
                )
                const isThisStudent = selectedStudent?.userId === row.student.userId
                return cn(
                  isChecked && "bg-primary/5 hover:bg-primary/5",
                  isThisStudent && "bg-primary/10 hover:bg-primary/10",
                )
              }}
              emptyMessage={
                debouncedSearch.trim()
                  ? "Không tìm thấy sinh viên phù hợp"
                  : "Chưa có sinh viên nào được duyệt minh chứng"
              }
            />
          </div>

          {/* Right pane: student detail panel */}
          <div className="w-[420px] shrink-0 border-l overflow-y-auto bg-white flex flex-col">
            {currentSelectedStudent && activity ? (
              <AwardStudentDetailPanel
                activity={activity}
                student={currentSelectedStudent}
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

      <ConfirmAwardDialog
        open={confirmDialogOpen}
        onOpenChange={cancelSingleUpdate}
        onConfirm={confirmSingleUpdate}
        isPending={bulkUpdateMutation.isPending}
        studentName={pendingUpdate?.studentName}
        awardLevel={pendingUpdate?.awardLevel ?? ""}
      />
    </Dialog>
  )
}
