import type { CriterionType, ReviewLevel, EvidenceStatus } from "@/lib/constants"

export type UserProfile = {
  id: string
  fullName: string
  email: string
  studentId: string
  className: string
  unit: { id: string; name: string }
  avatarUrl: string | null
}

export type EvidenceItem = {
  id: string
  title: string
  criterion: CriterionType
  reviewLevel: ReviewLevel
  status: EvidenceStatus
  activityTitle: string
  fileUrl: string
  createdAt: string
  description: string
}

export type ProgressItem = {
  criterion: CriterionType
  reviewLevel: ReviewLevel
  isCompleted: boolean
}

export type ViewMode = "profile" | "evidences"
export type EvidenceViewType = "list" | "grid"
