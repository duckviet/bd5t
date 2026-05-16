"use client";

import { useState, useEffect, useMemo } from "react";
import type { ActivityItem } from "@/services/generated/api";
import {
  ActivityFilters,
  ActivityGrid,
  EmptyState,
  ErrorState,
} from "./index";

interface ActivitiesClientViewProps {
  activities: ActivityItem[];
  hasError?: boolean;
}

export function ActivitiesClientView({
  activities,
  hasError = false,
}: ActivitiesClientViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedCriterion, setSelectedCriterion] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredActivities = useMemo(() => {
    const now = new Date();
    return activities.filter((activity) => {
      const matchesSearch = (activity.title || "")
        .toLowerCase()
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

      const matchesStatus = selectedStatus === "all" || status === selectedStatus;
      const matchesCriterion =
        selectedCriterion === "all" ||
        (activity.criteria as string[])?.includes(selectedCriterion);

      return matchesSearch && matchesCriterion && matchesLevel && matchesStatus;
    });
  }, [
    activities,
    debouncedSearchQuery,
    selectedCriterion,
    selectedLevel,
    selectedStatus,
  ]);

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCriterion("all");
    setSelectedLevel("all");
    setSelectedStatus("all");
  };

  return (
    <>
      <div className="mb-12">
        <ActivityFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCriterion={selectedCriterion}
          onCriterionChange={setSelectedCriterion}
          selectedLevel={selectedLevel}
          onLevelChange={setSelectedLevel}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          totalResults={filteredActivities.length}
        />
      </div>

      <ErrorState hasError={hasError} />

      {!hasError && filteredActivities.length === 0 && (
        <EmptyState onClearFilters={clearAllFilters} />
      )}

      {!hasError && filteredActivities.length > 0 && (
        <ActivityGrid activities={filteredActivities} />
      )}
    </>
  );
}
