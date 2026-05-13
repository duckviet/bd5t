"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, LayoutGrid, List } from "lucide-react"
import { CRITERIA, REVIEW_LEVELS, type CriterionType, type ReviewLevel } from "@/lib/constants"
import type { EvidenceViewType } from "../types"

interface EvidenceFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  filterStatus: string
  onStatusChange: (value: string) => void
  filterCriterion: string
  onCriterionChange: (value: string) => void
  filterLevel: string
  onLevelChange: (value: string) => void
  viewType: EvidenceViewType
  onViewTypeChange: (value: EvidenceViewType) => void
}

const criteriaKeys = Object.keys(CRITERIA) as CriterionType[]
const reviewLevelKeys = Object.keys(REVIEW_LEVELS) as ReviewLevel[]

export function EvidenceFilters({
  searchQuery,
  onSearchChange,
  filterStatus,
  onStatusChange,
  filterCriterion,
  onCriterionChange,
  filterLevel,
  onLevelChange,
  viewType,
  onViewTypeChange,
}: EvidenceFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm minh chứng..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={filterStatus} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full sm:w-[150px]">
          <SelectValue placeholder="Trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả</SelectItem>
          <SelectItem value="APPROVED">Đã duyệt</SelectItem>
          <SelectItem value="PENDING">Chờ duyệt</SelectItem>
          <SelectItem value="REJECTED">Bị từ chối</SelectItem>
        </SelectContent>
      </Select>
      <Select value={filterCriterion} onValueChange={onCriterionChange}>
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder="Tiêu chí" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả tiêu chí</SelectItem>
          {criteriaKeys.map((key) => (
            <SelectItem key={key} value={key}>{CRITERIA[key]}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={filterLevel} onValueChange={onLevelChange}>
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder="Cấp độ" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả cấp độ</SelectItem>
          {reviewLevelKeys.map((key) => (
            <SelectItem key={key} value={key}>{REVIEW_LEVELS[key]}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex items-center rounded-lg border border-border p-0.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onViewTypeChange("list")}
          className={`h-8 w-8 ${viewType === "list" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onViewTypeChange("grid")}
          className={`h-8 w-8 ${viewType === "grid" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
