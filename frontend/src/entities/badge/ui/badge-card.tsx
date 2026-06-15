import Image from "next/image"
import { Check, HelpCircle, Lock, Trophy } from "lucide-react"
import type { BadgeDefinition } from "@/entities/badge"
import { cn } from "@/lib/utils"
import { badgeImages } from "./badge-assets"

interface BadgeCardProps {
  readonly badge: BadgeDefinition
  readonly isGeneral?: boolean
}

export function BadgeCard({ badge, isGeneral = false }: BadgeCardProps) {
  const imageUrl = badgeImages[badge.id]

  return (
    <div
      className={cn(
        "group relative flex aspect-[3/4.2] flex-col justify-between overflow-hidden rounded-md  bg-white transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md",
        badge.unlocked
          ? "border-slate-200"
          : "border-slate-100 bg-slate-50/50 opacity-90",
        badge.isActive && isGeneral && "ring-2 ring-primary/45",
      )}
    >
      <BadgeCardImage
        badge={badge}
        imageUrl={imageUrl}
        isGeneral={isGeneral}
      />
      <BadgeCardBody badge={badge} />
    </div>
  )
}

function BadgeCardImage({
  badge,
  imageUrl,
  isGeneral,
}: {
  readonly badge: BadgeDefinition
  readonly imageUrl?: string
  readonly isGeneral: boolean
}) {
  return (
    <div className="relative flex w-full flex-1 items-center justify-center overflow-hidden bg-slate-50">
      {imageUrl ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200/50" />
          <Image
            src={imageUrl}
            alt={badge.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-all duration-500 group-hover:scale-105",
              badge.unlocked ? "filter-none" : "filter grayscale opacity-20 contrast-[0.85]",
            )}
          />
        </>
      ) : (
        <div className="absolute inset-0 flex select-none items-center justify-center bg-slate-100/60">
          <Trophy className="h-10 w-10 text-slate-300" />
        </div>
      )}

      {!badge.unlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/5 backdrop-blur-[0.5px]">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-slate-400 shadow-md">
            <Lock className="h-5 w-5 stroke-[2]" />
          </div>
        </div>
      )}

      {badge.unlocked && (
        <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
          <Check className="h-3.5 w-3.5 stroke-[3]" />
        </div>
      )}

      {badge.isActive && isGeneral && (
        <div className="absolute left-3 top-3 animate-pulse rounded bg-primary px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white shadow-sm">
          Đang dùng
        </div>
      )}
    </div>
  )
}

function BadgeCardBody({ badge }: { readonly badge: BadgeDefinition }) {
  return (
    <div
      className={cn(
        "flex min-h-[110px] flex-col justify-between border-t bg-white p-4",
        !badge.unlocked && "bg-slate-50/50",
      )}
    >
      <div>
        <div
          className={cn(
            "text-xs font-bold leading-snug transition-colors duration-200",
            badge.unlocked ? "text-slate-800 group-hover:text-primary" : "text-slate-500",
          )}
        >
          {badge.name}
        </div>
        <p className="mt-1 min-h-[30px] text-[10px] leading-relaxed text-muted-foreground line-clamp-2">
          {badge.description}
        </p>
      </div>
      <BadgeCardFooter badge={badge} />
    </div>
  )
}

function BadgeCardFooter({ badge }: { readonly badge: BadgeDefinition }) {
  return (
    <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 text-[9px] font-semibold text-slate-500">
      <span
        className="flex max-w-[125px] items-center gap-1 truncate"
        title={badge.requirement}
      >
        <HelpCircle className="h-3 w-3 shrink-0 text-slate-400/80" />
        <span className="truncate">
          {badge.requirement.includes("độc nhất")
            ? "Tiêu chí cao nhất"
            : badge.requirement.split(" (")[0]}
        </span>
      </span>
      <span
        className={cn(
          "rounded-full px-1.5 py-0.5 text-[8px] font-bold",
          badge.unlocked
            ? "bg-emerald-50 text-emerald-600"
            : "bg-slate-200/60 text-slate-500",
        )}
      >
        {badge.unlocked ? "Đã đạt" : "Chưa đạt"}
      </span>
    </div>
  )
}
