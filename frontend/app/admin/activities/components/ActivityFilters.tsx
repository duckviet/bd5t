"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, X } from "lucide-react"
import { CRITERIA, REVIEW_LEVELS } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface ActivityFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  criteriaFilter: string[]
  onCriteriaFilterChange: (value: string[]) => void
  reviewLevelFilter: string
  onReviewLevelFilterChange: (value: string) => void
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
}: ActivityFiltersProps) {
  const toggleCriteria = (key: string) => {
    if (criteriaFilter.includes(key)) {
      onCriteriaFilterChange(criteriaFilter.filter((k) => k !== key))
    } else {
      onCriteriaFilterChange([...criteriaFilter, key])
    }
  }

  const clearCriteria = () => onCriteriaFilterChange([])

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm hoạt động..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-[160px]">
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
          <SelectTrigger className="w-[160px]">
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
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground font-medium shrink-0">Tiêu chí:</span>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(CRITERIA).map(([key, label]) => {
            const isSelected = criteriaFilter.includes(key)
            return (
              <Badge
                key={key}
                variant={isSelected ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-all text-xs",
                  isSelected ? "bg-primary text-white" : "hover:bg-slate-100"
                )}
                onClick={() => toggleCriteria(key)}
              >
                {label}
              </Badge>
            )
          })}
        </div>
        {criteriaFilter.length > 0 && (
          <button
            onClick={clearCriteria}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors ml-1"
          >
            <X className="h-3 w-3" />
            Xóa lọc
          </button>
        )}
      </div>
    </div>
  )
}