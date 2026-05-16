"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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

type ActivitiesListState = {
  searchTerm: string;
  selectedCriterion: string;
  selectedLevel: string;
  selectedStatus: string;
  scrollY: number;
};

const ACTIVITIES_LIST_STATE_KEY = "activities:list-state";
const ACTIVITIES_RESTORE_SCROLL_KEY = "activities:restore-scroll";

const DEFAULT_LIST_STATE: ActivitiesListState = {
  searchTerm: "",
  selectedCriterion: "all",
  selectedLevel: "all",
  selectedStatus: "all",
  scrollY: 0,
};

function getStoredActivitiesListState(): ActivitiesListState {
  if (typeof window === "undefined") {
    return DEFAULT_LIST_STATE;
  }

  try {
    const stored = window.sessionStorage.getItem(ACTIVITIES_LIST_STATE_KEY);
    if (!stored) {
      return DEFAULT_LIST_STATE;
    }

    const parsed = JSON.parse(stored) as Partial<ActivitiesListState>;

    return {
      searchTerm:
        typeof parsed.searchTerm === "string"
          ? parsed.searchTerm
          : DEFAULT_LIST_STATE.searchTerm,
      selectedCriterion:
        typeof parsed.selectedCriterion === "string"
          ? parsed.selectedCriterion
          : DEFAULT_LIST_STATE.selectedCriterion,
      selectedLevel:
        typeof parsed.selectedLevel === "string"
          ? parsed.selectedLevel
          : DEFAULT_LIST_STATE.selectedLevel,
      selectedStatus:
        typeof parsed.selectedStatus === "string"
          ? parsed.selectedStatus
          : DEFAULT_LIST_STATE.selectedStatus,
      scrollY:
        typeof parsed.scrollY === "number"
          ? parsed.scrollY
          : DEFAULT_LIST_STATE.scrollY,
    };
  } catch {
    return DEFAULT_LIST_STATE;
  }
}

export function ActivitiesClientView({
  activities,
  hasError = false,
}: ActivitiesClientViewProps) {
  const initialListState = useMemo(() => getStoredActivitiesListState(), []);
  const [searchTerm, setSearchTerm] = useState(initialListState.searchTerm);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(
    initialListState.searchTerm,
  );
  const [selectedCriterion, setSelectedCriterion] = useState(
    initialListState.selectedCriterion,
  );
  const [selectedLevel, setSelectedLevel] = useState(
    initialListState.selectedLevel,
  );
  const [selectedStatus, setSelectedStatus] = useState(
    initialListState.selectedStatus,
  );
  const [shouldRestoreScroll, setShouldRestoreScroll] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      window.sessionStorage.getItem(ACTIVITIES_RESTORE_SCROLL_KEY) === "true"
    );
  });

  const saveListState = useCallback(() => {
    if (typeof window === "undefined") return;

    const nextState: ActivitiesListState = {
      searchTerm,
      selectedCriterion,
      selectedLevel,
      selectedStatus,
      scrollY: window.scrollY,
    };

    window.sessionStorage.setItem(
      ACTIVITIES_LIST_STATE_KEY,
      JSON.stringify(nextState),
    );
  }, [searchTerm, selectedCriterion, selectedLevel, selectedStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (shouldRestoreScroll) return;

    let scrollTimer: ReturnType<typeof setTimeout> | undefined;

    const saveAfterScroll = () => {
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(saveListState, 150);
    };
    const saveBeforeLeaving = () => saveListState();

    saveListState();
    window.addEventListener("scroll", saveAfterScroll, { passive: true });
    window.addEventListener("pagehide", saveBeforeLeaving);
    document.addEventListener("visibilitychange", saveBeforeLeaving);

    return () => {
      if (scrollTimer) clearTimeout(scrollTimer);
      window.removeEventListener("scroll", saveAfterScroll);
      window.removeEventListener("pagehide", saveBeforeLeaving);
      document.removeEventListener("visibilitychange", saveBeforeLeaving);
    };
  }, [saveListState, shouldRestoreScroll]);

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

  useEffect(() => {
    if (!shouldRestoreScroll) return;

    const { scrollY } = getStoredActivitiesListState();
    window.sessionStorage.removeItem(ACTIVITIES_RESTORE_SCROLL_KEY);

    const frameId = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
        setShouldRestoreScroll(false);
      });
    });

    const timeoutId = window.setTimeout(() => {
      window.scrollTo(0, scrollY);
    }, 250);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
    };
  }, [filteredActivities.length, shouldRestoreScroll]);

  const markActivityDetailNavigation = () => {
    saveListState();
    window.sessionStorage.setItem(ACTIVITIES_RESTORE_SCROLL_KEY, "true");
  };

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
        <ActivityGrid
          activities={filteredActivities}
          onViewDetails={markActivityDetailNavigation}
        />
      )}
    </>
  );
}
