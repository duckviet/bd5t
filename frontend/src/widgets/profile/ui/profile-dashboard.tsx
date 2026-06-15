"use client"

import { BadgeTeaser } from "@/entities/badge"
import {
  CriteriaScoreStrip,
  QuickStats,
  type ActivityCriteriaMap,
  type ProgressPresenceMatrix,
} from "@/entities/profile"
import { ProfileCard } from "@/features/profile/components/profile-card"
import { ProgressMatrix } from "@/features/profile/components/progress-matrix"
import { EvidenceVault } from "@/features/profile/components/evidence-vault"
import { RadarChart } from "@/shared/ui"
import type {
  ActivityItem,
  EvidenceItem,
  EvidenceItemStatus,
  UserProfile,
  ProgressMatrixCriteriaScoresItem,
} from "@/services/generated/api"
import {
  hasProfileAwards,
  ProfileAwardsSummary,
} from "./profile-awards-summary"

const statusBadgeVariant: Record<
  EvidenceItemStatus,
  "success" | "secondary" | "destructive"
> = {
  pending: "secondary",
  approved: "success",
  rejected: "destructive",
}

interface ProfileDashboardProps {
  readonly user: UserProfile | null
  readonly criteriaScores: ProgressMatrixCriteriaScoresItem[]
  readonly progressMatrix: ProgressPresenceMatrix
  readonly evidences: EvidenceItem[]
  readonly activityCriteriaMap: ActivityCriteriaMap
  readonly activities: ActivityItem[]
  readonly onEditProfile: () => void
  readonly onViewEvidences: () => void
  readonly onUploadEvidence: () => void
}

export function ProfileDashboard({
  user,
  criteriaScores,
  progressMatrix,
  evidences,
  activityCriteriaMap,
  activities,
  onEditProfile,
  onViewEvidences,
  onUploadEvidence,
}: ProfileDashboardProps) {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-1">
        {user && <ProfileCard user={user} onEdit={onEditProfile} />}
        <RadarChart stats={criteriaScores} />
      </div>

      <div className="space-y-6 lg:col-span-2">
        <ProgressMatrix data={progressMatrix} />
        <BadgeTeaser criteriaScores={criteriaScores} />

        <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2">
          <ProfileAwardsSummary evidences={evidences} />
          <EvidenceVault
            className={hasProfileAwards(evidences) ? "h-full" : "md:col-span-2"}
            items={evidences}
            onViewAll={onViewEvidences}
            onUpload={onUploadEvidence}
            statusBadgeVariant={statusBadgeVariant}
            activityCriteriaMap={activityCriteriaMap}
            activities={activities}
          />
        </div>
      </div>
    </div>
  )
}
