"use client"

import { Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { StudentAvatar } from "./StudentAvatar"
import { getEvidenceCriteria, getEvidenceCriteriaLabel } from "@/features/profile/evidence-criteria"
import { EVIDENCE_STATUS, CRITERIA } from "@/lib/constants"
import type { EvidenceItem, EvidenceItemStatus } from "@/services/generated/api"

interface EvidenceListProps {
  evidences: EvidenceItem[]
  selectedEvidenceId?: string
  selectedIds: string[]
  onSelectEvidence: (evidence: EvidenceItem) => void
  onToggle: (id: string) => void
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

export function EvidenceList({
  evidences,
  selectedEvidenceId,
  selectedIds,
  onSelectEvidence,
  onToggle,
}: EvidenceListProps) {
  if (evidences.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Không có minh chứng phù hợp
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {evidences.map((evidence) => {
        const status = (evidence.status ?? "pending") as EvidenceItemStatus
        const isSelected = selectedEvidenceId === evidence.id
        const isChecked = Boolean(evidence.id && selectedIds.includes(evidence.id))

        return (
          <Card
            key={evidence.id}
            className={cn(
              "cursor-pointer transition-all",
              isSelected && "border-primary bg-primary/5 ring-2 ring-primary/50",
            )}
            onClick={() => onSelectEvidence(evidence)}
          >
            <CardContent className="p-4">
              <div className="flex items-start w-full min-w-0 gap-3">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onClick={(event) => event.stopPropagation()}
                  onChange={() => evidence.id && onToggle(evidence.id)}
                  className="mt-3 h-4 w-4 rounded border-border"
                  aria-label="Chọn minh chứng"
                />
                <StudentAvatar evidence={evidence} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold max-w-[60vw]">
                    {evidence.activityTitle || "Minh chứng"}
                  </p>
                  <div className="mt-1 truncate text-xs text-muted-foreground">
                    {evidence.userFullName || "Sinh viên"} -{" "}
                    {evidence.userStudentId || "Chưa có mã SV"}
                  </div>
                  <div className="mt-1 truncate text-xs text-muted-foreground">
                    {[evidence.userClassName, evidence.userUnitName].filter(Boolean).join(" - ") ||
                      "Chưa có lớp/khoa"}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {(() => {
                      const criteriaList = getEvidenceCriteria(evidence, {}, [])
                      if (criteriaList.length === 0) {
                        return (
                          <Badge variant="outline" className="text-xs">
                            Chưa xác định tiêu chí
                          </Badge>
                        )
                      }
                      return criteriaList.map((criterion) => (
                        <Badge key={criterion} variant="outline" className="text-xs">
                          {CRITERIA[criterion]}
                        </Badge>
                      ))
                    })()}
                    <Badge variant={statusBadgeVariant[status]} className="text-xs">
                      {getStatusLabel(status)}
                    </Badge>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(evidence.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
