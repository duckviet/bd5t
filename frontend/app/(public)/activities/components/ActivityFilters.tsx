"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, ListFilter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CRITERIA, REVIEW_LEVELS } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface ActivityFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedCriterion: string
  onCriterionChange: (value: string) => void
  selectedLevel: string
  onLevelChange: (value: string) => void
  selectedStatus: string
  onStatusChange: (value: string) => void
  totalResults: number
}

const STATUS_OPTIONS = [
  { label: "Đang mở", value: "OPEN" },
  { label: "Sắp diễn ra", value: "UPCOMING" },
  { label: "Đã kết thúc", value: "ENDED" },
]

export function ActivityFilters({
  searchTerm,
  onSearchChange,
  selectedCriterion,
  onCriterionChange,
  selectedLevel,
  onLevelChange,
  selectedStatus,
  onStatusChange,
  totalResults,
}: ActivityFiltersProps) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 space-y-6">
      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
        <Input
          placeholder="Tìm hoạt động theo tên..."
          className="pl-14 h-14 rounded-full border-slate-200 bg-slate-50/50 focus-visible:ring-primary/20 focus-visible:bg-white transition-all text-lg"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="space-y-4 pt-2">
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
            onClick={() => onCriterionChange("all")}
          >
            Tất cả
          </Button>
          {(Object.entries(CRITERIA) as [string, string][]).map(([key, label]) => (
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
              onClick={() => onCriterionChange(key)}
            >
              {label.replace(" tốt", "")}
            </Button>
          ))}
        </div>

        <div className="h-px bg-slate-100 mx-1" />

        <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-8">
          <div className="flex items-center gap-4 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 w-12 flex-shrink-0">
              Cấp
            </span>
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              <Button
                variant={selectedLevel === "all" ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "rounded-full px-4 h-8 text-xs font-medium whitespace-nowrap",
                  selectedLevel === "all"
                    ? "bg-primary/90 text-white"
                    : "text-slate-500 hover:bg-slate-100",
                )}
                onClick={() => onLevelChange("all")}
              >
                Tất cả cấp
              </Button>
              {(Object.entries(REVIEW_LEVELS) as [string, string][]).map(([key, label]) => (
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
                  onClick={() => onLevelChange(key)}
                >
                  {label.replace("Cấp ", "")}
                </Button>
              ))}
            </div>
          </div>

          <div className="hidden lg:block w-px h-8 bg-slate-100" />

          <div className="flex items-center gap-4 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 w-20 flex-shrink-0">
              Trạng thái
            </span>
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              <Button
                variant={selectedStatus === "all" ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "rounded-full px-4 h-8 text-xs font-medium whitespace-nowrap",
                  selectedStatus === "all"
                    ? "bg-primary/90 text-white"
                    : "text-slate-500 hover:bg-slate-100",
                )}
                onClick={() => onStatusChange("all")}
              >
                Tất cả
              </Button>
              {STATUS_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  variant={selectedStatus === opt.value ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "rounded-full px-4 h-8 text-xs font-medium whitespace-nowrap",
                    selectedStatus === opt.value
                      ? "bg-primary/90 text-white"
                      : "text-slate-500 hover:bg-slate-100",
                  )}
                  onClick={() => onStatusChange(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100">
        <p className="text-sm text-slate-500">
          Tìm thấy{" "}
          <span className="font-semibold text-slate-900">{totalResults}</span>{" "}
          hoạt động
        </p>
      </div>
    </div>
  )
}