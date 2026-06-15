"use client"

import { AlertCircle, CheckCircle2, Clock, RefreshCw, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProfileSkeleton } from "@/components/common/loading"
import { EvidenceView } from "@/features/profile/components/evidence-view"
import type {
  ActivityCriteriaMap,
  EvidenceViewType,
} from "@/features/profile/types"
import type {
  ActivityItem,
  EvidenceItem,
  EvidenceItemStatus,
} from "@/services/generated/api"
import type { CriterionType, ReviewLevel } from "@/lib/constants"

const statusBadgeVariant: Record<
  EvidenceItemStatus,
  "success" | "secondary" | "destructive"
> = {
  pending: "secondary",
  approved: "success",
  rejected: "destructive",
}

const statusIcon = {
  pending: Clock,
  approved: CheckCircle2,
  rejected: XCircle,
} as const

interface ProfileEvidenceScreenProps {
  readonly isLoading: boolean
  readonly error: unknown
  readonly filteredEvidences: EvidenceItem[]
  readonly totalCount: number
  readonly searchQuery: string
  readonly filterStatus: EvidenceItemStatus | "all"
  readonly filterCriterion: CriterionType | "all"
  readonly filterLevel: ReviewLevel | "all"
  readonly viewType: EvidenceViewType
  readonly activityCriteriaMap: ActivityCriteriaMap
  readonly activities: ActivityItem[]
  readonly onRetry: () => void
  readonly onSearchChange: (value: string) => void
  readonly onStatusChange: (value: EvidenceItemStatus | "all") => void
  readonly onCriterionChange: (value: CriterionType | "all") => void
  readonly onLevelChange: (value: ReviewLevel | "all") => void
  readonly onViewTypeChange: (value: EvidenceViewType) => void
  readonly onBack: () => void
  readonly onUpload: () => void
}

export function ProfileEvidenceScreen({
  isLoading,
  error,
  filteredEvidences,
  totalCount,
  searchQuery,
  filterStatus,
  filterCriterion,
  filterLevel,
  viewType,
  activityCriteriaMap,
  activities,
  onRetry,
  onSearchChange,
  onStatusChange,
  onCriterionChange,
  onLevelChange,
  onViewTypeChange,
  onBack,
  onUpload,
}: ProfileEvidenceScreenProps) {
  if (isLoading) {
    return (
      <div className="min-h-screen py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ProfileSkeleton />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
          <p className="mb-4 text-destructive">Không thể tải danh sách minh chứng</p>
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Thử lại
          </Button>
        </div>
      </div>
    )
  }

  return (
    <EvidenceView
      items={filteredEvidences}
      totalCount={totalCount}
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
      onBack={onBack}
      onUpload={onUpload}
      statusBadgeVariant={statusBadgeVariant}
      statusIcon={statusIcon}
      activityCriteriaMap={activityCriteriaMap}
      activities={activities}
    />
  )
}
