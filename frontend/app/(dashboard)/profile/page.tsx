"use client"

import { useState, useMemo, type ComponentType } from "react"
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import type { CriterionType, ReviewLevel } from "@/lib/constants";

import { ProfileCard } from "@/features/profile/components/profile-card"
import { QuickStats } from "@/features/profile/components/quick-stats"
import { ProgressMatrix } from "@/features/profile/components/progress-matrix"
import { EvidenceVault } from "@/features/profile/components/evidence-vault"
import { EvidenceView } from "@/features/profile/components/evidence-view"
import { EditProfileDialog } from "@/features/profile/components/edit-profile-dialog"
import { UploadEvidenceDialog } from "@/components/evidence/upload-evidence-dialog"
import { mockProgress } from "@/features/profile/mock-data";
import type { EvidenceViewType } from "@/features/profile/types";
import {
  useMe,
  useListEvidences,
  type UserProfile,
  type EvidenceItem,
  type EvidenceItemStatus,
} from "@/services/generated/api";
import { Button } from "@/components/ui/button";
import { ProfileSkeleton } from "@/components/common/loading";

const statusBadgeVariant: Record<
  EvidenceItemStatus,
  "success" | "secondary" | "destructive"
> = {
  pending: "secondary",
  approved: "success",
  rejected: "destructive",
};

const statusIcon: Record<
  EvidenceItemStatus,
  ComponentType<{ className?: string }>
> = {
  pending: Clock,
  approved: CheckCircle2,
  rejected: XCircle,
};

export default function ProfilePage() {
  const [viewMode, setViewMode] = useState<"profile" | "evidences">("profile")
  const [uploadOpen, setUploadOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [uploadKey, setUploadKey] = useState(0)
  const [user, setUser] = useState<UserProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<EvidenceItemStatus | "all">(
    "all",
  );
  const [filterCriterion, setFilterCriterion] = useState<CriterionType | "all">(
    "all",
  );
  const [filterLevel, setFilterLevel] = useState<ReviewLevel | "all">("all");
  const [viewType, setViewType] = useState<EvidenceViewType>("list")

  const {
    data: meData,
    isLoading: isLoadingUser,
    error: userError,
    refetch: refetchUser,
  } = useMe({ query: { retry: false, refetchOnWindowFocus: false } });
  const {
    data: evidencesData,
    isLoading: isLoadingEvidences,
    error: evidencesError,
    refetch: refetchEvidences,
  } = useListEvidences(undefined, {
    query: { retry: false, refetchOnWindowFocus: false },
  });

  const apiUser = user ?? meData?.data ?? null;
  const evidences = evidencesData?.data ?? [];

  const completedCount = useMemo(
    () => mockProgress.filter((p) => p.isCompleted).length,
    []
  )
  const totalCount = mockProgress.length
  const progressPercent = Math.round((completedCount / totalCount) * 100)

  const filteredEvidences = evidences.filter((ev: EvidenceItem) => {
    const q = searchQuery.toLowerCase();
    const title = ev.activityTitle ?? "";
    const description = ev.description ?? "";
    const matchesSearch =
      title.toLowerCase().includes(q) ||
      description.toLowerCase().includes(q);
    const matchesStatus = filterStatus === "all" || ev.status === filterStatus;
    const matchesCriterion = filterCriterion === "all";
    const matchesLevel =
      filterLevel === "all" || ev.reviewLevel === filterLevel;
    return matchesSearch && matchesStatus && matchesCriterion && matchesLevel;
  });

  const handleSaveUser = (data: UserProfile) => {
    setUser(data)
  }

  const isLoading = isLoadingUser || isLoadingEvidences;
  const error = userError || evidencesError;

  if (viewMode === "evidences") {
    return (
      <>
        {isLoadingEvidences ? (
          <div className="min-h-screen py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <ProfileSkeleton />
            </div>
          </div>
        ) : evidencesError ? (
          <div className="min-h-screen py-12 flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-destructive mb-4">
                Không thể tải danh sách minh chứng
              </p>
              <Button onClick={() => refetchEvidences()} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Thử lại
              </Button>
            </div>
          </div>
        ) : (
          <EvidenceView
            items={filteredEvidences}
            totalCount={evidences.length}
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
        )}
        <UploadEvidenceDialog
          key={uploadKey}
          open={uploadOpen}
          onOpenChange={setUploadOpen}
          onSuccess={() => setUploadKey((k) => k + 1)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <ProfileSkeleton />
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-destructive mb-4">
                Không thể tải thông tin người dùng
              </p>
              <Button
                onClick={() => {
                  refetchUser();
                  refetchEvidences();
                }}
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Thử lại
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              {apiUser && (
                <ProfileCard user={apiUser} onEdit={() => setEditOpen(true)} />
              )}
              <QuickStats
                completed={completedCount}
                total={totalCount}
                percent={progressPercent}
              />
            </div>
            <div className="lg:col-span-2 space-y-6">
              <ProgressMatrix data={mockProgress} />
              <EvidenceVault
                items={evidences}
                onViewAll={() => setViewMode("evidences")}
                onUpload={() => setUploadOpen(true)}
                statusBadgeVariant={statusBadgeVariant}
              />
            </div>
          </div>
        )}
      </div>

      {apiUser && (
        <EditProfileDialog
          key={apiUser.id}
          open={editOpen}
          onOpenChange={setEditOpen}
          user={apiUser}
          onSave={handleSaveUser}
        />
      )}
      <UploadEvidenceDialog
        key={uploadKey}
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onSuccess={() => setUploadKey((k) => k + 1)}
      />
    </div>
  );
}
