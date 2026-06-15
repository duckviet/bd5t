import { describe, expect, it } from "vitest"
import {
  getActiveBadge,
  getGeneralBadges,
  getSpecificBadges,
  summarizeScores,
} from "./badge-model"
import type { ProgressMatrixCriteriaScoresItem } from "@/services/generated/api"

describe("profile badge model", () => {
  it("selects A+ general badge and unique high-score criterion badge", () => {
    const scores: readonly ProgressMatrixCriteriaScoresItem[] = [
      { criteria: "DAO_DUC", score: 230 },
      { criteria: "HOC_TAP", score: 160 },
      { criteria: "THE_LUC", score: 150 },
      { criteria: "TINH_NGUYEN", score: 140 },
      { criteria: "HOI_NHAP", score: 120 },
    ]

    const summary = summarizeScores(scores)

    expect(getActiveBadge(getGeneralBadges(summary))?.id).toBe("gen_a_plus")
    expect(getActiveBadge(getSpecificBadges(summary))?.id).toBe("spec_dd_high")
  })

  it("handles empty scores and five-way high-score ties", () => {
    const emptySummary = summarizeScores([])

    expect(getActiveBadge(getGeneralBadges(emptySummary))?.id).toBe("gen_c")
    expect(getActiveBadge(getSpecificBadges(emptySummary))).toBeUndefined()

    const tiedSummary = summarizeScores([
      { criteria: "DAO_DUC", score: 120 },
      { criteria: "HOC_TAP", score: 120 },
      { criteria: "THE_LUC", score: 120 },
      { criteria: "TINH_NGUYEN", score: 120 },
      { criteria: "HOI_NHAP", score: 120 },
    ])

    expect(getActiveBadge(getSpecificBadges(tiedSummary))?.id).toBe("spec_all_high")
  })

  it("unlocks each high criterion badge and the multi badge when two criteria have full scores", () => {
    const summary = summarizeScores([
      { criteria: "DAO_DUC", score: 200 },
      { criteria: "HOC_TAP", score: 50 },
      { criteria: "THE_LUC", score: 200 },
      { criteria: "TINH_NGUYEN", score: 80 },
      { criteria: "HOI_NHAP", score: 0 },
    ])

    const unlockedIds = getSpecificBadges(summary)
      .filter((badge) => badge.unlocked)
      .map((badge) => badge.id)

    expect(unlockedIds).toContain("spec_dd_high")
    expect(unlockedIds).toContain("spec_tl_high")
    expect(unlockedIds).toContain("spec_multi_high")
  })
})
