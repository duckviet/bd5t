"use client"

import { Search, X } from "lucide-react"
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
  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(260px,1.4fr)_repeat(3,minmax(150px,1fr))]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm hoạt động, sinh viên, mã SV..."
              className="pl-10"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>

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

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Input
            type="date"
            value={submittedFrom}
            onChange={(event) => onSubmittedFromChange(event.target.value)}
            aria-label="Từ ngày"
          />
          <Input
            type="date"
            value={submittedTo}
            onChange={(event) => onSubmittedToChange(event.target.value)}
            aria-label="Đến ngày"
          />
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
          <Input
            placeholder="Lớp"
            value={className}
            onChange={(event) => onClassNameChange(event.target.value)}
          />
          <Button variant="outline" onClick={onClear} className="gap-2">
            <X className="h-4 w-4" />
            Xóa lọc
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
