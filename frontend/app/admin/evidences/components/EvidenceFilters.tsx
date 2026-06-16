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
import type { UnitItem, ListAdminEvidencesSort, EvidenceItemStatus, ListAdminEvidencesCriteria } from "@/services/generated/api"
import { useDebounce } from "@/hooks/use-debounce"

type StatusFilter = EvidenceItemStatus | "all"
type CriteriaFilter = ListAdminEvidencesCriteria | "all"
type SortValue = ListAdminEvidencesSort

interface EvidenceFiltersProps {
  searchQuery: string
  statusFilter: StatusFilter
  criteriaFilter: CriteriaFilter
  submittedFrom: string
  submittedTo: string
  unitId: string
  className?: string
  sort: SortValue
  units: UnitItem[]
  onSearchChange: (value: string) => void
  onStatusChange: (value: StatusFilter) => void
  onCriteriaChange: (value: CriteriaFilter) => void
  onSubmittedFromChange: (value: string) => void
  onSubmittedToChange: (value: string) => void
  onUnitChange: (value: string) => void
  onClassNameChange: (value: string) => void
  onSortChange: (value: SortValue) => void
  onClear: () => void
}

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "pending", label: "Chờ duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "rejected", label: "Từ chối" },
]

const SORT_OPTIONS: Array<{ value: SortValue; label: string }> = [
  { value: "priority", label: "Ưu tiên chờ duyệt" },
  { value: "createdAt_desc", label: "Mới nhất" },
  { value: "createdAt_asc", label: "Cũ nhất" },
]

export function EvidenceFilters({
  searchQuery,
  statusFilter,
  criteriaFilter,
  submittedFrom,
  submittedTo,
  unitId,
  className = "",
  sort,
  units,
  onSearchChange,
  onStatusChange,
  onCriteriaChange,
  onSubmittedFromChange,
  onSubmittedToChange,
  onUnitChange,
  onClassNameChange,
  onSortChange,
  onClear,
}: EvidenceFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [localSearch, setLocalSearch] = useState(searchQuery)
  const [localClass, setLocalClass] = useState(className)

  const debouncedSearch = useDebounce(localSearch, 500)
  const debouncedClass = useDebounce(localClass, 500)

  // Sync localSearch with parent searchQuery when parent changes it (e.g. on clear or tag click)
  useEffect(() => {
    setLocalSearch(searchQuery)
  }, [searchQuery])

  // Sync localClass with parent className when parent changes it (e.g. on clear or tag click)
  useEffect(() => {
    setLocalClass(className)
  }, [className])

  // Call parent search change callback when debounced search changes
  useEffect(() => {
    if (debouncedSearch !== searchQuery) {
      onSearchChange(debouncedSearch)
    }
  }, [debouncedSearch, searchQuery, onSearchChange])

  // Call parent class change callback when debounced class changes
  useEffect(() => {
    if (debouncedClass !== className) {
      onClassNameChange(debouncedClass)
    }
  }, [debouncedClass, className, onClassNameChange])

  const hasActiveFilters =
    searchQuery !== "" ||
    statusFilter !== "all" ||
    criteriaFilter !== "all" ||
    submittedFrom !== "" ||
    submittedTo !== "" ||
    unitId !== "all" ||
    className !== ""

  const activeAdvancedCount = [
    criteriaFilter !== "all",
    submittedFrom !== "",
    submittedTo !== "",
    unitId !== "all",
    className !== "",
  ].filter(Boolean).length

  const formatDateToShow = (dateStr: string) => {
    if (!dateStr) return ""
    const [year, month, day] = dateStr.split("-")
    if (!year || !month || !day) return dateStr
    return `${day}/${month}/${year}`
  }

  const activeChips = []

  if (searchQuery.trim()) {
    activeChips.push({
      key: "search",
      label: `Tìm kiếm: "${searchQuery}"`,
      onClear: () => onSearchChange(""),
    })
  }

  if (statusFilter !== "all") {
    const option = STATUS_OPTIONS.find((o) => o.value === statusFilter)
    activeChips.push({
      key: "status",
      label: option ? option.label : statusFilter,
      onClear: () => onStatusChange("all"),
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

  if (submittedFrom) {
    activeChips.push({
      key: "submittedFrom",
      label: `Từ ngày: ${formatDateToShow(submittedFrom)}`,
      onClear: () => onSubmittedFromChange(""),
    })
  }

  if (submittedTo) {
    activeChips.push({
      key: "submittedTo",
      label: `Đến ngày: ${formatDateToShow(submittedTo)}`,
      onClear: () => onSubmittedToChange(""),
    })
  }

  if (unitId !== "all") {
    const unit = units.find((u) => u.id === unitId)
    activeChips.push({
      key: "unit",
      label: `Khoa: ${unit ? unit.name : unitId}`,
      onClear: () => onUnitChange("all"),
    })
  }

  if (className.trim()) {
    activeChips.push({
      key: "className",
      label: `Lớp: ${className}`,
      onClear: () => onClassNameChange(""),
    })
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm hoạt động, sinh viên, mã SV..."
              className="pl-10"
              value={localSearch}
              onChange={(event) => setLocalSearch(event.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="w-[180px]">
              <Select value={statusFilter} onValueChange={(value) => onStatusChange(value as StatusFilter)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
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
          <div className="grid gap-4 border-t pt-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {/* Ngày nộp group */}
            <div className="flex flex-col gap-1.5 sm:col-span-2 md:col-span-2 lg:col-span-2">
              <span className="text-xs font-medium text-muted-foreground">Ngày nộp</span>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="flex flex-1 items-center gap-2">
                  <span className="text-xs text-muted-foreground shrink-0 w-6">Từ</span>
                  <Input
                    type="date"
                    value={submittedFrom}
                    onChange={(event) => onSubmittedFromChange(event.target.value)}
                    aria-label="Từ ngày"
                  />
                </div>
                <div className="flex flex-1 items-center gap-2">
                  <span className="text-xs text-muted-foreground shrink-0 w-6 text-right">Đến</span>
                  <Input
                    type="date"
                    value={submittedTo}
                    onChange={(event) => onSubmittedToChange(event.target.value)}
                    aria-label="Đến ngày"
                  />
                </div>
              </div>
            </div>

            {/* Tiêu chí */}
            <div className="flex flex-col gap-1.5 sm:col-span-1">
              <span className="text-xs font-medium text-muted-foreground">Tiêu chí</span>
              <Select value={criteriaFilter} onValueChange={(value) => onCriteriaChange(value as CriteriaFilter)}>
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

            {/* Khoa/đơn vị */}
            <div className="flex flex-col gap-1.5 sm:col-span-1">
              <span className="text-xs font-medium text-muted-foreground">Khoa/Đơn vị</span>
              <Select value={unitId} onValueChange={onUnitChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Khoa/đơn vị" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả khoa</SelectItem>
                  {units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id || "all"}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Lớp */}
            <div className="flex flex-col gap-1.5 sm:col-span-1">
              <span className="text-xs font-medium text-muted-foreground">Lớp</span>
              <Input
                placeholder="Nhập tên lớp..."
                value={localClass}
                onChange={(event) => setLocalClass(event.target.value)}
              />
            </div>

            {/* Sắp xếp */}
            <div className="flex flex-col gap-1.5 sm:col-span-1">
              <span className="text-xs font-medium text-muted-foreground">Sắp xếp</span>
              <Select value={sort} onValueChange={(value) => onSortChange(value as SortValue)}>
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
