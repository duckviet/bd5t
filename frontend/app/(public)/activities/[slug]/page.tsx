"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  MapPin,
  Users,
  ExternalLink,
  FileText,
  Award,
  Loader2,
} from "lucide-react";
import {
  type ReviewLevel,
  REVIEW_LEVELS,
} from "@/lib/constants";
import { useGetActivityDetail } from "@/services/generated/api";
import type { ActivityDetail } from "@/services/generated/api";

export default function ActivityDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: _apiResponse, isLoading, error } = useGetActivityDetail(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Đang tải...</span>
      </div>
    );
  }

  if (error) {
    notFound();
  }

  const activity = (_apiResponse as any)?.data as ActivityDetail | undefined;

  if (!activity) {
    notFound();
  }

  const startDate = activity?.startDate ? new Date(activity.startDate) : null;
  const endDate = activity?.endDate ? new Date(activity.endDate) : null;
  const daysRemaining = endDate
    ? Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

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
        <div className="mb-8 flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-4">
              {activity?.criteriaDocs?.map((c: any) => (
                <Badge key={c.id} variant="secondary">
                  {c.title}
                </Badge>
              ))}
              {activity?.reviewLevel && (
                <Badge variant="outline">
                  {REVIEW_LEVELS[activity.reviewLevel as ReviewLevel]}
                </Badge>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              {activity.title}
            </h1>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {startDate && endDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {startDate.toLocaleDateString("vi-VN")} -{" "}
                  {endDate.toLocaleDateString("vi-VN")}
                </div>
              )}
              {activity?.organizer && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {activity.organizer}
                </div>
              )}
              {activity?.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {activity.location}
                </div>
              )}
            </div>
          </div>
          {activity?.thumbnailUrl && (
            <div className="lg:max-w-xs w-full rounded-md overflow-hidden">
              <img
                src={activity.thumbnailUrl}
                alt={activity.slug || ""}
                className="object-cover w-full h-full"
              />
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {activity?.description && (
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
            )}

            {activity?.rules && (
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
            )}

            {activity?.rewards && (
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
            )}

            {activity?.targetAudience && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Đối tượng tham gia
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {activity.targetAudience}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
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
                  {activity?.registrationUrl ? (
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
                  ) : (
                    <Button size="lg" className="w-full gap-2" disabled>
                      Chưa mở đăng ký
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full gap-2 mt-4"
                  >
                    Nộp minh chứng
                  </Button>
                </div>

                {(activity?.contactInfo || activity?.organizer) && (
                  <div className="pt-4 border-t border-border">
                    <div className="text-sm text-muted-foreground mb-2">
                      Thông tin liên hệ:
                    </div>
                    <div className="text-sm">
                      {activity?.contactInfo || activity?.organizer}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
