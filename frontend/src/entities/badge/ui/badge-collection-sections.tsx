import { Award, Trophy } from "lucide-react"
import type { BadgeDefinition } from "@/entities/badge"
import { cn } from "@/lib/utils"

export type BadgeTab = "general" | "specific"

interface BadgeTabsProps {
  readonly activeTab: BadgeTab
  readonly onTabChange: (tab: BadgeTab) => void
}

export function BadgeTabs({ activeTab, onTabChange }: BadgeTabsProps) {
  return (
    <div className="flex gap-1.5 rounded-lg bg-slate-100 p-1">
      {(["general", "specific"] as const).map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={cn(
            "rounded-md px-3 py-1 text-xs font-semibold transition-all duration-200",
            activeTab === tab
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-600 hover:text-slate-800",
          )}
          type="button"
        >
          {tab === "general" ? "Chung" : "Tiêu chí"}
        </button>
      ))}
    </div>
  )
}

interface ActiveBadgesSummaryProps {
  readonly generalBadge?: BadgeDefinition
  readonly specificBadge?: BadgeDefinition
}

export function ActiveBadgesSummary({
  generalBadge,
  specificBadge,
}: ActiveBadgesSummaryProps) {
  return (
    <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-2">
      <ActiveBadgeItem
        icon={Trophy}
        label="Huy hiệu chung hiện tại"
        name={generalBadge?.name ?? "Chưa có"}
        iconClassName="bg-primary/10 text-primary"
      />
      <ActiveBadgeItem
        icon={Award}
        label="Huy hiệu tiêu chí hiện tại"
        name={specificBadge?.name ?? "Chưa mở khóa"}
        iconClassName="bg-amber-500/10 text-amber-600"
        className="border-t border-slate-200 pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0"
      />
    </div>
  )
}

interface ActiveBadgeItemProps {
  readonly icon: typeof Trophy
  readonly label: string
  readonly name: string
  readonly iconClassName: string
  readonly className?: string
}

function ActiveBadgeItem({
  icon: Icon,
  label,
  name,
  iconClassName,
  className,
}: ActiveBadgeItemProps) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
          iconClassName,
        )}
      >
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </div>
        <div className="mt-0.5 text-sm font-extrabold text-slate-700">{name}</div>
      </div>
    </div>
  )
}
