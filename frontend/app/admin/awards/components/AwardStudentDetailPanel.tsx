"use client"

import { useMemo } from "react"
import { X, Calendar, FileText } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AwardBadge } from "./AwardBadge"
import { EvidenceFilePreview } from "../../evidences/components/EvidenceFilePreview"
import { cn } from "@/lib/utils"
import { CRITERIA } from "@/lib/constants"
import {
  type AwardActivityOverview,
  type AwardStudentOverview,
  type AwardEvidenceInfo,
} from "@/services/generated/api"

interface AwardStudentDetailPanelProps {
  activity: AwardActivityOverview
  student: AwardStudentOverview
  onClose: () => void
}

function formatDate(value?: string | null) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString("vi-VN")
}

export function AwardStudentDetailPanel({
  activity,
  student,
  onClose,
}: AwardStudentDetailPanelProps) {
  const evidences = useMemo(
    () => student.evidences ?? [],
    [student.evidences],
  )

  return (
    <Card className="h-full rounded-none border-0 shadow-none flex flex-col">
      <CardHeader className="shrink-0 border-b px-4 py-3 flex flex-row items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <CardTitle className="text-sm font-semibold truncate">
            {student.userFullName || "Sinh viên"}
          </CardTitle>
          <div className="text-xs text-muted-foreground truncate">
            {student.userStudentId || "—"} {student.className ? `· ${student.className}` : ""}
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-0">
        {/* Activity info */}
        <div className="border-b bg-muted/20 px-4 py-3 space-y-1.5">
          <div className="text-xs font-medium text-muted-foreground">Hoạt động</div>
          <div className="text-sm font-medium">{activity.activityTitle}</div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>
              {(activity.criteria ?? [])
                .map((c) => CRITERIA[c as keyof typeof CRITERIA] ?? c)
                .join(", ")}
            </span>
          </div>
        </div>

        {/* Evidence list */}
        {evidences.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Sinh viên chưa có minh chứng nào được duyệt
          </div>
        ) : (
          <div className="divide-y">
            {evidences.map((evidence) => (
              <EvidenceCard key={evidence.evidenceId} evidence={evidence} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function EvidenceCard({ evidence }: { evidence: AwardEvidenceInfo }) {
  return (
    <div className="px-4 py-3 space-y-3">
      {/* Header: criteria + award level + score */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {CRITERIA[evidence.criteria as keyof typeof CRITERIA] ?? evidence.criteria}
          </Badge>
          <AwardBadge level={evidence.awardLevel ?? "NONE"} />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {evidence.score != null && (
            <span className="font-medium text-foreground">Điểm: {evidence.score}</span>
          )}
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(evidence.createdAt)}
          </span>
        </div>
      </div>

      {/* Description */}
      {evidence.description && (
        <div className="text-sm text-muted-foreground">{evidence.description}</div>
      )}

      {/* File preview */}
      {evidence.fileUrl ? (
        <EvidenceFilePreview fileUrl={evidence.fileUrl} />
      ) : (
        <div className="flex items-center gap-2 rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          Không có file minh chứng
        </div>
      )}
    </div>
  )
}
