"use client"

import { useState, useMemo, type ComponentType } from "react"
import { CheckCircle2, Clock, XCircle } from "lucide-react"
import type { EvidenceStatus } from "@/lib/constants"

import { ProfileCard } from "@/features/profile/components/profile-card"
import { QuickStats } from "@/features/profile/components/quick-stats"
import { ProgressMatrix } from "@/features/profile/components/progress-matrix"
import { EvidenceVault } from "@/features/profile/components/evidence-vault"
import { EvidenceView } from "@/features/profile/components/evidence-view"
import { EditProfileDialog } from "@/features/profile/components/edit-profile-dialog"
import { UploadEvidenceDialog } from "@/components/evidence/upload-evidence-dialog"
import { mockUser, mockEvidences, mockProgress } from "@/features/profile/mock-data"
import type { UserProfile, EvidenceViewType } from "@/features/profile/types"

const statusBadgeVariant: Record<EvidenceStatus, "success" | "secondary" | "destructive"> = {
  APPROVED: "success",
  PENDING: "secondary",
  REJECTED: "destructive",
}

const statusIcon: Record<EvidenceStatus, ComponentType<{ className?: string }>> = {
  APPROVED: CheckCircle2,
  PENDING: Clock,
  REJECTED: XCircle,
}

export default function ProfilePage() {
  const [viewMode, setViewMode] = useState<"profile" | "evidences">("profile")
  const [uploadOpen, setUploadOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [user, setUser] = useState<UserProfile>(mockUser)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterCriterion, setFilterCriterion] = useState("all")
  const [filterLevel, setFilterLevel] = useState("all")
  const [viewType, setViewType] = useState<EvidenceViewType>("list")

  const completedCount = useMemo(
    () => mockProgress.filter((p) => p.isCompleted).length,
    []
  )
  const totalCount = mockProgress.length
  const progressPercent = Math.round((completedCount / totalCount) * 100)

  const filteredEvidences = useMemo(
    () =>
      mockEvidences.filter((ev) => {
        const q = searchQuery.toLowerCase()
        const matchesSearch =
          ev.title.toLowerCase().includes(q) ||
          ev.description.toLowerCase().includes(q) ||
          ev.activityTitle.toLowerCase().includes(q)
        const matchesStatus = filterStatus === "all" || ev.status === filterStatus
        const matchesCriterion = filterCriterion === "all" || ev.criterion === filterCriterion
        const matchesLevel = filterLevel === "all" || ev.reviewLevel === filterLevel
        return matchesSearch && matchesStatus && matchesCriterion && matchesLevel
      }),
    [searchQuery, filterStatus, filterCriterion, filterLevel]
  )

  const handleSaveUser = (data: UserProfile) => {
    setUser(data)
  }

  if (viewMode === "evidences") {
    return (
      <>
        <EvidenceView
          items={filteredEvidences}
          totalCount={mockEvidences.length}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterStatus={filterStatus}
          onStatusChange={setFilterStatus}
          filterCriterion={filterCriterion}
          onCriterionChange={setFilterCriterion}
          filterLevel={filterLevel}
          onLevelChange={setFilterLevel}
          viewType={viewType}
          onViewTypeChange={setViewType}
          onBack={() => setViewMode("profile")}
          onUpload={() => setUploadOpen(true)}
          statusBadgeVariant={statusBadgeVariant}
          statusIcon={statusIcon}
        />
        <UploadEvidenceDialog open={uploadOpen} onOpenChange={setUploadOpen} />
      </>
    )
  }

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <ProfileCard user={user} onEdit={() => setEditOpen(true)} />
            <QuickStats
              completed={completedCount}
              total={totalCount}
              percent={progressPercent}
            />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <ProgressMatrix data={mockProgress} />
            <EvidenceVault
              items={mockEvidences}
              onViewAll={() => setViewMode("evidences")}
              onUpload={() => setUploadOpen(true)}
              statusBadgeVariant={statusBadgeVariant}
            />
          </div>
        </div>
      </div>

      <EditProfileDialog
        key={user.id}
        open={editOpen}
        onOpenChange={setEditOpen}
        user={user}
        onSave={handleSaveUser}
      />
      <UploadEvidenceDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  )
}
