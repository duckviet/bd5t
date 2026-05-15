"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar, Download, Trash2, Upload } from "lucide-react"
import { CRITERIA, REVIEW_LEVELS, EVIDENCE_STATUS } from "@/lib/constants"
import type {
  EvidenceItem,
  EvidenceItemStatus,
} from "@/services/generated/api";

interface EvidenceListViewProps {
  items: EvidenceItem[];
  onUpload: () => void;
  statusBadgeVariant: Record<
    NonNullable<EvidenceItemStatus>,
    "success" | "secondary" | "destructive"
  >;
  statusIcon: Record<string, React.ComponentType<{ className?: string }>>;
}

export function EvidenceListView({ items, onUpload, statusBadgeVariant, statusIcon: statusIconMap }: EvidenceListViewProps) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-lg mb-1">Không tìm thấy minh chứng</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Thử thay đổi bộ lọc hoặc tải lên minh chứng mới
          </p>
          <Button variant="outline" onClick={onUpload} className="gap-2">
            <Upload className="h-4 w-4" />
            Tải lên minh chứng
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {items.map((ev) => {
        const status = (ev.status ?? "pending") as EvidenceItemStatus;
        const StatusIcon = statusIconMap[status];
        return (
          <div
            key={ev.id}
            className="flex items-start gap-4 p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors group"
          >
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">
                {ev.activityTitle || ev.description || "Minh chứng"}
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                <span>{CRITERIA[ev.criterionType || "HOC_TAP"]}</span>
                <span>•</span>
                <span>{REVIEW_LEVELS[ev.reviewLevel || "TRUONG"]}</span>
                <span>•</span>
                <span>{ev.activityTitle || "Hoạt động"}</span>
              </div>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {ev.createdAt || ""}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant={statusBadgeVariant[status]}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {
                  EVIDENCE_STATUS[
                    status.toUpperCase() as keyof typeof EVIDENCE_STATUS
                  ]
                }
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  )
}

export function EvidenceGridView({ items, onUpload, statusBadgeVariant, statusIcon: statusIconMap }: EvidenceListViewProps) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-lg mb-1">Không tìm thấy minh chứng</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Thử thay đổi bộ lọc hoặc tải lên minh chứng mới
          </p>
          <Button variant="outline" onClick={onUpload} className="gap-2">
            <Upload className="h-4 w-4" />
            Tải lên minh chứng
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {items.map((ev) => {
        const status = (ev.status ?? "pending") as EvidenceItemStatus;
        const StatusIcon = statusIconMap[status];
        return (
          <div
            key={ev.id}
            className="flex flex-col p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors group"
          >
            <div className="flex items-start gap-4 mb-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {ev.activityTitle || ev.description || "Minh chứng"}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {ev.activityTitle || "Hoạt động"}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mb-3">
              <span>{CRITERIA[ev.criterionType || "HOC_TAP"]}</span>
              <span>•</span>
              <span>{REVIEW_LEVELS[ev.reviewLevel || "TRUONG"]}</span>
            </div>
            <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {ev.createdAt || ""}
              </span>
              <div className="flex items-center gap-2">
                <Badge variant={statusBadgeVariant[status]}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {
                    EVIDENCE_STATUS[
                      status.toUpperCase() as keyof typeof EVIDENCE_STATUS
                    ]
                  }
                </Badge>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  )
}
