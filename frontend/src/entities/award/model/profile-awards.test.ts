import { describe, expect, it } from "vitest"
import { getProfileAwards } from "./profile-awards"
import type { EvidenceItem } from "@/services/generated/api"

describe("profile awards", () => {
  it("filters approved non-NONE awards and applies fallback titles", () => {
    const awards = getProfileAwards([
      {
        id: "approved-award",
        activityTitle: "Olympic Tin học",
        status: "approved",
        reviewLevel: "TRUONG",
        awardLevel: "NHAT",
      },
      {
        id: "fallback-title",
        status: "approved",
        reviewLevel: "DHQGHN",
        awardLevel: "BA",
      },
      {
        id: "none-award",
        activityTitle: "Không có giải",
        status: "approved",
        awardLevel: "NONE",
      },
      {
        id: "pending-award",
        activityTitle: "Đang chờ",
        status: "pending",
        awardLevel: "NHAT",
      },
    ] satisfies readonly EvidenceItem[])

    expect(awards).toEqual([
      {
        id: "approved-award",
        activityTitle: "Olympic Tin học",
        reviewLevel: "TRUONG",
        awardLevel: "NHAT",
      },
      {
        id: "fallback-title",
        activityTitle: "Hoạt động",
        reviewLevel: "DHQGHN",
        awardLevel: "BA",
      },
    ])
  })
})
