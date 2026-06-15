import type { ProgressMatrixCriteriaScoresItem } from "@/services/generated/api"
import { generalBadgeSeeds, specificBadgeSeeds } from "./badge-seeds"
import { profileCriteriaKeys } from "./profile-criteria"
import type { BadgeDefinition, ScoreSummary } from "./types"

export { profileCriteriaKeys } from "./profile-criteria"
export type { BadgeDefinition, BadgeIconKey, ScoreSummary } from "./types"

export function summarizeScores(
  criteriaScores: readonly ProgressMatrixCriteriaScoresItem[],
): ScoreSummary {
  const scores = new Map(profileCriteriaKeys.map((criteria) => [criteria, 0]))

  criteriaScores.forEach((item) => {
    if (item.criteria) {
      scores.set(item.criteria, item.score ?? 0)
    }
  })

  const values = profileCriteriaKeys.map((criteria) => scores.get(criteria) ?? 0)
  const maxScore = Math.max(...values)

  return {
    scores,
    totalScore: values.reduce((sum, score) => sum + score, 0),
    maxScore,
    matchingKeys: profileCriteriaKeys.filter(
      (criteria) => (scores.get(criteria) ?? 0) === maxScore,
    ),
  }
}

export function getGeneralBadges(
  summary: ScoreSummary,
): readonly BadgeDefinition[] {
  let activeIndex = -1

  generalBadgeSeeds.forEach((badge, index) => {
    if (summary.totalScore >= badge.threshold) {
      activeIndex = index
    }
  })

  return generalBadgeSeeds.map((badge, index) => ({
    ...badge,
    unlocked: summary.totalScore >= badge.threshold,
    isActive: index === activeIndex,
  }))
}

export function getSpecificBadges(
  summary: ScoreSummary,
): readonly BadgeDefinition[] {
  return specificBadgeSeeds.map((badge) => {
    const unlocked = badge.isUnlocked(summary)

    return {
      ...badge,
      unlocked,
      isActive: badge.isActive(summary),
    }
  })
}

export function getActiveBadge(
  badges: readonly BadgeDefinition[],
): BadgeDefinition | undefined {
  return badges.reduce<BadgeDefinition | undefined>(
    (activeBadge, badge) => (badge.isActive ? badge : activeBadge),
    undefined,
  )
}
