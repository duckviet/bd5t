"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { CRITERIA } from "@/lib/constants"
import { Search, X } from "lucide-react"
import type { UnitItem } from "@/services/generated/api"

interface ActivityFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  criteriaFilter: string
  onCriteriaFilterChange: (value: string) => void
  reviewLevelFilter: string
  onReviewLevelFilterChange: (value: string) => void
  unitFilter: string
  onUnitFilterChange: (value: string) => void
  startDateFrom: string
  onStartDateFromChange: (value: string) => void
  startDateTo: string
  onStartDateToChange: (value: string) => void
  units: UnitItem[]
  onClear: () => void
}

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "active", label: "Đang hoạt động" },
  { value: "inactive", label: "Nháp" },
]

const REVIEW_LEVEL_OPTIONS = [
  { value: "all", label: "Tất cả cấp" },
  { value: "TRUONG", label: "Cấp Trường" },
  { value: "DHQGHN", label: "Cấp ĐHQGHN" },
  { value: "THANH_PHO", label: "Cấp Thành phố" },
  { value: "TRUNG_UONG", label: "Cấp Trung ương" },
]

export function ActivityFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  criteriaFilter,
  onCriteriaFilterChange,
  reviewLevelFilter,
  onReviewLevelFilterChange,
  unitFilter,
  onUnitFilterChange,
  startDateFrom,
  onStartDateFromChange,
  startDateTo,
  onStartDateToChange,
  units,
  onClear,
}: ActivityFiltersProps) {
  return (
    <div className="space-y-3 rounded-lg border bg-white p-4">
      <div className="grid gap-3 lg:grid-cols-[minmax(260px,1.4fr)_repeat(3,minmax(160px,1fr))]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm tên hoạt động, mô tả, đơn vị..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={reviewLevelFilter} onValueChange={onReviewLevelFilterChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {REVIEW_LEVEL_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={criteriaFilter} onValueChange={onCriteriaFilterChange}>
          <SelectTrigger>
            <SelectValue placeholder="Tiêu chí" />
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

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(2,160px)_120px]">
        {/* <Select value={unitFilter} onValueChange={onUnitFilterChange}>
          <SelectTrigger>
            <SelectValue placeholder="Đơn vị tổ chức" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả đơn vị</SelectItem>
            {units.map((unit) => (
              <SelectItem key={unit.id} value={unit.id || "all"}>
                {unit.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select> */}
        <Input
          type="date"
          value={startDateFrom}
          onChange={(e) => onStartDateFromChange(e.target.value)}
          aria-label="Từ ngày bắt đầu"
        />
        <Input
          type="date"
          value={startDateTo}
          onChange={(e) => onStartDateToChange(e.target.value)}
          aria-label="Đến ngày bắt đầu"
        />
        <Button variant="outline" onClick={onClear} className="gap-2">
          <X className="h-4 w-4" />
          Xóa lọc
        </Button>
      </div>
    </div>
  )
}
