import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "next-seo";
import { ActivityItem } from "@/services/generated/api";
import { ActivitiesClientView } from "./components/ActivitiesClientView";
import { getAllActivities } from "@/lib/server-public-api";
import { absoluteUrl, createMetadata } from "@/lib/seo";

export const revalidate = 300;

export const metadata: Metadata = createMetadata({
  title: "Khám phá hoạt động",
  description:
    "Tìm kiếm và tham gia các hoạt động để tích lũy minh chứng cho danh hiệu Sinh viên 5 Tốt.",
  path: "/activities",
});

export default async function ActivitiesPage() {
  let activities : ActivityItem[] = [];
  let hasError = false;

  try {
    activities = await getAllActivities(100);
  } catch {
    hasError = true;
  }

  return (
    <div className="min-h-screen py-12 bg-slate-50/50">
      <BreadcrumbJsonLd
        scriptId="activities-breadcrumb-jsonld"
        scriptKey="activities-breadcrumb-jsonld"
        items={[
          {
            name: "Trang chủ",
            item: absoluteUrl("/"),
          },
          {
            name: "Khám phá hoạt động",
            item: absoluteUrl("/activities"),
          },
        ]}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4 tracking-tight">
            Khám phá hoạt động
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Tìm kiếm và tham gia các hoạt động để tích lũy minh chứng cho danh
            hiệu Sinh viên 5 Tốt
          </p>
        </div>

        <ActivitiesClientView activities={activities} hasError={hasError} />
      </div>
    </div>
  );
}
