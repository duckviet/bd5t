import type { CriterionType } from "@/lib/constants"

export type BadgeIconKey =
  | "award"
  | "book-open"
  | "compass"
  | "crown"
  | "dumbbell"
  | "flame"
  | "globe"
  | "heart-handshake"
  | "shield-check"
  | "sprout"
  | "star"
  | "trophy"
  | "users"

export interface BadgeDefinition {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly requirement: string
  readonly iconKey: BadgeIconKey
  readonly gradientClass: string
  readonly borderClass: string
  readonly textColor: string
  readonly unlocked: boolean
  readonly isActive: boolean
}

export interface GeneralBadgeSeed {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly requirement: string
  readonly iconKey: BadgeIconKey
  readonly gradientClass: string
  readonly borderClass: string
  readonly textColor: string
  readonly threshold: number
}

export interface SpecificBadgeSeed {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly requirement: string
  readonly iconKey: BadgeIconKey
  readonly gradientClass: string
  readonly borderClass: string
  readonly textColor: string
  readonly isUnlocked: (summary: ScoreSummary) => boolean
  readonly isActive: (summary: ScoreSummary) => boolean
}

export interface ScoreSummary {
  readonly scores: ReadonlyMap<CriterionType, number>
  readonly totalScore: number
  readonly maxScore: number
  readonly matchingKeys: readonly CriterionType[]
}
