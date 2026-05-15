"use client"

import { useState, useEffect, useMemo } from "react"
import { useListActivities, type ActivityItem } from "@/services/generated/api"
import { ActivityFilters, ActivityGrid, EmptyState, LoadingState, ErrorState } from "./components"

export default function ActivitiesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [selectedCriterion, setSelectedCriterion] = useState("all")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")

  const { data: _apiResponse, isLoading, error } = useListActivities({
    pageSize: 100,
  })

  const activities: ActivityItem[] = (_apiResponse as { data: ActivityItem[] })?.data || []

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const filteredActivities = useMemo(() => {
    const now = new Date()
    return activities.filter((activity) => {
      const matchesSearch = activity.title?.toLowerCase().includes(debouncedSearchQuery.toLowerCase())

      const matchesLevel =
        selectedLevel === "all" || activity.reviewLevel === selectedLevel

      const start = activity.startDate ? new Date(activity.startDate) : null
      const end = activity.endDate ? new Date(activity.endDate) : null
      let status = ""
      if (start && end) {
        if (now < start) status = "UPCOMING"
        else if (now > end) status = "ENDED"
        else status = "OPEN"
      }

      const matchesStatus =
        selectedStatus === "all" || status === selectedStatus

      const matchesCriterion =
        selectedCriterion === "all" ||
        (activity.criteria as string[])?.includes(selectedCriterion)

      return matchesSearch && matchesCriterion && matchesLevel && matchesStatus
    })
  }, [activities, debouncedSearchQuery, selectedCriterion, selectedLevel, selectedStatus])

  const clearAllFilters = () => {
    setSearchTerm("")
    setSelectedCriterion("all")
    setSelectedLevel("all")
    setSelectedStatus("all")
  }

  return (
    <div className="min-h-screen py-12 bg-slate-50/50">
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

        <LoadingState isLoading={isLoading} />
        <ErrorState hasError={!!error} />

        {!isLoading && !error && filteredActivities.length === 0 && (
          <EmptyState onClearFilters={clearAllFilters} />
        )}

        {!isLoading && !error && filteredActivities.length > 0 && (
          <ActivityGrid activities={filteredActivities} />
        )}
      </div>
    </div>
  )
}