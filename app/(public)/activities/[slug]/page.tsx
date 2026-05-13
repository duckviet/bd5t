import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  MapPin,
  Users,
  ExternalLink,
  Clock,
  FileText,
  Award,
} from "lucide-react";
import {
  CRITERIA,
  type CriterionType,
  type ReviewLevel,
  REVIEW_LEVELS,
} from "@/lib/constants";
import { MOCK_ACTIVITIES } from "../../../../lib/mock-data";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ActivityDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const activity = MOCK_ACTIVITIES.find((act: any) => act.slug === slug);

  if (!activity) {
    notFound();
  }

  const daysRemaining = Math.ceil(
    (new Date(activity.endAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/activities"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Quay lại danh sách hoạt động
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8 flex justify-center gap-4">
          <div className="">
            <div className="flex flex-wrap gap-2 mb-4">
              {activity.criteria.map((c: CriterionType) => (
                <Badge key={c} variant="secondary">
                  {CRITERIA[c]}
                </Badge>
              ))}
              {activity.reviewLevel && (
                <Badge variant="outline">
                  {REVIEW_LEVELS[activity.reviewLevel as ReviewLevel]}
                </Badge>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              {activity.title}
            </h1>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(activity.startAt).toLocaleDateString("vi-VN")} -{" "}
                {new Date(activity.endAt).toLocaleDateString("vi-VN")}
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {activity.organizer}
              </div>
            </div>
          </div>
          <div className="max-w-50 rounded-md overflow-hidden">
            {activity.thumbnailUrl && (
              <img
                src={activity.thumbnailUrl}
                alt={activity.slug}
                className="object-cover w-full h-full"
              />
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mô tả</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-line">
                  {activity.description}
                </p>
              </CardContent>
            </Card>

            {/* Thể lệ */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Thể lệ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-line">
                  {activity.rules}
                </p>
              </CardContent>
            </Card>

            {/* Cơ cấu giải thưởng */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Cơ cấu giải thưởng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-line">
                  {activity.rewards}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-4">
                {daysRemaining > 0 && (
                  <div className="text-center p-3 rounded-lg bg-primary/10">
                    <div className="text-2xl font-bold text-primary">
                      {daysRemaining}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ngày còn lại
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <a
                    href={activity.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <Button size="lg" className="w-full gap-2">
                      Tham gia ngay
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>

                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full gap-2 mt-4"
                  >
                    Nộp minh chứng
                  </Button>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="text-sm text-muted-foreground mb-2">
                    Thông tin liên hệ:
                  </div>
                  <div className="text-sm">
                    {activity?.contactInfo ||
                      "Email: doantn@ulis.edu.vn | ĐT: 0123 456 789"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
