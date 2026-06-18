import { memo } from "react"
import { Trophy } from "lucide-react"
import type { BadgeDefinition } from "@/entities/badge"
import { badgeIconImages } from "@/entities/badge/ui/badge-assets"

interface BadgeCollectionProps {
  readonly unlockedBadges: readonly BadgeDefinition[]
}

export const BadgeCollection = memo(function BadgeCollection({
  unlockedBadges,
}: BadgeCollectionProps) {
  if (unlockedBadges.length === 0) return null

  return (
    <div className="mt-6 border-t pt-6 space-y-3">
      <div className="text-sm font-semibold text-slate-500">
        Huy hiệu đã thu thập ({unlockedBadges.length})
      </div>
      <div className="flex flex-row items-center pl-3 bg-gray-50 p-2 rounded-md">
        {unlockedBadges.map((badge) => {
          const imgUrl = badgeIconImages[badge.id]
          return (
            <div
              key={badge.id}
              className="relative flex h-14 w-14 shrink-0 -ml-5 first:ml-0 items-center justify-center rounded-full group cursor-help z-10 hover:z-20"
            >
              {imgUrl ? (
                <img
                  src={imgUrl}
                  alt={badge.name}
                  loading="lazy"
                  className="w-11 h-11 object-contain select-none pointer-events-none badge-outline transition duration-200 ease-out group-hover:-translate-y-1.5 group-hover:scale-110"
                />
              ) : (
                <Trophy className="h-6 w-6 text-slate-300 transition duration-200 ease-out group-hover:-translate-y-1.5 group-hover:scale-110" />
              )}

              {/* Tooltip with transition to prevent reflow */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 flex flex-col items-center bg-white rounded-lg px-2.5 py-1.5 text-center shadow-lg pointer-events-none opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition duration-200 ease-out will-change-transform z-50 min-w-[140px] max-w-[180px]">
                <span className="text-[10px] font-bold text-primary tracking-wide">
                  {badge.name}
                </span>
                <span className="text-[9px] text-slate-400 leading-normal mt-0.5">
                  {badge.description}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})
