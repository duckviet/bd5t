"use client"

import { useEffect, useState } from "react"
import { Search, X, ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CRITERIA } from "@/lib/constants"
import { useDebounce } from "@/hooks/use-debounce"

export type AwardSortValue = "title_asc" | "title_desc" | "students_desc" | "students_asc" | "awards_desc"
export type AwardStatusFilter = "all" | "awarded" | "not_awarded"
export type AwardReviewLevelFilter = "all" | "TRUONG" | "DHQGHN" | "THANH_PHO" | "TRUNG_UONG"
export type AwardCriteriaFilter = "all" | "DAO_DUC" | "HOC_TAP" | "THE_LUC" | "TINH_NGUYEN" | "HOI_NHAP"

interface AwardFiltersProps {
  searchQuery: string
  reviewLevelFilter: AwardReviewLevelFilter
  criteriaFilter: AwardCriteriaFilter
  awardStatusFilter: AwardStatusFilter
  sort: AwardSortValue
  onSearchChange: (value: string) => void
  onReviewLevelChange: (value: AwardReviewLevelFilter) => void
  onCriteriaChange: (value: AwardCriteriaFilter) => void
  onAwardStatusChange: (value: AwardStatusFilter) => void
  onSortChange: (value: AwardSortValue) => void
  onClear: () => void
}

const SORT_OPTIONS: Array<{ value: AwardSortValue; label: string }> = [
  { value: "title_asc", label: "Tên hoạt động A-Z" },
  { value: "title_desc", label: "Tên hoạt động Z-A" },
  { value: "students_desc", label: "Nhiều sinh viên nhất" },
  { value: "students_asc", label: "Ít sinh viên nhất" },
  { value: "awards_desc", label: "Nhiều giải nhất" },
]

const REVIEW_LEVEL_OPTIONS: Array<{ value: AwardReviewLevelFilter; label: string }> = [
  { value: "all", label: "Tất cả cấp xét" },
  { value: "TRUONG", label: "Cấp Trường" },
  { value: "DHQGHN", label: "Cấp ĐHQGHN" },
  { value: "THANH_PHO", label: "Cấp Thành phố" },
  { value: "TRUNG_UONG", label: "Cấp Trung ương" },
]

export function AwardFilters({
  searchQuery,
  reviewLevelFilter,
  criteriaFilter,
  awardStatusFilter,
  sort,
  onSearchChange,
  onReviewLevelChange,
  onCriteriaChange,
  onAwardStatusChange,
  onSortChange,
  onClear,
}: AwardFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [localSearch, setLocalSearch] = useState(searchQuery)
  const debouncedSearch = useDebounce(localSearch, 400)

  useEffect(() => {
    setLocalSearch(searchQuery)
  }, [searchQuery])

  useEffect(() => {
    if (debouncedSearch !== searchQuery) {
      onSearchChange(debouncedSearch)
    }
  }, [debouncedSearch, searchQuery, onSearchChange])

  const hasActiveFilters =
    searchQuery !== "" ||
    reviewLevelFilter !== "all" ||
    criteriaFilter !== "all" ||
    awardStatusFilter !== "all"

  const activeAdvancedCount = [
    criteriaFilter !== "all",
    awardStatusFilter !== "all",
  ].filter(Boolean).length

  const activeChips = []

  if (searchQuery.trim()) {
    activeChips.push({
      key: "search",
      label: `Tìm kiếm: "${searchQuery}"`,
      onClear: () => onSearchChange(""),
    })
  }

  if (reviewLevelFilter !== "all") {
    const option = REVIEW_LEVEL_OPTIONS.find((o) => o.value === reviewLevelFilter)
    activeChips.push({
      key: "reviewLevel",
      label: `Cấp xét: ${option ? option.label : reviewLevelFilter}`,
      onClear: () => onReviewLevelChange("all"),
    })
  }

  if (criteriaFilter !== "all") {
    const label = CRITERIA[criteriaFilter as keyof typeof CRITERIA] || criteriaFilter
    activeChips.push({
      key: "criteria",
      label: `Tiêu chí: ${label}`,
      onClear: () => onCriteriaChange("all"),
    })
  }

  if (awardStatusFilter !== "all") {
    activeChips.push({
      key: "awardStatus",
      label: awardStatusFilter === "awarded" ? "Trạng thái: Có sinh viên đạt giải" : "Trạng thái: Chưa có sinh viên đạt giải",
      onClear: () => onAwardStatusChange("all"),
    })
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm hoạt động..."
              className="pl-10"
              value={localSearch}
              onChange={(event) => setLocalSearch(event.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="w-[180px]">
              <Select value={reviewLevelFilter} onValueChange={(value) => onReviewLevelChange(value as AwardReviewLevelFilter)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REVIEW_LEVEL_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => setIsExpanded(!isExpanded)}
              className={`gap-2 ${activeAdvancedCount > 0
                  ? "border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary"
                  : ""
                }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Bộ lọc nâng cao</span>
              {activeAdvancedCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                  {activeAdvancedCount}
                </span>
              )}
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={onClear}
              disabled={!hasActiveFilters}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Xóa lọc
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="grid gap-4 border-t pt-4 sm:grid-cols-3">
            {/* Tiêu chí */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Tiêu chí</span>
              <Select value={criteriaFilter} onValueChange={(value) => onCriteriaChange(value as AwardCriteriaFilter)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả tiêu chí</SelectItem>
                  {Object.entries(CRITERIA).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Trạng thái giải thưởng */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Trạng thái giải thưởng</span>
              <Select value={awardStatusFilter} onValueChange={(value) => onAwardStatusChange(value as AwardStatusFilter)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="awarded">Có sinh viên đạt giải</SelectItem>
                  <SelectItem value="not_awarded">Chưa có sinh viên đạt giải</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sắp xếp */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Sắp xếp</span>
              <Select value={sort} onValueChange={(value) => onSortChange(value as AwardSortValue)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {activeChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-t pt-3 mt-1">
            <span className="text-xs font-medium text-muted-foreground mr-1">Đang lọc:</span>
            {activeChips.map((chip) => (
              <div
                key={chip.key}
                className="inline-flex items-center gap-1 rounded-full bg-secondary/80 px-2.5 py-0.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/100 border border-muted-foreground/10"
              >
                <span>{chip.label}</span>
                <button
                  type="button"
                  onClick={chip.onClear}
                  className="ml-1 rounded-full p-0.5 outline-none transition-colors hover:bg-muted-foreground/20 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground font-normal"
            >
              Xóa tất cả
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
