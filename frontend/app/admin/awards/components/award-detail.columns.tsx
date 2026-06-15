"use client"

import React from "react"
import { User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ColumnDef } from "@/components/ui/data-table"
import { CRITERIA } from "@/lib/constants"
import {
  AwardEvidenceInfoAwardLevel,
  type AwardStudentOverview,
  type AwardEvidenceInfo,
} from "@/services/generated/api"

export interface AwardEvidenceRow {
  student: AwardStudentOverview
  evidence: AwardEvidenceInfo
  evIdx: number
}

interface ColumnOptions {
  selectedEvidenceIds: string[]
  toggleEvidence: (evidenceId: string) => void
  toggleAll: () => void
  evidenceCount: number
  filteredStudents: AwardStudentOverview[]
  localAwardLevels: Record<string, string>
  handleSingleUpdate: (evidenceId: string, awardLevel: string, studentName: string) => void
  isPending: boolean
}

export function getAwardDetailColumns({
  selectedEvidenceIds,
  toggleEvidence,
  toggleAll,
  evidenceCount,
  filteredStudents,
  localAwardLevels,
  handleSingleUpdate,
  isPending,
}: ColumnOptions): ColumnDef<AwardEvidenceRow>[] {
  return [
    {
      id: "select",
      headerClassName: "w-10 px-4 py-2.5",
      className: "px-4 py-2.5",
      header: () => {
        const allEvidences = filteredStudents.flatMap((st) => st.evidences ?? [])
        const allChecked =
          evidenceCount > 0 &&
          allEvidences.every((ev) => selectedEvidenceIds.includes(ev.evidenceId ?? ""))

        return (
          <input
            type="checkbox"
            checked={allChecked}
            onChange={toggleAll}
            className="h-4 w-4 rounded border-border cursor-pointer"
            aria-label="Chọn tất cả"
            onClick={(e) => e.stopPropagation()}
          />
        )
      },
      cell: ({ row }) => {
        const isChecked = Boolean(
          row.evidence.evidenceId && selectedEvidenceIds.includes(row.evidence.evidenceId),
        )
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => row.evidence.evidenceId && toggleEvidence(row.evidence.evidenceId)}
              className="h-4 w-4 rounded border-border cursor-pointer"
              aria-label="Chọn"
            />
          </div>
        )
      },
    },
    {
      id: "student",
      header: "Sinh viên",
      className: "px-4 py-2.5",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 font-medium whitespace-nowrap text-left hover:text-primary transition-colors">
          <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          {row.student.userFullName || "—"}
        </div>
      ),
    },
    {
      id: "studentId",
      header: "Mã SV",
      className: "px-4 py-2.5 text-muted-foreground whitespace-nowrap",
      cell: ({ row }) => row.student.userStudentId || "—",
    },
    {
      id: "className",
      header: "Lớp",
      className: "px-4 py-2.5 text-muted-foreground whitespace-nowrap",
      cell: ({ row }) => row.student.className || "—",
    },
    {
      id: "criteria",
      header: "Tiêu chí",
      className: "px-4 py-2.5",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs">
          {(CRITERIA[row.evidence.criteria as keyof typeof CRITERIA] ?? row.evidence.criteria) || "—"}
        </Badge>
      ),
    },
    {
      id: "awardLevel",
      header: "Cấp giải",
      className: "px-4 py-2.5",
      cell: ({ row }) => {
        const currentAwardLevel =
          (row.evidence.evidenceId && localAwardLevels[row.evidence.evidenceId]) ||
          row.evidence.awardLevel ||
          AwardEvidenceInfoAwardLevel.NONE

        return (
          <div onClick={(e) => e.stopPropagation()}>
            <AwardLevelSelect
              value={currentAwardLevel}
              evidenceId={row.evidence.evidenceId ?? ""}
              onChange={(evId, val) =>
                handleSingleUpdate(evId, val, row.student.userFullName ?? "")
              }
              disabled={isPending}
            />
          </div>
        )
      },
    },
  ]
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
