import type { Metadata } from "next"
import { BreadcrumbJsonLd } from "next-seo"
import { absoluteUrl, createMetadata } from "@/lib/seo"
import { LeaderboardClient } from "./leaderboard-client"

export const metadata: Metadata = createMetadata({
  title: "Bảng xếp hạng",
  description:
    "Top sinh viên tích cực nhất trong hành trình chinh phục danh hiệu Sinh viên 5 Tốt.",
  path: "/leaderboard",
})

export default function LeaderboardPage() {
  return (
    <>
      <BreadcrumbJsonLd
        scriptId="leaderboard-breadcrumb-jsonld"
        scriptKey="leaderboard-breadcrumb-jsonld"
        items={[
          {
            name: "Trang chủ",
            item: absoluteUrl("/"),
          },
          {
            name: "Bảng xếp hạng",
            item: absoluteUrl("/leaderboard"),
          },
        ]}
      />
      <LeaderboardClient />
    </>
  )
}
