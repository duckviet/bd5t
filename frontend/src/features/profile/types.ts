import type { CriterionType, ReviewLevel } from "@/lib/constants";

export type ProgressItem = {
  criterion: CriterionType;
  reviewLevel: ReviewLevel;
  isCompleted: boolean;
};

export type ViewMode = "profile" | "evidences";
export type EvidenceViewType = "list" | "grid";
