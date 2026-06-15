import type { ReviewLevel } from "@/lib/constants"
import type { EvidenceItem, EvidenceItemAwardLevel } from "@/services/generated/api"

export interface ProfileAward {
  readonly id: string
  readonly activityTitle: string
  readonly reviewLevel?: ReviewLevel
  readonly awardLevel: Exclude<EvidenceItemAwardLevel, null>
}

export function getProfileAwards(
  evidences: readonly EvidenceItem[],
): readonly ProfileAward[] {
  return evidences.flatMap((evidence) => {
    if (
      evidence.status !== "approved" ||
      !evidence.awardLevel ||
      evidence.awardLevel === "NONE"
    ) {
      return []
    }

    return [
      {
        id: evidence.id ?? `${evidence.activityTitle ?? "activity"}-${evidence.awardLevel}`,
        activityTitle: evidence.activityTitle ?? "Hoạt động",
        reviewLevel: isReviewLevel(evidence.reviewLevel) ? evidence.reviewLevel : undefined,
        awardLevel: evidence.awardLevel,
      },
    ]
  })
}

function isReviewLevel(value: unknown): value is ReviewLevel {
  return (
    value === "TRUONG" ||
    value === "DHQGHN" ||
    value === "THANH_PHO" ||
    value === "TRUNG_UONG"
  )
}
