"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Calendar,
  MapPin,
  ExternalLink,
  ListFilter,
  Loader2,
} from "lucide-react";
import {
  CRITERIA,
  REVIEW_LEVELS, 
} from "@/lib/constants";
import { useListActivities } from "@/services/generated/api";
import { cn } from "@/lib/utils";

interface ActivityApiItem {
  id?: string;
  slug?: string;
  title?: string;
  shortDescription?: string;
  thumbnailUrl?: string | null;
  location?: string | null;
  targetAudience?: string | null;
  unitId?: string | null;
  unitName?: string | null;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  reviewLevel?: string;
}

export default function ActivitiesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedCriterion, setSelectedCriterion] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: _apiResponse, isLoading, error } = useListActivities({
    pageSize: 100,
  });

    const activities: ActivityApiItem[] = (_apiResponse as any)?.data  

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredActivities = useMemo(() => {
    const now = new Date();
    return activities?.filter((activity) => {
      const matchesSearch = activity.title
        ?.toLowerCase()
        .includes(debouncedSearchQuery.toLowerCase());

      const matchesLevel =
        selectedLevel === "all" || activity.reviewLevel === selectedLevel;

      const start = activity.startDate ? new Date(activity.startDate) : null;
      const end = activity.endDate ? new Date(activity.endDate) : null;
      let status = "";
      if (start && end) {
        if (now < start) status = "UPCOMING";
        else if (now > end) status = "ENDED";
        else status = "OPEN";
      }

      const matchesStatus =
        selectedStatus === "all" || status === selectedStatus;

      const matchesCriterion = selectedCriterion === "all";

      return matchesSearch && matchesCriterion && matchesLevel && matchesStatus;
    }) || [];
  }, [activities, debouncedSearchQuery, selectedCriterion, selectedLevel, selectedStatus]);

  const statusOptions = [
    { label: "Đang mở", value: "OPEN" },
    { label: "Sắp diễn ra", value: "UPCOMING" },
    { label: "Đã kết thúc", value: "ENDED" },
  ];

  return (
    <div className="min-h-screen py-12 bg-slate-50/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4 tracking-tight">
            Khám phá hoạt động
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Tìm kiếm và tham gia các hoạt động để tích lũy minh chứng cho danh
            hiệu Sinh viên 5 Tốt
          </p>
        </div>

        {/* Search & Filter Container */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 mb-12 space-y-6">
          {/* Search Bar */}
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Tìm hoạt động theo tên..."
              className="pl-14 h-14 rounded-full border-slate-200 bg-slate-50/50 focus-visible:ring-primary/20 focus-visible:bg-white transition-all text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-4 pt-2">
            {/* Row 1: Criteria */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex-shrink-0">
                <ListFilter className="h-4 w-4 text-slate-400" />
              </div>
              <Button
                variant={selectedCriterion === "all" ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "rounded-full px-5 h-9 font-medium transition-all",
                  selectedCriterion === "all"
                    ? "bg-primary shadow-md hover:bg-primary/90"
                    : "text-slate-600 hover:bg-slate-100",
                )}
                onClick={() => setSelectedCriterion("all")}
              >
                Tất cả
              </Button>
              {(Object.entries(CRITERIA) as [string, string][]).map(
                ([key, label]) => (
                  <Button
                    key={key}
                    variant={selectedCriterion === key ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "rounded-full px-5 h-9 font-medium whitespace-nowrap transition-all",
                      selectedCriterion === key
                        ? "bg-primary shadow-md hover:bg-primary/90"
                        : "text-slate-600 hover:bg-slate-100",
                    )}
                    onClick={() => setSelectedCriterion(key)}
                  >
                    {label.replace(" tốt", "")}
                  </Button>
                ),
              )}
            </div>

            <div className="h-px bg-slate-100 mx-1" />

            {/* Row 2: Level & Status */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-8">
              {/* Level Filter */}
              <div className="flex items-center gap-4 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 w-12 flex-shrink-0">
                  Cấp
                </span>
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <Button
                    variant={selectedLevel === "all" ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "rounded-full px-4 h-8 text-xs font-medium whitespace-nowrap",
                      selectedLevel === "all"
                        ? "bg-primary/90 text-white"
                        : "text-slate-500 hover:bg-slate-100",
                    )}
                    onClick={() => setSelectedLevel("all")}
                  >
                    Tất cả cấp
                  </Button>
                  {(Object.entries(REVIEW_LEVELS) as [string, string][]).map(
                    ([key, label]) => (
                      <Button
                        key={key}
                        variant={selectedLevel === key ? "default" : "ghost"}
                        size="sm"
                        className={cn(
                          "rounded-full px-4 h-8 text-xs font-medium whitespace-nowrap",
                          selectedLevel === key
                            ? "bg-primary/90 text-white"
                            : "text-slate-500 hover:bg-slate-100",
                        )}
                        onClick={() => setSelectedLevel(key)}
                      >
                        {label.replace("Cấp ", "")}
                      </Button>
                    ),
                  )}
                </div>
              </div>

              {/* Divider on desktop */}
              <div className="hidden lg:block w-px h-8 bg-slate-100" />

              {/* Status Filter */}
              <div className="flex items-center gap-4 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 w-20 flex-shrink-0">
                  Trạng thái
                </span>
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <Button
                    variant={selectedStatus === "all" ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "rounded-full px-4 h-8 text-xs font-medium whitespace-nowrap",
                      selectedStatus === "all"
                        ? "bg-primary/90 text-white"
                        : "text-slate-500 hover:bg-slate-100",
                    )}
                    onClick={() => setSelectedStatus("all")}
                  >
                    Tất cả
                  </Button>
                  {statusOptions.map((opt) => (
                    <Button
                      key={opt.value}
                      variant={
                        selectedStatus === opt.value ? "default" : "ghost"
                      }
                      size="sm"
                      className={cn(
                        "rounded-full px-4 h-8 text-xs font-medium whitespace-nowrap",
                        selectedStatus === opt.value
                          ? "bg-primary/90 text-white"
                          : "text-slate-500 hover:bg-slate-100",
                      )}
                      onClick={() => setSelectedStatus(opt.value)}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Tìm thấy{" "}
            <span className="font-semibold text-slate-900">
              {filteredActivities?.length}
            </span>{" "}
            hoạt động
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Đang tải hoạt động...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-300 flex w-full items-center justify-center flex-col gap-4">
            <p className="text-red-500 font-medium">Không thể tải hoạt động</p>
            <Button variant="link" onClick={() => window.location.reload()}>
              Thử lại
            </Button>
          </div>
        )}

        {/* Results */}
        {!isLoading && !error && filteredActivities.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-300 flex w-full items-center justify-center flex-col gap-4">
            <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mb-2">
              <Search className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">
              Không tìm thấy hoạt động nào phù hợp
            </p>
            <Button
              variant="link"
              onClick={() => {
                setSearchTerm("");
                setSelectedCriterion("all");
                setSelectedLevel("all");
                setSelectedStatus("all");
              }}
            >
              Xóa tất cả bộ lọc
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredActivities?.map((activity) => (
              <Card
                key={activity.id}
                className="overflow-hidden border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl group"
              >
                <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden">
                  {activity.thumbnailUrl ? (
                    <img
                      src={activity.thumbnailUrl}
                      alt={activity.slug || ""}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                      <Calendar className="h-12 w-12 text-slate-300" />
                    </div>
                  )}
                  {activity.unitName && (
                    <div className="absolute top-3 right-3">
                      <Badge
                        variant="secondary"
                        className="bg-white/90 backdrop-blur-sm text-primary border-none shadow-sm"
                      >
                        {activity.unitName}
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-5">
                  {activity.shortDescription && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <Badge
                        variant="outline"
                        className="text-[10px] uppercase tracking-wider py-0 px-2 font-bold border-primary/20 text-primary/80 bg-primary/5"
                      >
                        Hoạt động
                      </Badge>
                    </div>
                  )}
                  <h3 className="font-bold text-lg mb-3 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                    {activity.title}
                  </h3>
                  <div className="text-sm text-slate-500 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center">
                        <MapPin className="h-3 w-3" />
                      </div>
                      {activity?.location || "Toàn quốc"}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center">
                        <Calendar className="h-3 w-3" />
                      </div>
                      {activity.startDate && activity.endDate
                        ? `${new Date(activity.startDate).toLocaleDateString("vi-VN")} - ${new Date(activity.endDate).toLocaleDateString("vi-VN")}`
                        : "Chưa có ngày"}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-5 pt-0 flex gap-3">
                  <Link
                    href={`/activities/${activity.slug}`}
                    className="flex-1"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full rounded-xl border-slate-200 hover:bg-slate-50"
                    >
                      Chi tiết
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    className="w-full gap-2 rounded-xl bg-primary hover:bg-primary/90 shadow-sm shadow-primary/20"
                    onClick={() => {
                      if (activity.startDate && activity.endDate) {
                        alert("Chuyển đến trang đăng ký hoạt động");
                      }
                    }}
                  >
                    Tham gia
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
