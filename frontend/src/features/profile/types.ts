import type { CriterionType, ReviewLevel } from "@/lib/constants";

export type ProgressPresenceMatrix = Record<
  CriterionType,
  Record<ReviewLevel, boolean>
>;

export type ActivityCriteriaMap = Record<string, CriterionType[]>;

export type CriteriaLabelMap = Record<CriterionType, string>;

export type EvidenceRowMeta = {
  criteriaLabels: string[];
  reviewLevelLabel: string;
};

export type ViewMode = "profile" | "evidences";
export type EvidenceViewType = "list" | "grid";
