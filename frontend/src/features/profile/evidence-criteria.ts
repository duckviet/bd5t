import {
  CRITERIA,
  type CriterionType,
} from "@/lib/constants";
import type {
  ActivityItem,
  EvidenceItem,
} from "@/services/generated/api";
import type { ActivityCriteriaMap } from "./types";

export function normalizeCriteria(
  criteria?: readonly (string | null | undefined)[] | null,
): CriterionType[] {
  return (criteria ?? []).filter(
    (criterion): criterion is CriterionType =>
      Boolean(criterion && criterion in CRITERIA),
  );
}

export function getEvidenceCriteria(
  evidence: EvidenceItem,
  activityCriteriaMap: ActivityCriteriaMap,
  activities: ActivityItem[],
): CriterionType[] {
  const directCriteria = normalizeCriteria(evidence.criteria);
  if (directCriteria.length > 0) {
    return directCriteria;
  }

  const criterionType = normalizeCriteria([evidence.criterionType]);
  if (criterionType.length > 0) {
    return criterionType;
  }

  const mappedCriteria = activityCriteriaMap[evidence.activityId || ""];
  if (mappedCriteria?.length) {
    return mappedCriteria;
  }

  const activity =
    activities.find((item) => item.id === evidence.activityId) ??
    activities.find((item) => item.title === evidence.activityTitle);

  return normalizeCriteria(activity?.criteria);
}

export function getEvidenceCriteriaLabel(
  evidence: EvidenceItem,
  activityCriteriaMap: ActivityCriteriaMap,
  activities: ActivityItem[],
): string {
  const criteria = getEvidenceCriteria(evidence, activityCriteriaMap, activities);
  if (criteria.length === 0) {
    return "Chưa xác định tiêu chí";
  }

  return criteria.map((criterion) => CRITERIA[criterion]).join(", ");
}

