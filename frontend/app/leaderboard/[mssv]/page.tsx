import type { Metadata } from "next"
import { BreadcrumbJsonLd } from "next-seo"

import { absoluteUrl, createMetadata } from "@/lib/seo"

import { LeaderboardDetailClient } from "./leaderboard-detail-client"

interface LeaderboardDetailPageProps {
  params: Promise<{ mssv: string }>
}

export async function generateMetadata({
  params,
}: LeaderboardDetailPageProps): Promise<Metadata> {
  const { mssv } = await params

  return createMetadata({
    title: `Thống kê sinh viên ${mssv}`,
    description: "Thống kê hoạt động và tiêu chí Sinh viên 5 Tốt trên bảng xếp hạng.",
    path: `/leaderboard/${mssv}`,
  })
}

export default async function LeaderboardDetailPage({
  params,
}: LeaderboardDetailPageProps) {
  const { mssv } = await params

  return (
    <>
      <BreadcrumbJsonLd
        scriptId="leaderboard-detail-breadcrumb-jsonld"
        scriptKey="leaderboard-detail-breadcrumb-jsonld"
        items={[
          {
            name: "Trang chủ",
            item: absoluteUrl("/"),
          },
          {
            name: "Bảng xếp hạng",
            item: absoluteUrl("/leaderboard"),
          },
          {
            name: mssv,
            item: absoluteUrl(`/leaderboard/${mssv}`),
          },
        ]}
      />
      <LeaderboardDetailClient studentId={mssv} />
    </>
  )
}
