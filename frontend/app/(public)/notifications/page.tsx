import type { Metadata } from "next"
import { BreadcrumbJsonLd } from "next-seo"
import { absoluteUrl, createMetadata } from "@/lib/seo"
import { NotificationsClient } from "./notifications-client"

export const metadata: Metadata = createMetadata({
  title: "Thông báo",
  description:
    "Theo dõi các thông báo mới nhất về hoạt động và minh chứng Sinh viên 5 Tốt.",
  path: "/notifications",
})

export default function NotificationsPage() {
  return (
    <>
      <BreadcrumbJsonLd
        scriptId="notifications-breadcrumb-jsonld"
        scriptKey="notifications-breadcrumb-jsonld"
        items={[
          {
            name: "Trang chủ",
            item: absoluteUrl("/"),
          },
          {
            name: "Thông báo",
            item: absoluteUrl("/notifications"),
          },
        ]}
      />
      <NotificationsClient />
    </>
  )
}
