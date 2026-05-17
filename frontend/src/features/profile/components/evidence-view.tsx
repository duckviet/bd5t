"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Upload } from "lucide-react"
import { EvidenceFilters } from "./evidence-filters"
import { EvidenceListView, EvidenceGridView } from "./evidence-list-view"
import { EvidencePreviewDialog } from "./evidence-preview-dialog"
import type { EvidenceItem } from "@/services/generated/api";
import type { CriterionType, ReviewLevel } from "@/lib/constants";
import type { EvidenceViewType } from "../types";
import type { EvidenceItemStatus } from "@/services/generated/api";
import type { ActivityCriteriaMap } from "../types";
import type { ActivityItem } from "@/services/generated/api";

interface EvidenceViewProps {
  items: EvidenceItem[];
  totalCount: number;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filterStatus: EvidenceItemStatus | "all";
  onStatusChange: (value: EvidenceItemStatus | "all") => void;
  filterCriterion: CriterionType | "all";
  onCriterionChange: (value: CriterionType | "all") => void;
  filterLevel: ReviewLevel | "all";
  onLevelChange: (value: ReviewLevel | "all") => void;
  viewType: EvidenceViewType;
  onViewTypeChange: (value: EvidenceViewType) => void;
  onBack: () => void;
  onUpload: () => void;
  statusBadgeVariant: Record<string, "success" | "secondary" | "destructive">;
  statusIcon: Record<string, React.ComponentType<{ className?: string }>>;
  activityCriteriaMap: ActivityCriteriaMap;
  activities: ActivityItem[];
}

export function EvidenceView({
  items,
  totalCount,
  searchQuery,
  onSearchChange,
  filterStatus,
  onStatusChange,
  filterCriterion,
  onCriterionChange,
  filterLevel,
  onLevelChange,
  viewType,
  onViewTypeChange,
  onBack,
  onUpload,
  statusBadgeVariant,
  statusIcon,
  activityCriteriaMap,
  activities,
}: EvidenceViewProps) {
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const handleSelectEvidence = (evidence: EvidenceItem) => {
    setSelectedEvidence(evidence)
    setIsPreviewOpen(true)
  }

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={onBack}
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại trang cá nhân
          </button>

          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <span className="text-foreground font-medium">Trang cá nhân</span>
            <span>/</span>
            <span>Kho lưu trữ minh chứng</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Kho lưu trữ minh chứng</h1>
              <p className="text-muted-foreground mt-1">
                Tất cả minh chứng của bạn ({totalCount})
              </p>
            </div>
            <Button onClick={onUpload} className="gap-2 shrink-0">
              <Upload className="h-4 w-4" />
              Tải lên
            </Button>
          </div>
        </div>

        <EvidenceFilters
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          filterStatus={filterStatus}
          onStatusChange={onStatusChange}
          filterCriterion={filterCriterion}
          onCriterionChange={onCriterionChange}
          filterLevel={filterLevel}
          onLevelChange={onLevelChange}
          viewType={viewType}
          onViewTypeChange={onViewTypeChange}
        />

        {viewType === "grid" ? (
          <EvidenceGridView
            items={items}
            onUpload={onUpload}
            statusBadgeVariant={statusBadgeVariant}
            statusIcon={statusIcon}
            activityCriteriaMap={activityCriteriaMap}
            activities={activities}
            onSelect={handleSelectEvidence}
          />
        ) : (
          <EvidenceListView
            items={items}
            onUpload={onUpload}
            statusBadgeVariant={statusBadgeVariant}
            statusIcon={statusIcon}
            activityCriteriaMap={activityCriteriaMap}
            activities={activities}
            onSelect={handleSelectEvidence}
          />
        )}
      </div>

      <EvidencePreviewDialog
        evidence={selectedEvidence}
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        activityCriteriaMap={activityCriteriaMap}
        activities={activities}
        statusBadgeVariant={statusBadgeVariant}
      />
    </div>
  );
}
