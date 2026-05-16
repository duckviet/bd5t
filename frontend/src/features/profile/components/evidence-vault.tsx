"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Upload } from "lucide-react"
import { CRITERIA, REVIEW_LEVELS, EVIDENCE_STATUS } from "@/lib/constants"
import type {
  EvidenceItem,
  EvidenceItemStatus,
  ActivityItem,
} from "@/services/generated/api";
import type { ActivityCriteriaMap } from "../types";

interface EvidenceVaultProps {
  items: EvidenceItem[];
  onViewAll: () => void;
  onUpload: () => void;
  statusBadgeVariant: Record<
    NonNullable<EvidenceItemStatus>,
    "success" | "secondary" | "destructive"
  >;
  activityCriteriaMap: ActivityCriteriaMap;
  activities: ActivityItem[];
}

export function EvidenceVault({
  items,
  onViewAll,
  onUpload,
  statusBadgeVariant,
  activityCriteriaMap,
  activities,
}: EvidenceVaultProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Kho lưu trữ minh chứng</CardTitle>
        <Button size="sm" className="gap-1" onClick={onUpload}>
          <Upload className="h-4 w-4" />
          Tải lên
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.slice(0, 3).map((ev) => {
            const status = (ev.status ?? "pending") as EvidenceItemStatus;
            return (
              <div
                key={ev.id}
                className="flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {ev.activityTitle || ev.description || "Minh chứng"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {(() => {
                      // Prefer criterionType from backend if available
                      if (ev.criterionType) {
                        return CRITERIA[ev.criterionType as keyof typeof CRITERIA] || ev.criterionType;
                      }

                      const activity =
                        activities.find((a) => a.id === ev.activityId) ||
                        activities.find((a) => a.title === ev.activityTitle);
                      const criteria =
                        activity?.criteria ??
                        activityCriteriaMap[ev.activityId || ""] ??
                        [];
                      return criteria.length > 0
                        ? criteria
                            .map(
                              (criterion) =>
                                CRITERIA[criterion as keyof typeof CRITERIA],
                            )
                            .join(", ")
                        : "Chưa xác định tiêu chí";
                    })()}{" "}
                    • {REVIEW_LEVELS[ev.reviewLevel || "TRUONG"]}
                  </div>
                </div>
                <Badge variant={statusBadgeVariant[status]}>
                  {
                    EVIDENCE_STATUS[
                      status.toUpperCase() as keyof typeof EVIDENCE_STATUS
                    ]
                  }
                </Badge>
              </div>
            );
          })}
        </div>

        <Button variant="ghost" className="w-full mt-4" onClick={onViewAll}>
          Xem tất cả minh chứng ({items.length})
        </Button>
      </CardContent>
    </Card>
  );
}
